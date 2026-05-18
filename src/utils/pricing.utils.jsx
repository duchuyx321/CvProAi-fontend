export function formatPrice(price, currency) {
    const amount = Number(price ?? 0);
    if (Number.isNaN(amount)) return '--';
    if (currency === 'VND') {
        return `${amount.toLocaleString('vi-VN')}đ`;
    }
    return `${amount.toLocaleString('en-US')} ${currency ?? ''}`.trim();
}

export function mapBillingCycleToUnit(billingCycle) {
    const labels = {
        MONTH: '/tháng',
        YEAR: '/năm',
        LIFETIME: '/vĩnh viễn',
    };
    return labels[billingCycle] ?? '';
}

export function buildPlanFeatures(plan) {
    const features = [];

    if (typeof plan.cv_limit === 'number') {
        features.push(`Tạo tối đa ${plan.cv_limit} CV/tháng`);
    }
    if (typeof plan.ai_limit === 'number') {
        features.push(`Phân tích AI ${plan.ai_limit} lần/tháng`);
    }
    if (plan.view_full_ai_analysis) {
        features.push('Xem đầy đủ phân tích AI');
    }
    if (plan.premium_template) {
        features.push('Mẫu CV cao cấp');
    }
    if (plan.remove_watermark) {
        features.push('Xuất file không watermark');
    }
    if (plan.custom_domain) {
        features.push('Tùy chỉnh liên kết CV');
    }
    if (plan.priority_support) {
        features.push('Hỗ trợ ưu tiên');
    }

    return features;
}
