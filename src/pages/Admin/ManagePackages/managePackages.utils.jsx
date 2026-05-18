import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { updatePackageStatus } from '~/services/managePackageService';

export const PAGE_SIZE = 8;

export const PackageSortBy = {
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    NAME: 'name',
    PRICE: 'price',
};

export const SortOrder = {
    ASC: 'ASC',
    DESC: 'DESC',
};

export const PACKAGE_SORT_OPTIONS = [
    {
        label: 'Tạo mới nhất',
        sort_by: PackageSortBy.CREATED_AT,
        sort_order: SortOrder.DESC,
    },
    {
        label: 'Tạo cũ nhất',
        sort_by: PackageSortBy.CREATED_AT,
        sort_order: SortOrder.ASC,
    },
    {
        label: 'Cập nhật mới nhất',
        sort_by: PackageSortBy.UPDATED_AT,
        sort_order: SortOrder.DESC,
    },
    {
        label: 'Tên: A -> Z',
        sort_by: PackageSortBy.NAME,
        sort_order: SortOrder.ASC,
    },
    {
        label: 'Tên: Z -> A',
        sort_by: PackageSortBy.NAME,
        sort_order: SortOrder.DESC,
    },
    {
        label: 'Giá: Cao -> Thấp',
        sort_by: PackageSortBy.PRICE,
        sort_order: SortOrder.DESC,
    },
    {
        label: 'Giá: Thấp -> Cao',
        sort_by: PackageSortBy.PRICE,
        sort_order: SortOrder.ASC,
    },
];

export const PACKAGE_RANGE_OPTIONS = [
    { label: 'Tất cả thời gian', value: 'all' },
    { label: '7 ngày qua', value: '7d' },
    { label: '30 ngày qua', value: '30d' },
    { label: 'Tháng này', value: 'month' },
    { label: 'Năm nay', value: 'year' },
    { label: 'Tùy chỉnh', value: 'custom' },
];

export const DEFAULT_FILTERS = {
    search: '',
    sort_by: PackageSortBy.CREATED_AT,
    sort_order: SortOrder.DESC,
    range: 'all',
    from: '',
    to: '',
};

export const DEFAULT_META = {
    page: 1,
    limit: PAGE_SIZE,
    total_items: 0,
    total_pages: 1,
};

export const DEFAULT_FORM_DATA = {
    id: '',
    code: '',
    slug: '',
    name: '',
    price: '',
    durationUnit: 'year',
    durationValue: '1',
    description: '',
    maxCv: '50',
    aiLimit: '100',
    premiumCv: true,
    removeWatermark: true,
    customDomain: true,
    support247: true,
    allowAiAddon: false,
    fullAiAnalysis: false,
    totalUsers: 0,
    status: 'ACTIVE',
};

export function toSafeString(value = '') {
    return String(value ?? '').trim();
}

export function toSafeNumber(value = 0) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function formatCurrency(value = 0) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(toSafeNumber(value));
}

export function formatDuration(unit, value) {
    if (unit === 'permanent') return 'Vĩnh viễn';
    if (unit === 'year') return `${toSafeNumber(value) || 1} năm`;
    return `${toSafeNumber(value) || 1} tháng`;
}

export function getErrorMessage(
    error,
    fallback = 'Có lỗi xảy ra, vui lòng thử lại sau.',
) {
    return (
        error?.response?.data?.error?.[0] ||
        error?.response?.data?.message ||
        error?.data?.message ||
        error?.message ||
        fallback
    );
}

export function getApiMessage(response, fallback) {
    return (
        response?.message ||
        response?.data?.message ||
        response?.error?.[0] ||
        fallback
    );
}

function normalizeStatus(item = {}) {
    const value = item?.is_active ?? item?.status;

    if (typeof value === 'boolean') return value ? 'ACTIVE' : 'PAUSED';
    if (typeof value === 'number') return value === 1 ? 'ACTIVE' : 'PAUSED';

    const normalizedValue = toSafeString(value).toUpperCase();

    return normalizedValue === 'ACTIVE' || normalizedValue === 'TRUE'
        ? 'ACTIVE'
        : 'PAUSED';
}

function normalizeDurationUnit(value) {
    const normalizedValue = toSafeString(value).toUpperCase();

    if (normalizedValue === 'LIFETIME') return 'permanent';
    if (normalizedValue === 'YEAR') return 'year';

    return 'month';
}

function getPackageBenefits(item = {}) {
    return [
        toSafeNumber(item?.cv_limit) > 0
            ? `${toSafeNumber(item.cv_limit)} CV`
            : '',
        toSafeNumber(item?.ai_limit) > 0
            ? `AI ${toSafeNumber(item.ai_limit)} lượt`
            : '',
        item?.premium_template ? 'Dùng template premium' : '',
        item?.remove_watermark ? 'Xuất CV không watermark' : '',
        item?.custom_domain ? 'Tên miền tùy chỉnh' : '',
        item?.priority_support ? 'Hỗ trợ 24/7' : '',
        item?.can_purchase_ai_addon ? 'Cho phép mua thêm AI add-on' : '',
        item?.view_full_ai_analysis ? 'Xem full phân tích AI' : '',
    ].filter(Boolean);
}

export function normalizePackage(item = {}, index = 0) {
    const id = toSafeString(item?.id);
    const slug = toSafeString(item?.slug);

    return {
        id,
        displayId: id ? `#${id.slice(0, 8)}` : '--',
        slug,
        code: slug || (id ? `PKG-${id.slice(0, 8)}` : `PKG-${index + 1}`),
        name: toSafeString(item?.name) || 'Chưa đặt tên',
        price: toSafeNumber(item?.price),
        durationUnit: normalizeDurationUnit(item?.billing_cycle),
        durationValue: 1,
        benefits: getPackageBenefits(item),
        totalUsers: toSafeNumber(item?.total_users ?? item?.totalUsers),
        status: normalizeStatus(item),
        createdAt: item?.createdAt || item?.created_at || '',
        updatedAt: item?.updatedAt || item?.updated_at || '',
        raw: item,
    };
}

export function normalizePackageList(items = []) {
    return items.map(normalizePackage);
}

function getPackageResponsePayload(response) {
    if (
        Array.isArray(response?.data) &&
        (response?.meta || response?.pagination || response?.total_items)
    ) {
        return response;
    }

    return response?.data || response || {};
}

export function getPackageItemsFromResponse(response) {
    const payload = getPackageResponsePayload(response);

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.plans)) return payload.plans;
    if (Array.isArray(payload?.items)) return payload.items;

    return [];
}

export function getPaginationFromResponse(response, fallbackPageSize = PAGE_SIZE) {
    const payload = getPackageResponsePayload(response);
    const pagination =
        payload?.pagination ||
        payload?.meta?.pagination ||
        payload?.meta ||
        payload?.page;

    const hasPagination = Boolean(
        pagination || payload?.total_items || payload?.totalItems,
    );

    const totalItems = toSafeNumber(
        pagination?.total_items ??
            pagination?.totalItems ??
            payload?.total_items ??
            payload?.totalItems ??
            getPackageItemsFromResponse(response).length,
        0,
    );

    const limit = toSafeNumber(
        pagination?.limit ?? pagination?.page_size ?? pagination?.pageSize,
        fallbackPageSize,
    );

    const page = toSafeNumber(
        pagination?.page ?? pagination?.currentPage ?? pagination?.current_page,
        1,
    );

    const totalPages = Math.max(
        toSafeNumber(
            pagination?.total_pages ??
                pagination?.totalPages ??
                (limit > 0 ? Math.ceil(totalItems / limit) : 1),
            1,
        ),
        1,
    );

    return {
        hasPagination,
        meta: {
            page,
            limit,
            total_items: totalItems,
            total_pages: totalPages,
        },
    };
}

export function buildPackageQuery({
    page = 1,
    limit = PAGE_SIZE,
    search = '',
    range = 'all',
    from = '',
    to = '',
    sort_by = PackageSortBy.CREATED_AT,
    sort_order = SortOrder.DESC,
}) {
    const query = {
        page,
        limit,
        search: search.trim(),
        sort_by,
        sort_order,
    };

    if (range && range !== 'all' && range !== 'custom') {
        query.range = range;
    } else if (from && to) {
        query.from = from;
        query.to = to;
    }

    return query;
}

export function normalizeToolbarFilters({ search, sort, range }) {
    const nextFilters = {
        search: search?.trim() || '',
        sort_by: sort?.sort_by || DEFAULT_FILTERS.sort_by,
        sort_order: sort?.sort_order || DEFAULT_FILTERS.sort_order,
        range: 'all',
        from: '',
        to: '',
    };

    if (typeof range === 'string') {
        nextFilters.range = range || 'all';
        return nextFilters;
    }

    nextFilters.range = 'custom';
    nextFilters.from = range?.from || '';
    nextFilters.to = range?.to || '';

    return nextFilters;
}

export function isSamePackageFilters(currentFilters, nextFilters) {
    return (
        currentFilters.search === nextFilters.search &&
        currentFilters.sort_by === nextFilters.sort_by &&
        currentFilters.sort_order === nextFilters.sort_order &&
        currentFilters.range === nextFilters.range &&
        currentFilters.from === nextFilters.from &&
        currentFilters.to === nextFilters.to
    );
}

function buildUpdatedPackageStatusPayload(item, response, shouldDisable) {
    const payload = getPackageResponsePayload(response);
    const responseData =
        payload && typeof payload === 'object' && !Array.isArray(payload)
            ? payload
            : {};

    return {
        ...item.raw,
        ...responseData,
        id: item.id,
        slug: responseData.slug ?? item.slug ?? item.raw?.slug,
        name: responseData.name ?? item.name ?? item.raw?.name,
        price: responseData.price ?? item.raw?.price ?? item.price,
        is_active: !shouldDisable,
        status: shouldDisable ? 'PAUSED' : 'ACTIVE',
    };
}

export function usePackageStatusAction({ onStatusChanged } = {}) {
    const [submittingPackageId, setSubmittingPackageId] = useState('');

    const handleTogglePackageStatus = useCallback(async (item) => {
        if (!item?.id) {
            toast.error('Không tìm thấy ID gói dịch vụ để cập nhật trạng thái.');
            return;
        }

        if (submittingPackageId === item.id) return;

        const shouldDisable = item.status === 'ACTIVE';
        setSubmittingPackageId(item.id);

        try {
            const response = await updatePackageStatus(item.id, {
                action: shouldDisable ? 'disable' : 'restore',
            });

            if (response?.success === false || response?.data?.success === false) {
                throw new Error(
                    getApiMessage(
                        response,
                        shouldDisable
                            ? 'Khóa gói dịch vụ thất bại.'
                            : 'Mở khóa gói dịch vụ thất bại.',
                    ),
                );
            }

            const updatedPackage = normalizePackage(
                buildUpdatedPackageStatusPayload(item, response, shouldDisable),
            );

            onStatusChanged?.(updatedPackage);
            toast.success(
                getApiMessage(
                    response,
                    shouldDisable
                        ? 'Đã khóa gói dịch vụ.'
                        : 'Đã mở khóa gói dịch vụ.',
                ),
            );

            return true;
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    shouldDisable
                        ? 'Không thể khóa gói dịch vụ.'
                        : 'Không thể mở khóa gói dịch vụ.',
                ),
            );
            return false;
        } finally {
            setSubmittingPackageId('');
        }
    }, [onStatusChanged, submittingPackageId]);

    return {
        submittingPackageId,
        handleTogglePackageStatus,
    };
}
