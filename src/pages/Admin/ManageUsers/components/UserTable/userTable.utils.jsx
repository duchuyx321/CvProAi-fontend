import { DEFAULT_PLAN_OPTION } from './userTable.constants';

const STATUS_META = {
    online: { label: 'Hoạt động', tone: 'online' },
    offline: { label: 'Chưa hoạt động', tone: 'offline' },
    locked: { label: 'Bị khóa', tone: 'locked' },
};

const toNumber = (value, fallback = 0) => {
    const nextValue = Number(value);
    return Number.isFinite(nextValue) ? nextValue : fallback;
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

export const getPlanOptionsFromPayload = (payload, users = []) => {
    const apiOptions =
        payload?.filters?.plans ||
        payload?.plans ||
        payload?.meta?.plans ||
        payload?.planOptions ||
        [];

    const normalizedOptions = apiOptions
        .map((option) => {
            if (typeof option === 'string') {
                return {
                    value: option,
                    label: option,
                };
            }

            const value =
                option?.value || option?.slug || option?.code || option?.name;

            if (!value) return null;

            return {
                value,
                label: option?.label || option?.name || value,
            };
        })
        .filter(Boolean);

    const uniquePlansFromUsers = Array.from(
        new Set(users.map((user) => user.planValue).filter(Boolean)),
    ).map((planValue) => ({
        value: planValue,
        label:
            users.find((user) => user.planValue === planValue)?.planName ||
            planValue,
    }));

    return [DEFAULT_PLAN_OPTION]
        .concat(normalizedOptions)
        .concat(uniquePlansFromUsers)
        .filter(
            (option, index, currentOptions) =>
                currentOptions.findIndex(
                    (currentOption) => currentOption.value === option.value,
                ) === index,
        );
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
            user?.status === 'LOCKED' ||
            user?.status === 'BLOCKED' ||
            user?.status === 'INACTIVE' ||
            user?.account_status === 'LOCKED' ||
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

export const buildAdminUsersQuery = ({
  page = 1,
  limit = 8,
  keyword,
  search,
  status = 'all',
  plan = 'all',
  registeredAt = '',
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
    query.status = status;
  }

  if (plan && plan !== 'all') {
    query.plan = plan;
  }

  if (registeredAt) {
    query.registered_at = registeredAt;
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

export const downloadBlobFile = (
    blob,
    fileName = `danh-sach-nguoi-dung-${Date.now()}.xlsx`,
) => {
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = objectUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
};
