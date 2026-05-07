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

    return {
        id: String(id),
        fullName,
        email,
        phone,
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

export const formatDate = (value) => {
    if (!value) return 'Chưa có dữ liệu';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('vi-VN').format(date);
};

export const buildAdminUsersQuery = ({
    page = 1,
    limit = 8,
    search = '',
    status = 'all',
    range = 'all',
    from = '',
    to = '',
    sort_by = 'updatedAt',
    sort_order = 'DESC',
}) => {
    const query = {
        page,
        limit,
        search: search.trim(),
        sort_by,
        sort_order,
    };

    if (status && status !== 'all') {
        query.user_status = status === 'locked' ? 'BANNED' : status;
    }

    if (range && range !== 'all' && range !== 'custom') {
        query.range = range;
    } else if (from && to) {
        query.from = from;
        query.to = to;
    }

    return query;
};
