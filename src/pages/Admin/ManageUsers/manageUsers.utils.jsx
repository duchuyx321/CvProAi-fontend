export const PAGE_SIZE = 8;

export const UserSortBy = {
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
};

export const SortOrder = {
    ASC: 'ASC',
    DESC: 'DESC',
};

export const USER_SORT_OPTIONS = [
    {
        label: 'Cập nhật mới nhất',
        sort_by: UserSortBy.UPDATED_AT,
        sort_order: SortOrder.DESC,
    },
    {
        label: 'Cập nhật cũ nhất',
        sort_by: UserSortBy.UPDATED_AT,
        sort_order: SortOrder.ASC,
    },
    {
        label: 'Đăng ký mới nhất',
        sort_by: UserSortBy.CREATED_AT,
        sort_order: SortOrder.DESC,
    },
    {
        label: 'Đăng ký cũ nhất',
        sort_by: UserSortBy.CREATED_AT,
        sort_order: SortOrder.ASC,
    },
];

export const USER_RANGE_OPTIONS = [
    { label: 'Tất cả thời gian', value: 'all' },
    { label: '7 ngày qua', value: '7d' },
    { label: '30 ngày qua', value: '30d' },
    { label: 'Tháng này', value: 'month' },
    { label: 'Năm nay', value: 'year' },
    { label: 'Tùy chỉnh', value: 'custom' },
];

export const DEFAULT_FILTERS = {
    search: '',
    sort_by: UserSortBy.UPDATED_AT,
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

const LOCKED_STATUSES = ['BANNED', 'LOCKED', 'BLOCKED', 'INACTIVE'];

const toNumber = (value, fallback = 0) => {
    const nextValue = Number(value);
    return Number.isFinite(nextValue) ? nextValue : fallback;
};

const getStatusLabel = ({ isLocked, isOnline }) => {
    if (isLocked) return 'Bị khóa';
    if (isOnline) return 'Hoạt động';
    return 'Chưa hoạt động';
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
    if (
        Array.isArray(response?.data) &&
        (response?.meta || response?.pagination || response?.total_items)
    ) {
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

    return usageQuotas.slice().sort((left, right) => {
        const leftDate = new Date(
            left?.quota_end_at || left?.updatedAt || left?.createdAt || 0,
        ).getTime();
        const rightDate = new Date(
            right?.quota_end_at || right?.updatedAt || right?.createdAt || 0,
        ).getTime();

        return rightDate - leftDate;
    })[0];
};

export const getPaginationFromPayload = (
    payload,
    fallbackPageSize = PAGE_SIZE,
) => {
    const pagination =
        payload?.pagination ||
        payload?.meta?.meta ||
        payload?.meta?.pagination ||
        payload?.meta ||
        payload?.page;

    const totalItems = toNumber(
        pagination?.total_items ??
            pagination?.totalItems ??
            payload?.total_items ??
            payload?.totalItems ??
            getUsersFromPayload(payload).length,
        0,
    );

    const limit = toNumber(
        pagination?.limit ?? pagination?.page_size ?? pagination?.pageSize,
        fallbackPageSize,
    );

    const page = toNumber(
        pagination?.page ?? pagination?.currentPage ?? pagination?.current_page,
        1,
    );

    const totalPages = Math.max(
        toNumber(
            pagination?.total_pages ??
                pagination?.totalPages ??
                (limit > 0 ? Math.ceil(totalItems / limit) : 1),
            1,
        ),
        1,
    );

    return {
        page,
        limit,
        total_items: totalItems,
        total_pages: totalPages,
    };
};

export const normalizeAdminUser = (user = {}) => {
    const latestQuota = getLatestUsageQuota(
        user?.usage_quotas || user?.usageQuotas,
    );

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

    const provider = String(
        user?.provider ||
            user?.auth_provider ||
            user?.authProvider ||
            user?.login_provider ||
            'LOCAL',
    ).toUpperCase();

    const emailVerified = Boolean(
        user?.email_verified || user?.emailVerified || user?.verified,
    );

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

    const status = String(user?.status || '').toUpperCase();
    const accountStatus = String(
        user?.account_status || user?.accountStatus || '',
    ).toUpperCase();

    const isLocked = Boolean(
        user?.is_locked ||
        user?.isLocked ||
        user?.is_banned ||
        user?.isBanned ||
        LOCKED_STATUSES.includes(status) ||
        LOCKED_STATUSES.includes(accountStatus),
    );

    const isOnline = Boolean(
        user?.is_online ||
        user?.isOnline ||
        status === 'ONLINE' ||
        status === 'ACTIVE',
    );

    return {
        id: String(id),
        fullName,
        email,
        phone,
        provider,
        emailVerified,
        planName,
        cvCount,
        isLocked,
        isOnline,
        statusLabel: getStatusLabel({ isLocked, isOnline }),
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

export const buildAdminUsersQuery = ({
    page = 1,
    limit = PAGE_SIZE,
    search = '',
    range = 'all',
    from = '',
    to = '',
    sort_by = UserSortBy.UPDATED_AT,
    sort_order = SortOrder.DESC,
}) => {
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
};

export const formatDate = (value) => {
    if (!value) return '--';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};

export const formatDateTime = (value) => {
    if (!value) return '--';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(date);
};

export const formatNumber = (value) => {
    return new Intl.NumberFormat('vi-VN').format(Number(value) || 0);
};

export const formatCurrency = (value, currency = 'VND') => {
    const amount = Number(value);

    if (!Number.isFinite(amount)) {
        return '0đ';
    }

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const getUserDisplayId = (user = {}) => {
    const id = String(user?.id || '');

    if (!id) return '#USER----';
    if (id.length <= 10) return `#${id}`;

    return `#${id.slice(0, 8)}`;
};
