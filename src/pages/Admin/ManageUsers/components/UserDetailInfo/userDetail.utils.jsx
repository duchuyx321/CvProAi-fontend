import {
    formatDate,
    formatNumber,
    getErrorMessage,
    getPlanExpiredAtFromUser,
    normalizeAdminUser,
} from '../../manageUsers.utils';

const toNumber = (value, fallback = 0) => {
    const nextValue = Number(value);
    return Number.isFinite(nextValue) ? nextValue : fallback;
};

const getUsageQuota = (user) => {
    const fromArray = user?.usage_quotas?.[0];
    if (fromArray) return fromArray;

    if (
        user?.quota_end_at != null ||
        user?.ai_runs_used != null ||
        user?.cvs_used != null
    ) {
        return {
            quota_end_at: user.quota_end_at,
            ai_runs_used: user.ai_runs_used,
            ai_runs_limit: user.ai_runs_limit,
            exports_used: user.exports_used,
            exports_limit: user.exports_limit,
            cvs_used: user.cvs_used,
            cvs_limit: user.cvs_limit,
        };
    }

    return null;
};

export const USER_ROLE_OPTIONS = [
    { value: 'USER', label: 'Người dùng' },
    { value: 'ADMIN', label: 'Quản trị viên' },
];

export const getRoleLabel = (role = 'USER') => {
    const normalized = String(role).toUpperCase();
    return (
        USER_ROLE_OPTIONS.find((item) => item.value === normalized)?.label ||
        normalized
    );
};

export const getDetailPayload = (response) => {
    const payload = response?.data ?? response;
    if (payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
        return payload.data;
    }
    return payload;
};

export const normalizeAdminUserDetail = (payload, fallbackUser = null) => {
    const source =
        payload?.user || payload?.profile || payload?.account || payload;
    const mergedUser = {
        ...(fallbackUser?.raw || {}),
        ...source,
    };
    const quota = getUsageQuota(mergedUser);
    const baseUser = normalizeAdminUser(mergedUser);
    const role = String(source?.role || fallbackUser?.role || 'USER').toUpperCase();

    return {
        ...baseUser,
        role,
        roleLabel: getRoleLabel(role),
        avatarUrl: baseUser.avatar || '',
        location:
            mergedUser?.user_profile?.location ||
            mergedUser?.location ||
            mergedUser?.address ||
            'Chưa cập nhật',
        packageExpiredAt:
            getPlanExpiredAtFromUser(mergedUser) ||
            baseUser.quotas?.quotaEndAt ||
            null,
        quotas: {
            aiUsed: toNumber(
                quota?.ai_runs_used ?? mergedUser?.ai_runs_used,
                baseUser.quotas?.aiUsed,
            ),
            aiLimit: toNumber(
                quota?.ai_runs_limit ?? mergedUser?.ai_runs_limit,
                baseUser.quotas?.aiLimit,
            ),
            exportUsed: toNumber(
                quota?.exports_used ?? mergedUser?.exports_used,
                baseUser.quotas?.exportUsed,
            ),
            exportLimit: toNumber(
                quota?.exports_limit ?? mergedUser?.exports_limit,
                baseUser.quotas?.exportLimit,
            ),
            cvUsed: toNumber(quota?.cvs_used ?? mergedUser?.cvs_used, baseUser.cvCount),
            cvLimit: toNumber(
                quota?.cvs_limit ?? mergedUser?.cvs_limit,
                baseUser.quotas?.cvLimit,
            ),
        },
        stats: {
            cvCount: toNumber(quota?.cvs_used ?? mergedUser?.cvs_used, baseUser.cvCount),
            aiUsageCount: toNumber(
                quota?.ai_runs_used ?? mergedUser?.ai_runs_used,
                baseUser.quotas?.aiUsed,
            ),
            exportCount: toNumber(
                quota?.exports_used ?? mergedUser?.exports_used,
                baseUser.quotas?.exportUsed,
            ),
        },
        raw: mergedUser,
    };
};

export const getUserDetailErrorMessage = (error, fallback) => {
    return getErrorMessage(error, fallback);
};

export const getQuotaText = (used, limit) => {
    if (!limit) return `${used} lượt đã dùng`;
    return `${used}/${limit} lượt`;
};

export { formatDate, formatNumber };
