export function formatPrice(price, currency) {
    const amount = Number(price ?? 0);

    if (Number.isNaN(amount)) {
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
    const statusMap = {
        SUCCESS: 'Thành công',
        FAILED: 'Thất bại',
        PENDING: 'Đang xử lý',
        CANCELLED: 'Đã hủy',
        EXPIRED: 'Đã hết hạn',
    };

    return statusMap[status] ?? 'Không xác định';
}

export function mapPaymentMethod(method, provider) {
    if (provider === 'SEPAY') {
        return 'SePay';
    }

    const methodMap = {
        SEPAY: 'SePay',
        BANK_TRANSFER: 'Chuyển khoản',
        CASH: 'Tiền mặt',
        MOMO: 'MoMo',
        VNPAY: 'VNPay',
    };

    return methodMap[method] ?? method ?? '—';
}

export function buildPlanBenefits(plan = {}) {
    const benefits = [];

    if (plan.view_full_ai_analysis) {
        benefits.push('Xem đầy đủ phân tích AI');
    }

    if (plan.remove_watermark) {
        benefits.push('Xuất PDF không watermark');
    }

    if (plan.premium_template) {
        benefits.push('Truy cập tất cả các mẫu thiết kế');
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
    const cvLimit = Number(plan.cv_limit ?? 0);
    const exportLimit = Number(plan.export_limit ?? 0);
    const aiLimit = Number(plan.ai_limit ?? 0);

    const cvUsed = Number(usage.cv_used ?? 0);
    const exportUsed = Number(usage.export_used ?? 0);
    const aiUsed = Number(usage.ai_used ?? 0);

    return [
        {
            key: 'ai',
            label: 'Phân tích AI',
            used: aiUsed,
            limit: aiLimit,
            remaining: Math.max(aiLimit - aiUsed, 0),
        },
        {
            key: 'export',
            label: 'Xuất file',
            used: exportUsed,
            limit: exportLimit,
            remaining: Math.max(exportLimit - exportUsed, 0),
        },
        {
            key: 'cv',
            label: 'Tạo CV',
            used: cvUsed,
            limit: cvLimit,
            remaining: Math.max(cvLimit - cvUsed, 0),
        },
    ];
}

export function getQuotaPercent(used = 0, limit = 0) {
    const safeUsed = Number(used ?? 0);
    const safeLimit = Number(limit ?? 0);

    if (safeLimit <= 0) {
        return 0;
    }

    return Math.min((safeUsed / safeLimit) * 100, 100);
}

export function getPlanStatusLabel(plan = {}) {
    const isActive = plan.status === 'ACTIVE';
    const willEndAtPeriodEnd = Boolean(plan.cancel_at_period_end);

    if (isActive && !willEndAtPeriodEnd) {
        return 'Đang hoạt động';
    }

    if (isActive && willEndAtPeriodEnd) {
        return 'Sẽ kết thúc vào cuối kỳ';
    }

    if (plan.status === 'CANCELLED') {
        return 'Đã hủy';
    }

    if (plan.status === 'EXPIRED') {
        return 'Đã hết hạn';
    }

    return 'Không xác định';
}

export function getPlanStatusVariant(plan = {}) {
    const isActive = plan.status === 'ACTIVE';
    const willEndAtPeriodEnd = Boolean(plan.cancel_at_period_end);

    if (isActive && !willEndAtPeriodEnd) {
        return 'active';
    }

    if (isActive && willEndAtPeriodEnd) {
        return 'ending';
    }

    if (plan.status === 'CANCELLED' || plan.status === 'EXPIRED') {
        return 'inactive';
    }

    return 'default';
}