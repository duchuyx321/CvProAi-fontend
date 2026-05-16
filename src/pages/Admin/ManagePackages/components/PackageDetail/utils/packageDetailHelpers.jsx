import { DEFAULT_FORM_DATA } from '../../../managePackages.utils';

export function toSafeString(value = '') {
    return String(value ?? '').trim();
}

export function toSafeNumber(value = 0) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function toDigitsOnly(value = '') {
    return String(value ?? '').replace(/\D/g, '');
}

function normalizeDurationUnit(value) {
    const normalizedValue = toSafeString(value).toLowerCase();

    if (
        ['permanent', 'lifetime', 'forever', 'vinh_vien', 'vĩnh viễn'].includes(
            normalizedValue
        )
    ) {
        return 'permanent';
    }

    if (['year', 'years', 'annual', 'yearly', 'năm'].includes(normalizedValue)) {
        return 'year';
    }

    return 'month';
}

function normalizeBoolean(value, fallback = false) {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value === 1;
    }

    const normalizedValue = toSafeString(value).toLowerCase();

    if (['true', '1', 'yes', 'y', 'on'].includes(normalizedValue)) {
        return true;
    }

    if (['false', '0', 'no', 'n', 'off'].includes(normalizedValue)) {
        return false;
    }

    return fallback;
}

function normalizeStatus(value) {
    if (typeof value === 'boolean') return value ? 'ACTIVE' : 'PAUSED';
    if (typeof value === 'number') return value === 1 ? 'ACTIVE' : 'PAUSED';

    const normalizedValue = toSafeString(value).toUpperCase();
    return normalizedValue === 'PAUSED' || normalizedValue === 'INACTIVE'
        ? 'PAUSED'
        : 'ACTIVE';
}

function normalizeBenefits(value) {
    if (Array.isArray(value)) {
        return value.map((item) => toSafeString(item)).filter(Boolean);
    }

    if (typeof value === 'string') {
        return value
            .split(/[|,]/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

function extractFeatureFlags(packageItem) {
    const benefits = normalizeBenefits(
        packageItem?.benefits || packageItem?.features || packageItem?.privileges
    ).map((item) => item.toLowerCase());

    const hasBenefit = (matcher) => benefits.some((item) => matcher.test(item));

    return {
        premiumCv:
            normalizeBoolean(packageItem?.premiumCv ?? packageItem?.premium_template, false) ||
            hasBenefit(/premium|template/),
        removeWatermark:
            normalizeBoolean(packageItem?.removeWatermark ?? packageItem?.remove_watermark, false) ||
            hasBenefit(/watermark/),
        customDomain:
            normalizeBoolean(packageItem?.customDomain ?? packageItem?.custom_domain, false) ||
            hasBenefit(/tên\s*miền|domain/),
        support247:
            normalizeBoolean(packageItem?.support247 ?? packageItem?.priority_support, false) ||
            hasBenefit(/24\/7|hỗ\s*trợ/),
        allowAiAddon:
            normalizeBoolean(packageItem?.allowAiAddon ?? packageItem?.can_purchase_ai_addon, false) ||
            hasBenefit(/add[\s-]*on/),
        fullAiAnalysis:
            normalizeBoolean(packageItem?.fullAiAnalysis ?? packageItem?.view_full_ai_analysis, false) ||
            hasBenefit(/full\s*phân\s*tích|phân\s*tích\s*ai/),
    };
}

export function normalizePackageDetail(packageItem) {
    if (!packageItem) {
        return DEFAULT_FORM_DATA;
    }

    const featureFlags = extractFeatureFlags(packageItem);
    const normalizedDurationUnit = normalizeDurationUnit(
        packageItem?.durationUnit ||
            packageItem?.cycle ||
            packageItem?.billingUnit ||
            packageItem?.billing_cycle
    );

    return {
        id: toSafeString(
            packageItem?.id ||
                packageItem?._id ||
                packageItem?.packageId ||
                packageItem?.code
        ),
        slug: toSafeString(packageItem?.slug || packageItem?.code || packageItem?.packageCode),
        code: toSafeString(packageItem?.code || packageItem?.packageCode),
        name: toSafeString(
            packageItem?.name || packageItem?.packageName || packageItem?.title
        ),
        price: String(
            packageItem?.price ?? packageItem?.amount ?? packageItem?.fee ?? ''
        ),
        durationUnit: normalizedDurationUnit,
        durationValue:
            normalizedDurationUnit === 'permanent'
                ? ''
                : String(
                      packageItem?.durationValue ??
                          packageItem?.duration ??
                          packageItem?.billingCycleValue ??
                          1
                  ),
        description: toSafeString(
            packageItem?.description || packageItem?.shortDescription
        ),
        maxCv: String(
            packageItem?.maxCv ??
                packageItem?.maxCV ??
                packageItem?.cv_limit ??
                packageItem?.maxResume ??
                packageItem?.resumeLimit ??
                50
        ),
        aiLimit: String(
            packageItem?.aiLimit ??
                packageItem?.ai_limit ??
                packageItem?.aiUsageLimit ??
                packageItem?.analysisLimit ??
                100
        ),
        premiumCv: featureFlags.premiumCv,
        removeWatermark: featureFlags.removeWatermark,
        customDomain: featureFlags.customDomain,
        support247: featureFlags.support247,
        allowAiAddon: featureFlags.allowAiAddon,
        fullAiAnalysis: featureFlags.fullAiAnalysis,
        totalUsers: toSafeNumber(
            packageItem?.totalUsers ||
                packageItem?.users ||
                packageItem?.subscribers ||
                packageItem?.totalSubscriptions
        ),
        status: normalizeStatus(
            packageItem?.status ??
                packageItem?.state ??
                packageItem?.is_active ??
                packageItem?.isActive
        ),
    };
}

export function getPackageCollection(response) {
    const primaryData = response?.data ?? response ?? {};
    const collections = [
        primaryData?.items,
        primaryData?.data,
        primaryData?.packages,
        primaryData?.results,
        primaryData,
    ];

    return collections.find((item) => Array.isArray(item)) || [];
}

export function findPackageById(packageList = [], packageId) {
    const normalizedId = String(packageId);

    return packageList.find((item) =>
        [
            item?.id,
            item?._id,
            item?.packageId,
            item?.code,
            item?.packageCode,
        ].some((value) => String(value) === normalizedId)
    );
}

export function buildBenefitsPreview(formData) {
    const benefits = [];

    if (toSafeNumber(formData.maxCv) > 0) {
        benefits.push(`${toSafeNumber(formData.maxCv)} CV`);
    }

    if (toSafeNumber(formData.aiLimit) > 0) {
        benefits.push(`AI ${toSafeNumber(formData.aiLimit)} lượt`);
    }

    if (formData.premiumCv) {
        benefits.push('Dùng template premium');
    }

    if (formData.removeWatermark) {
        benefits.push('Xuất CV không watermark');
    }

    if (formData.customDomain) {
        benefits.push('Tên miền tùy chỉnh');
    }

    if (formData.support247) {
        benefits.push('Hỗ trợ 24/7');
    }

    if (formData.allowAiAddon) {
        benefits.push('Cho phép mua thêm AI add-on');
    }

    if (formData.fullAiAnalysis) {
        benefits.push('Xem full phân tích AI');
    }

    return benefits;
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
        export_limit: toSafeNumber(formData.maxCv),
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
