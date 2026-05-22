export const getApiErrorMessage = (result, fallback) => {
    return result?.message || fallback;
};

export const isApiError = (result) => {
    return result?.status >= 400 || result?.success === false;
};

export const getResultArray = (result) => {
    return Array.isArray(result?.data?.data)
        ? result.data.data
        : Array.isArray(result?.data)
            ? result.data
            : [];
};

export const normalizePlan = (plan = {}) => ({
    ...plan,
    id: String(plan.id || ''),
    name: plan.name || 'Gói dịch vụ',
    description: plan.description || '',
    currency: plan.currency || 'VND',
    price: Number(plan.price) || 0,
    cvLimit: Number(plan.cvLimit || plan.cv_limit) || 0,
    aiLimit: Number(plan.aiLimit || plan.ai_limit) || 0,
    exportLimit: Number(plan.exportLimit || plan.export_limit) || 0,
    isActive: plan.isActive !== false && plan.is_active !== false,
    isFree:
        Boolean(plan.isFree || plan.is_free) ||
        Number(plan.price) === 0 ||
        String(plan.slug || plan.name || '').trim().toLowerCase() === 'free' ||
        String(plan.name || '').trim().toLowerCase() === 'miễn phí',
});

export const normalizeAddon = (addon = {}) => ({
    ...addon,
    id: String(addon.id || ''),
    name: addon.name || 'Gói mua thêm',
    description: addon.description || '',
    currency: addon.currency || 'VND',
    price: Number(addon.price) || 0,
    runs: Number(addon.runs) || 0,
    isActive: addon.isActive !== false && addon.is_active !== false,
});

export const getCurrentPlanInfo = (user = {}) => {
    return {
        id: String(user?.planId || ''),
        name: String(user?.planName || '').trim(),
    };
};

export const isCurrentPlan = (plan, currentPlan) => {
    if (!plan || !currentPlan) return false;
    
    if (currentPlan.id && plan.id === currentPlan.id) {
        return true;
    }
    
    const normalizedPlanName = String(plan.name || '').trim().toLowerCase();
    const normalizedCurrentName = String(currentPlan.name || '').trim().toLowerCase();
    
    return Boolean(normalizedCurrentName && normalizedPlanName === normalizedCurrentName);
};

export const buildUpgradePayload = ({
    selectedPlanId,
    selectedAddonId,
    providerTransactionId,
    reason,
}) => {
    return {
        paymentable_type: selectedAddonId ? 'BOTH' : 'SUBSCRIPTION',
        plan_id: selectedPlanId,
        addon_package_id: selectedAddonId || undefined,
        provider_transaction_id: providerTransactionId?.trim() || undefined,
        reason: reason?.trim() || undefined,
    };
};

export const getPlanFeatureList = (plan = {}) => {
    return [
        `${plan.cvLimit} CV`,
        `${plan.aiLimit} AI`,
        `${plan.exportLimit} export`,
    ];
};

