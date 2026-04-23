import * as Response from '~/utils/HttpsRequest';

const STATUS_ALIAS = {
    PAID: 'PAID',
    SUCCESS: 'PAID',
    COMPLETED: 'PAID',
    PENDING: 'PENDING',
    PROCESSING: 'PENDING',
    WAITING: 'PENDING',
    FAILED: 'FAILED',
    FAIL: 'FAILED',
    CANCELED: 'FAILED',
    CANCELLED: 'FAILED',
    CANCEL: 'FAILED',
    ERROR: 'FAILED',
    EXPIRED: 'EXPIRED',
    TIMEOUT: 'EXPIRED',
};

const firstNotEmpty = (...values) => {
    for (const value of values) {
        if (value !== null && value !== undefined && value !== '') {
            return value;
        }
    }

    return null;
};

const extractIdFromPath = (value) => {
    const path = String(value || '').trim();

    if (!path) {
        return null;
    }

    const match = path.match(/\/([^/?#]+)(?:\?.*)?$/);
    return match?.[1] || null;
};

const normalizeStatus = (value) => {
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

const normalizeAmount = (value) => {
    if (value === null || value === undefined || value === '') {
        return 0;
    }

    const parsed = Number(String(value).replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeOrderData = (source = {}) => {
    const orderCode = firstNotEmpty(source?.order_code, source?.orderCode, source?.code);
    const checkoutPath = firstNotEmpty(source?.path, source?.checkout_path, source?.checkoutPath);
    const fallbackPathId = extractIdFromPath(checkoutPath);

    const orderId =
        firstNotEmpty(
            source?.orderId,
            source?.order_id,
            source?.id,
            source?.checkout_id,
            source?.checkoutId,
            orderCode,
            fallbackPathId,
        ) || null;

    const planData = source?.plan && typeof source.plan === 'object' ? source.plan : null;
    const addOnData =
        (source?.addon && typeof source.addon === 'object' ? source.addon : null) ||
        (source?.addOn && typeof source.addOn === 'object' ? source.addOn : null);

    const amount = normalizeAmount(
        firstNotEmpty(
            source?.amount,
            source?.total_amount,
            source?.amount_cents,
            source?.totalAmount,
            source?.price,
            planData?.price,
        ),
    );

    return {
        orderId,
        orderCode: orderCode || orderId || null,
        status: normalizeStatus(
            firstNotEmpty(source?.status, source?.payment_status, source?.paymentStatus, source?.state),
        ),
        amount,
        packageName:
            firstNotEmpty(source?.packageName, source?.package_name, source?.package?.name, planData?.name) || null,
        method:
            firstNotEmpty(source?.method, source?.payment_method, source?.method_name, source?.paymentMethod, 'SePay'),
        qrCodeUrl:
            firstNotEmpty(source?.qrCodeUrl, source?.qr_code_url, source?.qrUrl, source?.qr_url, source?.qrCode) ||
            null,
        paidAt:
            firstNotEmpty(source?.paidAt, source?.paid_at, source?.payment_date, source?.date, source?.updatedAt) ||
            null,
        bankName: firstNotEmpty(source?.bankName, source?.bank_name, source?.bank, source?.bank_info?.name) || null,
        accountName:
            firstNotEmpty(
                source?.accountName,
                source?.account_name,
                source?.receiver_name,
                source?.beneficiary_name,
                source?.bank_info?.account_name,
            ) || null,
        accountNumber:
            firstNotEmpty(
                source?.accountNumber,
                source?.account_number,
                source?.bank_account,
                source?.receiver_account,
                source?.bank_info?.account_number,
                source?.acc,
            ) || null,
        transferContent:
            firstNotEmpty(
                source?.transferContent,
                source?.transfer_content,
                source?.payment_content,
                source?.description,
                source?.note,
                orderCode,
            ) || null,
        plan: planData,
        addOn: addOnData,
        checkoutPath: checkoutPath || null,
        expiresAt: firstNotEmpty(source?.expiresAt, source?.expiredAt, source?.expires_at, source?.expired_at) || null,
    };
};

const buildErrorResponse = (error) => {
    const status = error?.status || error?.response?.status;
    const data = error?.response?.data;

    return {
        ...(data || {}),
        success: false,
        status,
    };
};

const mapResponseData = (res) => {
    const raw = res?.data ?? res ?? {};
    const message = res?.message || res?.messsage || raw?.message || raw?.messsage || '';

    return {
        ...(res || {}),
        message,
        data: normalizeOrderData(raw),
    };
};

// export const createPaymentOrder = async (payload) => {
//     try {
//         const res = await Response.POST('payment/orders', payload);
//         return mapResponseData(res);
//     } catch (error) {
//         return buildErrorResponse(error);
//     }
// };

// export const getPaymentOrderStatus = async (orderId) => {
//     try {
//         const res = await Response.GET(`payment/orders/${orderId}/status`);
//         return mapResponseData(res);
//     } catch (error) {
//         return buildErrorResponse(error);
//     }
// };

// export const getPaymentOrderDetails = async (orderId) => {
//     try {
//         const res = await Response.GET(`payment/orders/${orderId}`);
//         return mapResponseData(res);
//     } catch (error) {
//         return buildErrorResponse(error);
//     }
// };


// ==========================================
// MOCK DATA ĐỂ TEST LUỒNG THANH TOÁN (KHÔNG CẦN BACKEND)
// ==========================================

// Biến đếm để giả lập lần đầu check là PENDING, lần bấm tiếp theo là PAID
let mockCheckCount = 0; 

export const createPaymentOrder = async (payload) => {
    // Giả lập delay mạng 1 giây
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Reset bộ đếm mỗi khi tạo đơn mới
    mockCheckCount = 0; 
    const mockOrderId = 'MOCK_ORDER_' + Date.now();

    return {
        success: true,
        message: 'Tạo đơn hàng thành công',
        data: {
            orderId: mockOrderId,
            orderCode: mockOrderId,
            status: 'PENDING',
            amount: payload.totalAmount || 199000,
            method: 'SePay',
            // Dùng link ảnh QR giả định từ VietQR để UI hiển thị được mã QR
            qrCodeUrl: `https://api.vietqr.io/image/970436-0987654321-yN2hKbq.jpg?amount=${payload.totalAmount || 199000}&addInfo=${mockOrderId}`,
            checkoutPath: `/payment/${payload.packageId}`,
            plan: { id: payload.packageId, name: 'Gói Premium (Mock)', price: payload.totalAmount || 199000 },
        }
    };
};

export const getPaymentOrderStatus = async (orderId) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    mockCheckCount++;

    // Cố tình cho lần check đầu tiên (do hệ thống tự gọi) là PENDING
    // Để bạn có thể thấy màn hình mã QR.
    // Khi bạn bấm nút "Tôi đã thanh toán" (Manual Check), count > 1 -> chuyển thành PAID
    const isPaid = mockCheckCount > 1;

    return {
        success: true,
        message: 'Kiểm tra thành công',
        data: {
            orderId: orderId,
            orderCode: orderId,
            status: isPaid ? 'PAID' : 'PENDING',
            amount: 199000,
        }
    };
};

export const getPaymentOrderDetails = async (orderId) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Trang Success bắt buộc status phải là PAID
    return {
        success: true,
        message: 'Lấy chi tiết thành công',
        data: {
            orderId: orderId,
            orderCode: orderId,
            status: 'PAID',
            amount: 199000,
            method: 'SePay',
            paidAt: new Date().toISOString(),
            packageName: 'Gói Premium (Mock)',
            addOn: null
        }
    };
};