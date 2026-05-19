import {
    DEFAULT_FORM_DATA,
    normalizeNumberInput,
} from '../../../managePackages.utils';

export function toSafeString(value = '') {
    return String(value ?? '').trim();
}

export function toSafeNumber(value = 0) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function toDigitsOnly(value = '') {
    return normalizeNumberInput(value);
}

function normalizeDurationUnit(value) {
    const normalizedValue = toSafeString(value).toUpperCase();

    if (normalizedValue === 'LIFETIME') return 'permanent';
    if (normalizedValue === 'YEAR') return 'year';

    return 'month';
}

function normalizeBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value === 1;

    return toSafeString(value).toLowerCase() === 'true';
}

function normalizeStatus(packageItem = {}) {
    const value = packageItem?.is_active ?? packageItem?.status;

    if (typeof value === 'boolean') return value ? 'ACTIVE' : 'PAUSED';
    if (typeof value === 'number') return value === 1 ? 'ACTIVE' : 'PAUSED';

    const normalizedValue = toSafeString(value).toUpperCase();

    return normalizedValue === 'ACTIVE' || normalizedValue === 'TRUE'
        ? 'ACTIVE'
        : 'PAUSED';
}

export function normalizePackageDetail(packageItem) {
    if (!packageItem) {
        return DEFAULT_FORM_DATA;
    }

    const durationUnit = normalizeDurationUnit(packageItem?.billing_cycle);

    return {
        ...DEFAULT_FORM_DATA,
        id: toSafeString(packageItem?.id),
        slug: toSafeString(packageItem?.slug),
        code: toSafeString(packageItem?.slug),
        name: toSafeString(packageItem?.name),
        price: String(packageItem?.price ?? ''),
        durationUnit,
        durationValue: durationUnit === 'permanent' ? '' : '1',
        description: toSafeString(packageItem?.description),
        maxCv: String(packageItem?.cv_limit ?? DEFAULT_FORM_DATA.maxCv),
        aiLimit: String(packageItem?.ai_limit ?? DEFAULT_FORM_DATA.aiLimit),
        premiumCv: normalizeBoolean(packageItem?.premium_template),
        removeWatermark: normalizeBoolean(packageItem?.remove_watermark),
        customDomain: normalizeBoolean(packageItem?.custom_domain),
        support247: normalizeBoolean(packageItem?.priority_support),
        allowAiAddon: normalizeBoolean(packageItem?.can_purchase_ai_addon),
        fullAiAnalysis: normalizeBoolean(packageItem?.view_full_ai_analysis),
        totalUsers: toSafeNumber(
            packageItem?.usage_count ??
                packageItem?.total_users ??
                packageItem?.totalUsers,
        ),
        status: normalizeStatus(packageItem),
    };
}

export function createFormSnapshot(formData) {
    return JSON.stringify({
        name: toSafeString(formData.name),
        price: String(formData.price),
        durationUnit: formData.durationUnit,
        durationValue: String(formData.durationValue),
        description: toSafeString(formData.description),
        maxCv: String(formData.maxCv),
        aiLimit: String(formData.aiLimit),
        premiumCv: Boolean(formData.premiumCv),
        removeWatermark: Boolean(formData.removeWatermark),
        customDomain: Boolean(formData.customDomain),
        support247: Boolean(formData.support247),
        allowAiAddon: Boolean(formData.allowAiAddon),
        fullAiAnalysis: Boolean(formData.fullAiAnalysis),
        status: formData.status || 'ACTIVE',
    });
}

export function validatePackageDetailForm(formData) {
    const nextErrors = {};

    if (!toSafeString(formData.name)) {
        nextErrors.name = 'Vui lòng nhập tên gói dịch vụ.';
    }

    if (formData.price === '' || toSafeNumber(formData.price) < 0) {
        nextErrors.price = 'Giá tiền phải lớn hơn hoặc bằng 0.';
    }

    if (!formData.durationUnit) {
        nextErrors.durationUnit = 'Vui lòng chọn thời hạn.';
    }

    if (!toSafeString(formData.description)) {
        nextErrors.description = 'Vui lòng nhập mô tả ngắn.';
    }

    if (formData.maxCv === '' || toSafeNumber(formData.maxCv) < 0) {
        nextErrors.maxCv = 'Số CV tối đa không hợp lệ.';
    }

    if (formData.aiLimit === '' || toSafeNumber(formData.aiLimit) < 0) {
        nextErrors.aiLimit = 'Lượt dùng AI không hợp lệ.';
    }

    return nextErrors;
}

export function buildUpdatePayload(formData) {
    const billingCycleMap = {
        year: 'YEAR',
        month: 'MONTH',
        permanent: 'LIFETIME',
    };

    return {
        name: toSafeString(formData.name),
        price: toSafeNumber(formData.price),
        currency: 'VND',
        billing_cycle: billingCycleMap[formData.durationUnit] || 'MONTH',
        description: toSafeString(formData.description),
        cv_limit: toSafeNumber(formData.maxCv),
        export_limit: 0,
        ai_limit: toSafeNumber(formData.aiLimit),
        premium_template: Boolean(formData.premiumCv),
        remove_watermark: Boolean(formData.removeWatermark),
        custom_domain: Boolean(formData.customDomain),
        priority_support: Boolean(formData.support247),
        can_purchase_ai_addon: Boolean(formData.allowAiAddon),
        view_full_ai_analysis: Boolean(formData.fullAiAnalysis),
        is_active: formData.status !== 'PAUSED',
    };
}
