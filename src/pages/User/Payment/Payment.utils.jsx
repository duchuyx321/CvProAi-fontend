//các hàm xử lý chuỗi, format dữ liệu, kết nối realtime, trích xuất id, chuẩn hóa dữ liệu order...
import { PAYMENT_METHOD, REALTIME_CONNECT_TIMEOUT_MS, SAFE_ID_PATTERN, STATUS_ALIAS } from './Payment.constants';

export const toSafeNumber = (value, fallback = 0) => {
    const parsed = Number(String(value ?? '').replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const firstNotEmpty = (...values) => {
    for (const value of values) {
        if (value !== null && value !== undefined && value !== '') {
            return value;
        }
    }

    return null;
};

export const isSafeId = (value) => SAFE_ID_PATTERN.test(String(value || '').trim());

export const extractIdFromPath = (value) => {
    const path = String(value || '').trim();

    if (!path) {
        return null;
    }

    const match = path.match(/\/([^/?#]+)(?:\?.*)?$/);
    return match?.[1] || null;
};

export const normalizePaymentStatus = (value) => {
    const status = String(value || '').trim().toUpperCase();

    if (!status) {
        return null;
    }

    if (STATUS_ALIAS[status]) {
        return STATUS_ALIAS[status];
    }

    if (status.includes('PAID') || status.includes('SUCCESS')) {
        return 'PAID';
    }

    if (status.includes('PENDING') || status.includes('PROCESS')) {
        return 'PENDING';
    }

    if (status.includes('EXPIRE') || status.includes('TIMEOUT')) {
        return 'EXPIRED';
    }

    if (status.includes('FAIL') || status.includes('CANCEL') || status.includes('ERROR')) {
        return 'FAILED';
    }

    return status;
};

export const resolveOrderId = (source = {}) =>
    firstNotEmpty(
        source?.orderId,
        source?.order_id,
        source?.id,
        source?.orderCode,
        source?.order_code,
        source?.checkoutId,
        source?.checkout_id,
    ) || extractIdFromPath(firstNotEmpty(source?.checkoutPath, source?.path));

export const normalizeOrderForUi = (source = {}, pkg = null) => {
    const orderId = resolveOrderId(source);
    const orderCode = firstNotEmpty(source?.orderCode, source?.order_code, orderId);
    const plan = source?.plan && typeof source.plan === 'object' ? source.plan : null;
    const addOn =
        (source?.addOn && typeof source.addOn === 'object' ? source.addOn : null) ||
        (source?.addon && typeof source.addon === 'object' ? source.addon : null);

    return {
        ...source,
        orderId,
        orderCode,
        status: normalizePaymentStatus(firstNotEmpty(source?.status, source?.payment_status, source?.paymentStatus)),
        amount: toSafeNumber(
            firstNotEmpty(
                source?.amount,
                source?.total_amount,
                source?.totalAmount,
                source?.amount_cents,
                source?.price,
                plan?.price,
                pkg?.price,
            ),
            toSafeNumber(pkg?.price, 0),
        ),
        packageName: firstNotEmpty(source?.packageName, source?.package_name, source?.package?.name, plan?.name, pkg?.name),
        method: firstNotEmpty(source?.method, source?.payment_method, source?.paymentMethod, PAYMENT_METHOD.label),
        qrCodeUrl: firstNotEmpty(source?.qrCodeUrl, source?.qrCode, source?.qr_code_url, source?.qr_url, source?.qrUrl),
        bankName: firstNotEmpty(source?.bankName, source?.bank_name, source?.bank),
        accountName: firstNotEmpty(source?.accountName, source?.account_name, source?.receiver_name),
        accountNumber: firstNotEmpty(source?.accountNumber, source?.account_number, source?.acc, source?.receiver_account),
        transferContent: firstNotEmpty(
            source?.transferContent,
            source?.transfer_content,
            source?.payment_content,
            source?.description,
            source?.note,
            orderCode,
        ),
        paidAt: firstNotEmpty(source?.paidAt, source?.paid_at, source?.payment_date, source?.date, source?.updatedAt),
        checkoutPath: firstNotEmpty(source?.checkoutPath, source?.path),
        plan,
        addOn,
    };
};

const buildAbsoluteUrl = (pathOrUrl) => {
    const raw = String(pathOrUrl || '').trim();

    if (!raw) {
        return null;
    }

    const baseUrl = String(import.meta.env.VITE_HTTPS_BACKEND || window.location.origin || '').trim();

    try {
        return new URL(raw, baseUrl).toString();
    } catch {
        return null;
    }
};

const appendTokenQuery = (url) => {
    try {
        const token = String(localStorage.getItem('accessToken') || '')
            .replace(/^Bearer\s+/i, '')
            .trim();

        if (!token) {
            return url;
        }

        const parsed = new URL(url);
        if (!parsed.searchParams.has('access_token')) {
            parsed.searchParams.set('access_token', token);
        }
        if (!parsed.searchParams.has('token')) {
            parsed.searchParams.set('token', token);
        }

        return parsed.toString();
    } catch {
        return url;
    }
};

export const buildRealtimeCandidates = (orderInfo) => {
    const orderId = resolveOrderId(orderInfo);
    const checkoutPath = firstNotEmpty(orderInfo?.checkoutPath, orderInfo?.path);
    const candidates = [];

    if (checkoutPath) {
        candidates.push(checkoutPath);
        candidates.push(`${checkoutPath}/events`);
        candidates.push(`${checkoutPath}/stream`);
    }

    if (orderId) {
        const encodedOrderId = encodeURIComponent(orderId);
        candidates.push(`payment/orders/${encodedOrderId}/events`);
        candidates.push(`payment/orders/${encodedOrderId}/stream`);
        candidates.push(`payment/orders/${encodedOrderId}/realtime`);
    }

    const unique = Array.from(new Set(candidates.map((item) => String(item || '').trim()).filter(Boolean)));

    return unique
        .map(buildAbsoluteUrl)
        .filter(Boolean)
        .map(appendTokenQuery);
};

export const parseRealtimePayload = (rawValue) => {
    try {
        const parsed = JSON.parse(rawValue);
        const payload =
            (parsed?.data && typeof parsed.data === 'object' ? parsed.data : null) ||
            (parsed?.payload && typeof parsed.payload === 'object' ? parsed.payload : null) ||
            (parsed?.order && typeof parsed.order === 'object' ? parsed.order : null) ||
            (typeof parsed === 'object' && parsed !== null ? parsed : {});

        const status = normalizePaymentStatus(
            firstNotEmpty(payload?.status, payload?.payment_status, parsed?.status, parsed?.event, parsed?.type),
        );

        return {
            status,
            payload,
        };
    } catch {
        return {
            status: normalizePaymentStatus(rawValue),
            payload: {},
        };
    }
};

export const connectEventSource = (url, handlers = {}) =>
    new Promise((resolve, reject) => {
        let settled = false;
        const source = new EventSource(url, { withCredentials: true });

        const timeout = window.setTimeout(() => {
            if (settled) {
                return;
            }
            settled = true;
            source.close();
            reject(new Error('Realtime connection timeout'));
        }, REALTIME_CONNECT_TIMEOUT_MS);

        source.onopen = () => {
            if (settled) {
                return;
            }
            settled = true;
            window.clearTimeout(timeout);
            resolve(source);
        };

        source.onmessage = (event) => {
            handlers.onMessage?.(event?.data);
        };

        source.onerror = () => {
            if (settled) {
                handlers.onError?.(source);
                return;
            }

            settled = true;
            window.clearTimeout(timeout);
            source.close();
            reject(new Error('Realtime endpoint unavailable'));
        };
    });
