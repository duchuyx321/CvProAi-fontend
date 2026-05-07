const STATUS_META = {
    online: { label: 'Hoạt động', tone: 'online' },
    offline: { label: 'Chưa hoạt động', tone: 'offline' },
    locked: { label: 'Bị khóa', tone: 'locked' },
};

export const DATE_FILTER_PRESET_OPTIONS = [
    { label: '7d qua', value: 'last7Days' },
    { label: '30d qua', value: 'last30Days' },
    { label: 'Tháng này', value: 'thisMonth' },
    { label: 'Năm nay', value: 'thisYear' },
];

const toNumber = (value, fallback = 0) => {
    const nextValue = Number(value);
    return Number.isFinite(nextValue) ? nextValue : fallback;
};

const formatDateInputValue = (value) => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
};

const shiftDate = (date, numberOfDays) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + numberOfDays);
    return nextDate;
};

export const getDateRangeFromPreset = (
    preset,
    currentDate = new Date(),
) => {
    const today = formatDateInputValue(currentDate);
    const startOfMonth = formatDateInputValue(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    );
    const startOfYear = formatDateInputValue(
        new Date(currentDate.getFullYear(), 0, 1),
    );

    switch (preset) {
        case 'last7Days':
            return {
                registeredFrom: formatDateInputValue(shiftDate(currentDate, -6)),
                registeredTo: today,
            };
        case 'last30Days':
            return {
                registeredFrom: formatDateInputValue(shiftDate(currentDate, -29)),
                registeredTo: today,
            };
        case 'thisMonth':
            return {
                registeredFrom: startOfMonth,
                registeredTo: today,
            };
        case 'thisYear':
            return {
                registeredFrom: startOfYear,
                registeredTo: today,
            };
        default:
            return {
                registeredFrom: '',
                registeredTo: '',
            };
    }
};

export const getDateFilterLabel = ({
    registeredPreset = 'all',
    registeredFrom = '',
    registeredTo = '',
}) => {
    const presetLabel = DATE_FILTER_PRESET_OPTIONS.find(
        (option) => option.value === registeredPreset,
    )?.label;

    if (presetLabel) {
        return `Ngày đăng ký: ${presetLabel}`;
    }

    if (registeredFrom && registeredTo) {
        return `Ngày đăng ký: ${formatDate(registeredFrom)} - ${formatDate(registeredTo)}`;
    }

    if (registeredFrom) {
        return `Ngày đăng ký: từ ${formatDate(registeredFrom)}`;
    }

    if (registeredTo) {
        return `Ngày đăng ký: đến ${formatDate(registeredTo)}`;
    }

    return 'Ngày đăng ký';
};

export const getErrorMessage = (
    error,
    fallback = 'Có lỗi xảy ra, vui lòng thử lại sau',
) => {
    return (
        error?.response?.data?.message ||
        error?.message ||
        error?.data?.message ||
        fallback
    );
};

export const getResponsePayload = (response) => {
    if (response instanceof Blob) {
        return response;
    }

    return response?.data || response;
};

export const getUsersFromPayload = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.users)) return payload.users;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.list)) return payload.list;
    return [];
};

export const getLatestUsageQuota = (usageQuotas = []) => {
    if (!Array.isArray(usageQuotas) || usageQuotas.length === 0) {
        return null;
    }

    return usageQuotas
        .slice()
        .sort((left, right) => {
            const leftDate = new Date(
                left?.quota_end_at || left?.updatedAt || left?.createdAt || 0,
            ).getTime();
            const rightDate = new Date(
                right?.quota_end_at || right?.updatedAt || right?.createdAt || 0,
            ).getTime();

            return rightDate - leftDate;
        })[0];
};

export const getPaginationFromPayload = (payload, fallbackPageSize = 8) => {
    const pagination =
        payload?.pagination ||
        payload?.meta?.meta ||
        payload?.meta?.pagination ||
        payload?.page;

    const totalItems = toNumber(
        pagination?.total_items ??
            pagination?.totalItems ??
            payload?.total_items ??
            payload?.totalItems ??
            getUsersFromPayload(payload).length,
        0,
    );

    const pageSize = toNumber(
        pagination?.limit ?? pagination?.page_size ?? pagination?.pageSize,
        fallbackPageSize,
    );

    const currentPage = toNumber(
        pagination?.page ?? pagination?.currentPage ?? pagination?.current_page,
        1,
    );

    const totalPages = Math.max(
        toNumber(
            pagination?.total_pages ??
                pagination?.totalPages ??
                (pageSize > 0 ? Math.ceil(totalItems / pageSize) : 1),
            1,
        ),
        1,
    );

    return {
        currentPage,
        pageSize,
        totalItems,
        totalPages,
    };
};

export const getStatusMeta = (statusKey = 'offline') => {
    return STATUS_META[statusKey] || STATUS_META.offline;
};

export const normalizeAdminUser = (user = {}) => {
    const latestQuota = getLatestUsageQuota(user?.usage_quotas);

    const id =
        user?.id ||
        user?.user_id ||
        user?._id ||
        user?.code ||
        user?.uuid ||
        '';

    const fullName =
        user?.full_name ||
        user?.fullName ||
        user?.name ||
        user?.username ||
        'Người dùng chưa cập nhật tên';

    const email = user?.email || user?.contact_email || 'Chưa cập nhật';

    const phone =
        user?.phone_number ||
        user?.phone ||
        user?.user_profile?.phone ||
        'Chưa cập nhật';

    const planValue =
        user?.current_plan?.slug ||
        user?.plan?.slug ||
        user?.package?.slug ||
        user?.currentPackage?.slug ||
        user?.subscription?.plan_slug ||
        user?.current_plan?.name ||
        user?.plan?.name ||
        user?.package?.name ||
        'free';

    const planName =
        user?.current_plan?.name ||
        user?.plan?.name ||
        user?.package?.name ||
        user?.currentPackage?.name ||
        user?.subscription?.plan_name ||
        'Free';

    const cvCount = toNumber(
        latestQuota?.cvs_used ??
            user?.cv_count ??
            user?.cvCount ??
            user?.total_cvs ??
            user?.statistics?.cv_count ??
            user?.stats?.cvCount,
        0,
    );

    const isLocked = Boolean(
        user?.is_locked ||
            user?.isLocked ||
            user?.is_banned ||
            user?.isBanned ||
            user?.status === 'BANNED' ||
            user?.status === 'LOCKED' ||
            user?.status === 'BLOCKED' ||
            user?.status === 'INACTIVE' ||
            user?.account_status === 'BANNED' ||
            user?.account_status === 'LOCKED' ||
            user?.accountStatus === 'BANNED' ||
            user?.accountStatus === 'LOCKED',
    );

    const isOnline = Boolean(
        user?.is_online ||
            user?.status === 'ONLINE' ||
            user?.status === 'ACTIVE',
    );

    const statusKey = isLocked ? 'locked' : isOnline ? 'online' : 'offline';
    const statusMeta = getStatusMeta(statusKey);

    return {
        id: String(id),
        fullName,
        email,
        phone,
        planName,
        planValue,
        cvCount,
        isLocked,
        isOnline,
        statusKey,
        statusLabel: statusMeta.label,
        statusTone: statusMeta.tone,
        registeredAt:
            user?.created_at ||
            user?.createdAt ||
            user?.registered_at ||
            user?.registeredAt ||
            null,
        latestQuota,
        raw: user,
    };
};

export const formatDate = (value) => {
    if (!value) return 'Chưa có dữ liệu';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('vi-VN').format(date);
};

const getTodayString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

export const buildAdminUsersQuery = ({
    page = 1,
    limit = 8,
    keyword,
    search,
    status = 'all',
    registeredFrom = '',
    registeredTo = '',
    format,
    sortBy = 'updatedAt',
    sortOrder = 'DESC',
}) => {
    const query = {
        page,
        limit,
        search: (search ?? keyword ?? '').trim(),
        sort_by: sortBy,
        sort_order: sortOrder,
    };

    if (status && status !== 'all') {
        query.user_status = status === 'locked' ? 'BANNED' : status;
    }

    if (registeredFrom || registeredTo) {
        if (registeredFrom) {
            query.from = registeredFrom;
        }

        if (registeredTo) {
            query.to = registeredTo;
        } else if (registeredFrom) {
            query.to = getTodayString();
        }
    }

    if (format) {
        query.format = format;
    }

    return query;
};

export const buildPaginationItems = (currentPage, totalPages) => {
    if (totalPages <= 1) return [1];

    const pageSet = new Set([1, totalPages, currentPage]);

    if (currentPage > 1) pageSet.add(currentPage - 1);
    if (currentPage > 2) pageSet.add(currentPage - 2);
    if (currentPage < totalPages) pageSet.add(currentPage + 1);
    if (currentPage + 1 < totalPages) pageSet.add(currentPage + 2);

    const pages = Array.from(pageSet).sort((left, right) => left - right);
    const items = [];

    pages.forEach((page, index) => {
        const previousPage = pages[index - 1];

        if (index > 0 && page - previousPage > 1) {
            items.push('ellipsis');
        }

        items.push(page);
    });

    return items;
};
