export function formatPrice(price, currency = 'VND') {
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
    const normalizedStatus = normalizeStatus(status);

    const statusMap = {
        PENDING: 'Đang xử lý',
        PAID: 'Đã thanh toán',
        FAILED: 'Thất bại',
        CANCELLED: 'Đã hủy',
        REFUNDED: 'Đã hoàn tiền',
    };

    return statusMap[normalizedStatus] ?? 'Không xác định';
}

export function mapPaymentStatusVariant(status) {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus === 'PAID') {
        return 'success';
    }

    if (normalizedStatus === 'FAILED' || normalizedStatus === 'CANCELLED') {
        return 'failed';
    }

    if (normalizedStatus === 'PENDING') {
        return 'pending';
    }

    if (normalizedStatus === 'REFUNDED') {
        return 'refunded';
    }

    return 'default';
}

export function mapPaymentMethod() {
    return 'SePay';
}

export function mapAiRunStatus(status) {
    const normalizedStatus = normalizeStatus(status);

    const statusMap = {
        QUEUED: 'Đang chờ xử lý',
        RUNNING: 'Đang phân tích',
        SUCCESS: 'Hoàn tất',
        FAILED: 'Thất bại',
    };

    return statusMap[normalizedStatus] ?? 'Không xác định';
}

export function mapAiRunStatusVariant(status) {
    const normalizedStatus = normalizeStatus(status);

    if (normalizedStatus === 'SUCCESS') {
        return 'success';
    }

    if (normalizedStatus === 'FAILED') {
        return 'failed';
    }

    if (normalizedStatus === 'RUNNING') {
        return 'running';
    }

    if (normalizedStatus === 'QUEUED') {
        return 'pending';
    }

    return 'default';
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
    const normalizedStatus = normalizeStatus(subscription.status);

    const statusMap = {
        ACTIVE: 'Đang hoạt động',
        CANCELLED: 'Đã hủy',
        EXPIRED: 'Đã hết hạn',
        PAST_DUE: 'Quá hạn thanh toán',
    };

    return statusMap[normalizedStatus] ?? 'Không xác định';
}

export function getPlanStatusVariant(subscription = {}) {
    const normalizedStatus = normalizeStatus(subscription.status);

    if (normalizedStatus === 'ACTIVE') {
        return 'active';
    }

    if (normalizedStatus === 'PAST_DUE') {
        return 'warning';
    }

    if (normalizedStatus === 'CANCELLED' || normalizedStatus === 'EXPIRED') {
        return 'inactive';
    }

    return 'default';
}

function normalizeStatus(status) {
    return String(status ?? '').trim().toUpperCase();
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