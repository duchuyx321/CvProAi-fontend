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
    { label: 'Cập nhật mới nhất', sort_by: UserSortBy.UPDATED_AT, sort_order: SortOrder.DESC },
    { label: 'Cập nhật cũ nhất', sort_by: UserSortBy.UPDATED_AT, sort_order: SortOrder.ASC },
    { label: 'Đăng ký mới nhất', sort_by: UserSortBy.CREATED_AT, sort_order: SortOrder.DESC },
    { label: 'Đăng ký cũ nhất', sort_by: UserSortBy.CREATED_AT, sort_order: SortOrder.ASC },
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

export const getErrorMessage = (error, fallback = 'Có lỗi xảy ra, vui lòng thử lại sau') => {
    return error?.response?.data?.message || error?.message || fallback;
};

export const getUsersFromPayload = (response) => {
    return response?.data?.data || response?.data || [];
};

const getSubscriptionFromUser = (user = {}) => {
    return (
        user?.subscriptions?.[0] ||
        user?.subscription ||
        user?.subscriptionCurrent ||
        user?.active_subscription ||
        user?.current_subscription ||
        null
    );
};

export const getPlanNameFromUser = (user = {}) => {
    if (!user || typeof user !== 'object') return null;

    const subscription = getSubscriptionFromUser(user);
    const quota = user?.usage_quotas?.[0];
    const planObject = user?.plan && typeof user.plan === 'object' ? user.plan : null;
    const currentPlan = user?.current_plan && typeof user.current_plan === 'object' ? user.current_plan : null;

    const possibleNames = [
        subscription?.plan?.name,
        subscription?.plan_name,
        quota?.plan?.name,
        quota?.plan_name,
        currentPlan?.name,
        planObject?.name,
        typeof user?.plan === 'string' ? user.plan : null,
        user?.plan_name,
        user?.planName,
        user?.package_name,
        user?.package?.name,
        user?.packageName,
        user?.current_plan_name,
    ];

    return possibleNames.find(Boolean) || 'Free';
};

export const getPlanExpiredAtFromUser = (user = {}) => {
    if (!user || typeof user !== 'object') return null;

    const subscription = getSubscriptionFromUser(user);
    const quota = user?.usage_quotas?.[0];

    const possibleDates = [
        quota?.quota_end_at,
        user?.quota_end_at,
        subscription?.current_period_end,
        subscription?.end_at,
        subscription?.expired_at,
        subscription?.expiredAt,
        user?.package_expired_at,
        user?.packageExpiredAt,
    ];

    return possibleDates.find(Boolean) || null;
};

export const getPaginationFromPayload = (response, fallbackPageSize = PAGE_SIZE) => {
    const meta = response?.data?.meta?.meta || response?.data?.meta || response?.data || {};
    const limit = Number(meta.limit || fallbackPageSize);
    const totalItems = Number(meta.total_items || meta.totalItems || meta.total || 0);
    const page = Number(meta.page || meta.current_page || 1);
    const totalPages = Number(meta.total_pages || meta.totalPages || Math.ceil(totalItems / limit) || 1);

    return { page, limit, total_items: totalItems, total_pages: Math.max(totalPages, 1) };
};

export const normalizeAdminUser = (user = {}) => {
    const quota = user?.usage_quotas?.[0] || {};
    const planName = getPlanNameFromUser(user);

    const isLocked = LOCKED_STATUSES.includes(String(user?.status).toUpperCase());
    const isOnline = String(user?.status).toUpperCase() === 'ACTIVE';

    return {
        id: String(user?.user_id || user?.id || ''),
        fullName: user?.full_name || 'Chưa cập nhật tên',
        email: user?.email || 'Chưa cập nhật',
        avatar: user?.user_profile?.avatar_url || null,
        phone: user?.user_profile?.phone || 'Chưa cập nhật',
        provider: String(user?.provider || 'LOCAL').toUpperCase(),
        emailVerified: Boolean(user.email_verified),
        planName,
        cvCount: quota?.cvs_used ?? user?.cvs_used ?? 0,
        isLocked,
        isOnline,
        statusLabel: isLocked ? 'Bị khóa' : isOnline ? 'Hoạt động' : 'Chưa hoạt động',
        registeredAt: user.createdAt,

        quotas: {
            aiUsed: quota?.ai_runs_used ?? user?.ai_runs_used ?? 0,
            aiLimit: quota?.ai_runs_limit ?? user?.ai_runs_limit ?? 0,
            exportUsed: quota?.exports_used ?? user?.exports_used ?? 0,
            exportLimit: quota?.exports_limit ?? user?.exports_limit ?? 0,
            cvCount: quota?.cvs_used ?? user?.cvs_used ?? 0,
            cvLimit: quota?.cvs_limit ?? user?.cvs_limit ?? 0,
            quotaEndAt: getPlanExpiredAtFromUser(user),
        },
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
    const query = { page, limit, search: search.trim(), sort_by, sort_order };

    if (range && range !== 'all' && range !== 'custom') {
        query.range = range;
    } else if (from && to) {
        query.from = from;
        query.to = to;
    }

    return query;
};

export const formatDate = (isoString) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};

export const formatDateTime = (isoString) => {
    if (!isoString) return '--';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return isoString;

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
    if (!Number.isFinite(amount)) return '0đ';

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