export function formatPrice(price, currency) {
    const amount = Number(price ?? 0);

    if (!Number.isFinite(amount)) {
        return '—';
    }

    if (currency === 'VND') {
        return `${amount.toLocaleString('vi-VN')}đ`;
    }

    return `${amount.toLocaleString('en-US')} ${currency ?? ''}`.trim();
}

export function mapBillingCycleToLabel(billingCycle) {
    const labels = {
        MONTH: '1 tháng',
        YEAR: '1 năm',
        LIFETIME: 'Vĩnh viễn',
    };

    return labels[billingCycle] ?? '';
}

export function mapBillingCycleToUnit(billingCycle) {
    const labels = {
        MONTH: '/tháng',
        YEAR: '/năm',
        LIFETIME: '/vĩnh viễn',
    };

    return labels[billingCycle] ?? '';
}

export function formatDate(dateString) {
    if (!dateString) {
        return '—';
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleDateString('vi-VN');
}

export function formatDateTime(dateString) {
    if (!dateString) {
        return '—';
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleString('vi-VN');
}

export function mapPaymentStatus(status) {
    const normalizedStatus = String(status ?? '').trim().toUpperCase();

    const statusMap = {
        PENDING: 'Đang xử lý',
        PAID: 'Đã thanh toán',
        FAILED: 'Thất bại',
        // CANCELED: 'Đã hủy',
        CANCELLED: 'Đã hủy',
        REFUNDED: 'Đã hoàn tiền',

        SUCCESS: 'Thành công',

        EXPIRED: 'Đã hết hạn',
    };

    return statusMap[normalizedStatus] ?? 'Không xác định';
}

export function mapPaymentMethod(method, provider) {
    const normalizedMethod = String(method ?? '').trim().toUpperCase();
    const normalizedProvider = String(provider ?? '').trim().toUpperCase();

    const methodMap = {
        SEPAY: 'SePay',
        BANK_TRANSFER: 'Chuyển khoản',
        CASH: 'Tiền mặt',
        MOMO: 'MoMo',
        VNPAY: 'VNPay',
    };

    if (methodMap[normalizedMethod]) {
        return methodMap[normalizedMethod];
    }

    if (normalizedProvider === 'SEPAY') {
        return 'SePay';
    }

    return provider ?? method ?? '—';
}

export function buildPlanBenefits(plan = {}) {
    const benefits = [];

    if (Number(plan.cv_limit) > 0) {
        benefits.push(`Tạo tối đa ${plan.cv_limit} CV`);
    }

    if (Number(plan.ai_limit) > 0) {
        benefits.push(`${plan.ai_limit} lượt phân tích AI mỗi tháng`);
    }

    if (Number(plan.export_limit) > 0) {
        benefits.push(`${plan.export_limit} lượt xuất CV mỗi tháng`);
    }

    if (plan.view_full_ai_analysis) {
        benefits.push('Xem đầy đủ phân tích AI');
    }

    if (plan.remove_watermark) {
        benefits.push('Xuất PDF không watermark');
    }

    if (plan.premium_template) {
        benefits.push('Truy cập tất cả các mẫu thiết kế');
    }

    if (plan.allow_ai_addon_purchase) {
        benefits.push('Được mua thêm lượt phân tích AI');
    }

    if (plan.priority_support) {
        benefits.push('Hỗ trợ ưu tiên');
    }

    if (plan.custom_domain) {
        benefits.push('Tùy chỉnh liên kết CV');
    }

    return benefits;
}

export function buildQuotaItems(plan = {}, usage = {}) {
    const aiUsed = toSafeNumber(usage.ai_runs_used);
    const aiLimit = toSafeNumber(usage.ai_runs_limit ?? plan.ai_limit);

    const exportsUsed = toSafeNumber(usage.exports_used);
    const exportsLimit = toSafeNumber(usage.exports_limit ?? plan.export_limit);

    const quotaItems = [
        {
            key: 'ai-runs',
            label: 'Phân tích AI',
            used: aiUsed,
            limit: aiLimit,
            remaining: getRemainingQuota(aiUsed, aiLimit),
        },
        {
            key: 'exports',
            label: 'Xuất file',
            used: exportsUsed,
            limit: exportsLimit,
            remaining: getRemainingQuota(exportsUsed, exportsLimit),
        },
    ];

    if (usage.cv_used !== undefined && usage.cv_used !== null) {
        const cvUsed = toSafeNumber(usage.cv_used);
        const cvLimit = toSafeNumber(usage.cv_limit ?? plan.cv_limit);

        quotaItems.push({
            key: 'cv',
            label: 'Tạo CV',
            used: cvUsed,
            limit: cvLimit,
            remaining: getRemainingQuota(cvUsed, cvLimit),
        });
    }

    return quotaItems;
}

export function getQuotaPercent(used = 0, limit = 0) {
    const safeUsed = toSafeNumber(used);
    const safeLimit = toSafeNumber(limit);

    if (safeLimit <= 0) {
        return 0;
    }

    return Math.min((safeUsed / safeLimit) * 100, 100);
}

export function getPlanStatusLabel(subscription = {}) {
    const normalizedStatus = String(subscription.status ?? '')
        .trim()
        .toUpperCase();

    const statusMap = {
        ACTIVE: 'Đang hoạt động',
        CANCELED: 'Đã hủy',
        CANCELLED: 'Đã hủy',
        EXPIRED: 'Đã hết hạn',
        PAST_DUE: 'Quá hạn thanh toán',
    };

    return statusMap[normalizedStatus] ?? 'Không xác định';
}

export function getPlanStatusVariant(subscription = {}) {
    const normalizedStatus = String(subscription.status ?? '')
        .trim()
        .toUpperCase();

    if (normalizedStatus === 'ACTIVE') {
        return 'active';
    }

    if (normalizedStatus === 'PAST_DUE') {
        return 'warning';
    }

    if (
        normalizedStatus === 'CANCELED' ||
        normalizedStatus === 'CANCELLED' ||
        normalizedStatus === 'EXPIRED'
    ) {
        return 'inactive';
    }

    return 'default';
}

function toSafeNumber(value = 0) {
    const number = Number(value ?? 0);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return number;
}

function getRemainingQuota(used = 0, limit = 0) {
    const safeUsed = toSafeNumber(used);
    const safeLimit = toSafeNumber(limit);

    if (safeLimit <= 0) {
        return 0;
    }

    return Math.max(safeLimit - safeUsed, 0);
}