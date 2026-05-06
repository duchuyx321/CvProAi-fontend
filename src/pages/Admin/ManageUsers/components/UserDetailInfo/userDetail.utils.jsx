import {
    formatDate,
    getErrorMessage,
    getLatestUsageQuota,
    normalizeAdminUser,
} from '../UserTable/userTable.utils';

const toNumber = (value, fallback = 0) => {
    const nextValue = Number(value);
    return Number.isFinite(nextValue) ? nextValue : fallback;
};

export const formatDateTime = (value) => {
    if (!value) return 'Chưa có dữ liệu';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }
    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'short',
        timeStyle: 'short',
    }).format(date);
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

const normalizeTransactions = (transactions = []) => {
    if (!Array.isArray(transactions)) return [];

    return transactions.map((transaction, index) => ({
        id:
            transaction?.id ||
            transaction?.order_code ||
            transaction?.provider_transaction_id ||
            `txn-${index}`,
        title:
            transaction?.description ||
            transaction?.title ||
            transaction?.plan?.name ||
            transaction?.addon_package?.name ||
            'Giao dịch hệ thống',
        amount:
            transaction?.amount_cents ||
            transaction?.amount ||
            transaction?.total_amount ||
            0,
        currency: transaction?.currency || 'VND',
        status: transaction?.status || 'PENDING',
        date:
            transaction?.paid_at ||
            transaction?.created_at ||
            transaction?.createdAt ||
            null,
        reference:
            transaction?.order_code ||
            transaction?.provider_transaction_id ||
            transaction?.reference_code ||
            '',
    }));
};

const normalizeAuditLogs = (auditLogs = []) => {
    if (!Array.isArray(auditLogs)) return [];

    return auditLogs.map((item, index) => ({
        id: item?.id || item?.log_id || `audit-${index}`,
        action:
            item?.action ||
            item?.event ||
            item?.title ||
            'Cập nhật trạng thái tài khoản',
        actor:
            item?.actor_name ||
            item?.actor ||
            item?.actor?.name ||
            item?.admin_name ||
            'Admin',
        note: item?.note || item?.description || item?.reason || '',
        timestamp:
            item?.created_at ||
            item?.createdAt ||
            item?.timestamp ||
            item?.time ||
            null,
    }));
};

export const buildFallbackUserDetail = (user) => {
    if (!user) return null;

    const normalizedUser = normalizeAdminUser(user.raw || user);
    const latestQuota =
        normalizedUser.latestQuota || getLatestUsageQuota(user?.raw?.usage_quotas);

    return {
        ...normalizedUser,
        avatarUrl:
            user?.raw?.user_profile?.avatar_url ||
            user?.raw?.avatar_url ||
            user?.avatarUrl ||
            '',
        location:
            user?.raw?.user_profile?.location ||
            user?.raw?.location ||
            user?.raw?.address ||
            'Chưa cập nhật',
        note: user?.raw?.user_profile?.summary || '',
        packageName: user?.planName || 'Free',
        packageExpiredAt: latestQuota?.quota_end_at || null,
        quotas: {
            aiUsed: toNumber(latestQuota?.ai_runs_used, 0),
            aiLimit: toNumber(latestQuota?.ai_runs_limit, 0),
            exportUsed: toNumber(latestQuota?.exports_used, 0),
            exportLimit: toNumber(latestQuota?.exports_limit, 0),
        },
        stats: {
            cvCount: toNumber(latestQuota?.cvs_used, normalizedUser.cvCount),
            aiUsageCount: toNumber(latestQuota?.ai_runs_used, 0),
            exportCount: toNumber(latestQuota?.exports_used, 0),
            totalTransactions: 0,
            totalSpent: 0,
        },
        transactions: [],
        auditLogs: [],
    };
};

export const normalizeAdminUserDetail = (payload, fallbackUser = null) => {
    const source = payload?.user || payload?.profile || payload?.account || payload;
    const latestQuota = getLatestUsageQuota(source?.usage_quotas);
    const baseUser = normalizeAdminUser({
        ...(fallbackUser?.raw || fallbackUser || {}),
        ...(source || {}),
    });

    const quota = payload?.quota || payload?.usage || payload?.limits || {};
    const stats = payload?.stats || payload?.statistics || {};
    const billing = payload?.billing || payload?.payments || {};
    const transactions = normalizeTransactions(
        payload?.transactions ||
            payload?.payment_history ||
            payload?.paymentHistory ||
            payload?.activities ||
            [],
    );
    const auditLogs = normalizeAuditLogs(
        payload?.audit_logs || payload?.auditLogs || payload?.logs || [],
    );

    return {
        ...baseUser,
        avatarUrl:
            source?.user_profile?.avatar_url ||
            source?.avatar_url ||
            source?.avatarUrl ||
            fallbackUser?.avatarUrl ||
            '',
        location:
            source?.user_profile?.location ||
            source?.location ||
            source?.address ||
            source?.city ||
            source?.province ||
            'Chưa cập nhật',
        note:
            payload?.support_note ||
            payload?.supportNote ||
            source?.user_profile?.summary ||
            source?.support_note ||
            '',
        packageName:
            source?.current_plan?.name ||
            source?.plan?.name ||
            source?.subscription?.plan_name ||
            fallbackUser?.planName ||
            'Free',
        packageExpiredAt:
            latestQuota?.quota_end_at ||
            source?.subscription?.expired_at ||
            source?.subscription?.expiredAt ||
            payload?.package_expired_at ||
            payload?.packageExpiredAt ||
            null,
        quotas: {
            aiUsed: toNumber(
                quota?.ai_used ?? quota?.aiUsed ?? latestQuota?.ai_runs_used,
                0,
            ),
            aiLimit: toNumber(
                quota?.ai_limit ?? quota?.aiLimit ?? latestQuota?.ai_runs_limit,
                0,
            ),
            exportUsed: toNumber(
                quota?.export_used ??
                    quota?.exportUsed ??
                    latestQuota?.exports_used,
                0,
            ),
            exportLimit: toNumber(
                quota?.export_limit ??
                    quota?.exportLimit ??
                    latestQuota?.exports_limit,
                0,
            ),
        },
        stats: {
            cvCount: toNumber(
                stats?.cv_count ??
                    stats?.cvCount ??
                    latestQuota?.cvs_used ??
                    baseUser.cvCount,
                baseUser.cvCount,
            ),
            aiUsageCount: toNumber(
                stats?.ai_usage_count ??
                    stats?.aiUsageCount ??
                    latestQuota?.ai_runs_used,
                0,
            ),
            exportCount: toNumber(
                stats?.export_count ??
                    stats?.exportCount ??
                    latestQuota?.exports_used,
                0,
            ),
            totalTransactions: toNumber(
                stats?.total_transactions ??
                    stats?.totalTransactions ??
                    transactions.length,
                transactions.length,
            ),
            totalSpent: toNumber(
                billing?.total_spent ??
                    billing?.totalSpent ??
                    stats?.total_spent ??
                    stats?.totalSpent,
                0,
            ),
        },
        transactions,
        auditLogs,
    };
};

export const getUserDetailErrorMessage = (error, fallback) => {
    return getErrorMessage(error, fallback);
};

export const getQuotaText = (used, limit) => {
    if (!limit) return `${used} lượt đã dùng`;
    return `${used}/${limit} lượt`;
};

export { formatDate };
