import { toSafeNumber, toSafeString } from './packageFormatters';

function normalizeStatus(value) {
    return toSafeString(value).toUpperCase() === 'PAUSED' ? 'PAUSED' : 'ACTIVE';
}

function normalizeDurationUnit(value) {
    const normalizedValue = toSafeString(value).toLowerCase();

    if (
        ['permanent', 'lifetime', 'forever', 'vinh_vien'].includes(
            normalizedValue
        )
    ) {
        return 'permanent';
    }

    if (['year', 'years', 'annual'].includes(normalizedValue)) {
        return 'year';
    }

    return 'month';
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

export function normalizePackage(item, index) {
    return {
        id:
            toSafeString(item?.id || item?._id || item?.packageId) ||
            `pkg-${index + 1}`,
        code:
            toSafeString(item?.code || item?.packageCode) ||
            `PKG-${String(index + 1).padStart(3, '0')}`,
        name:
            toSafeString(item?.name || item?.packageName || item?.title) ||
            'Chưa đặt tên',
        price: toSafeNumber(item?.price || item?.amount || item?.fee),
        durationUnit: normalizeDurationUnit(
            item?.durationUnit || item?.cycle || item?.billingUnit
        ),
        durationValue:
            item?.durationValue ??
            item?.duration ??
            item?.billingCycleValue ??
            1,
        benefits: normalizeBenefits(
            item?.benefits || item?.features || item?.privileges
        ),
        totalUsers: toSafeNumber(
            item?.totalUsers ||
                item?.users ||
                item?.subscribers ||
                item?.totalSubscriptions
        ),
        status: normalizeStatus(item?.status || item?.state),
        createdAt:
            item?.createdAt ||
            item?.created_date ||
            item?.createdDate ||
            '',
    };
}

export function normalizePackageList(items = []) {
    return items.map(normalizePackage);
}