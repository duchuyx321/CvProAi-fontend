import { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    Activity,
    ArrowLeft,
    Bot,
    Calendar,
    CheckCircle2,
    Download,
    FileText,
    Info,
    LockKeyhole,
    Mail,
    MapPin,
    Phone,
    RefreshCw,
    Shield,
    UnlockKeyhole,
    UserRound,
} from 'lucide-react';
import { toast } from 'react-toastify';

import Button from '~/components/Button';
import { config } from '~/config';
import {
    getAdminUserDetail,
    updateAdminUserStatus,
} from '~/services/admin-user.service';

import styles from './UserDetailInfo.module.scss';
import {
    buildFallbackUserDetail,
    formatCurrency,
    formatDate,
    formatDateTime,
    formatNumber,
    getQuotaText,
    getUserDetailErrorMessage,
    normalizeAdminUserDetail,
} from './userDetail.utils';

const cx = classNames.bind(styles);

function buildInitialLetters(name = '') {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((item) => item[0]?.toUpperCase())
        .join('');
}

function getQuotaPercent(used, limit) {
    if (!limit) return 0;
    return Math.min(Math.round((used / limit) * 100), 100);
}

function getStatusUpdatePayload({ detail, payload, shouldLock }) {
    return {
        ...detail.raw,
        ...(payload || {}),
        is_locked: shouldLock,
        isLocked: shouldLock,
        is_banned: shouldLock,
        isBanned: shouldLock,
        status: shouldLock ? 'BANNED' : 'ACTIVE',
        account_status: shouldLock ? 'BANNED' : 'ACTIVE',
        accountStatus: shouldLock ? 'BANNED' : 'ACTIVE',
        is_online:
            payload?.is_online ??
            payload?.isOnline ??
            (shouldLock ? false : detail.isOnline),
        audit_logs: [
            {
                action: shouldLock ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
                actor_name: 'Admin',
                description: shouldLock
                    ? 'Khóa tài khoản từ màn hình chi tiết'
                    : 'Mở khóa tài khoản từ màn hình chi tiết',
                created_at: new Date().toISOString(),
            },
        ].concat(detail.auditLogs || []),
    };
}

function UserDetailInfo({
    user,
    onBack,
    onUserStatusChange,
    fetchUserDetailAction = getAdminUserDetail,
    updateUserStatusAction = updateAdminUserStatus,
}) {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = useParams();
    const selectedUser = user || location.state?.user || null;
    const fallbackDetail = useMemo(
        () => buildFallbackUserDetail(selectedUser),
        [selectedUser],
    );

    const [detail, setDetail] = useState(fallbackDetail);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [empty, setEmpty] = useState(false);
    const [submittingStatus, setSubmittingStatus] = useState(false);
    const [statusActionError, setStatusActionError] = useState('');

    const handleBack = () => {
        if (onBack) {
            onBack();
            return;
        }

        navigate(config.router.manageUsers);
    };

    useEffect(() => {
        let ignore = false;

        const fetchUserDetail = async () => {
            if (!userId) {
                setLoading(false);
                setEmpty(true);
                return;
            }

            try {
                setLoading(true);
                setErrorMessage('');
                setEmpty(false);

                const response = await fetchUserDetailAction(userId);

                if (response?.success === false) {
                    throw new Error(
                        getUserDetailErrorMessage(
                            response,
                            'Không thể tải chi tiết người dùng',
                        ),
                    );
                }

                const payload = response?.data || response;

                if (
                    !payload ||
                    (typeof payload === 'object' &&
                        !Object.keys(payload).length)
                ) {
                    if (!ignore) {
                        setEmpty(true);
                        setDetail(null);
                    }
                    return;
                }

                if (!ignore) {
                    setDetail(normalizeAdminUserDetail(payload, selectedUser));
                }
            } catch (error) {
                if (!ignore) {
                    setErrorMessage(
                        getUserDetailErrorMessage(
                            error,
                            'Không thể tải chi tiết người dùng',
                        ),
                    );
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchUserDetail();

        return () => {
            ignore = true;
        };
    }, [fetchUserDetailAction, selectedUser, userId]);

    const handleToggleStatus = async () => {
        if (!detail?.id || submittingStatus) return;

        const shouldLock = !detail.isLocked;
        const targetUserId = detail.raw?.user_id || detail.raw?.id || detail.id;

        setSubmittingStatus(true);
        setStatusActionError('');

        try {
            const response = await updateUserStatusAction(targetUserId, {
                action: shouldLock ? 'lock' : 'unlock',
            });

            if (response?.success === false) {
                throw new Error(
                    getUserDetailErrorMessage(
                        response,
                        shouldLock
                            ? 'Không thể khóa tài khoản'
                            : 'Không thể mở khóa tài khoản',
                    ),
                );
            }

            const updatedDetail = normalizeAdminUserDetail(
                getStatusUpdatePayload({
                    detail,
                    payload: response?.data || response,
                    shouldLock,
                }),
                detail,
            );

            setDetail(updatedDetail);
            onUserStatusChange?.(updatedDetail);
            toast.success(
                shouldLock
                    ? 'Đã khóa tài khoản người dùng'
                    : 'Đã mở khóa tài khoản người dùng',
            );
        } catch (error) {
            const message = getUserDetailErrorMessage(
                error,
                'Không thể cập nhật trạng thái tài khoản',
            );

            setStatusActionError(message);
            toast.error(message);
        } finally {
            setSubmittingStatus(false);
        }
    };

    if (loading && !detail) {
        return (
            <section className={cx('wrapper')}>
                <div className={cx('inner')}>
                    <div className={cx('loading')}>
                        Đang tải chi tiết người dùng...
                    </div>
                </div>
            </section>
        );
    }

    if ((errorMessage && !detail) || empty || !detail) {
        return (
            <section className={cx('wrapper')}>
                <div className={cx('inner')}>
                    <div className={cx('loading', { error: errorMessage })}>
                        <h3>
                            {errorMessage
                                ? 'Không thể tải chi tiết người dùng'
                                : 'Không có dữ liệu người dùng'}
                        </h3>
                        <p>
                            {errorMessage ||
                                'Không tìm thấy hồ sơ phù hợp để hiển thị chi tiết.'}
                        </p>
                        <Button outlineText onClick={handleBack}>
                            Quay lại danh sách
                        </Button>
                    </div>
                </div>
            </section>
        );
    }

    const aiQuotaPercent = getQuotaPercent(
        detail.quotas.aiUsed,
        detail.quotas.aiLimit,
    );
    const exportQuotaPercent = getQuotaPercent(
        detail.quotas.exportUsed,
        detail.quotas.exportLimit,
    );
    const initials = buildInitialLetters(detail.fullName) || 'U';
    const statusIcon = detail.isLocked ? UnlockKeyhole : LockKeyhole;
    const StatusIcon = submittingStatus ? RefreshCw : statusIcon;

    const stats = [
        {
            key: 'cv',
            icon: FileText,
            tone: 'blue',
            label: 'Số CV đã tạo',
            value: formatNumber(detail.stats.cvCount),
        },
        {
            key: 'ai',
            icon: Bot,
            tone: 'violet',
            label: 'Số lần dùng AI',
            value: formatNumber(detail.stats.aiUsageCount),
            hint: `Đã dùng ${aiQuotaPercent}% hạn mức tháng`,
        },
        {
            key: 'package',
            icon: UserRound,
            tone: 'amber',
            label: 'Gói hiện tại',
            value: detail.packageName,
            hint: `Hết hạn: ${formatDate(detail.packageExpiredAt)}`,
        },
        {
            key: 'provider',
            icon: Shield,
            tone: 'green',
            label: 'Provider',
            value: detail.provider,
            hint: detail.emailVerified
                ? 'Email đã xác thực'
                : 'Email chưa xác thực',
        },
    ];

    const infoRows = [
        { label: 'Email', value: detail.email },
        { label: 'Số điện thoại', value: detail.phone },
        { label: 'Trạng thái', value: detail.statusLabel },
        { label: 'Ngày đăng ký', value: formatDate(detail.registeredAt) },
    ];

    const contactRows = [
        { icon: Mail, value: detail.email },
        { icon: Phone, value: detail.phone },
        {
            icon: Calendar,
            value: `Tham gia: ${formatDate(detail.registeredAt)}`,
        },
        { icon: MapPin, value: detail.location },
    ];

    return (
        <section className={cx('wrapper')}>
            <div className={cx('inner')}>
                <header className={cx('header')}>
                    <div>
                        <h1>Hồ sơ người dùng: {detail.fullName}</h1>
                        <p>
                            ID: #{detail.id} • {detail.statusLabel} • Thành viên
                            từ {formatDate(detail.registeredAt)}
                        </p>
                    </div>

                    <div className={cx('headerActions')}>
                        <Button
                            outlineText
                            leftIcon={<ArrowLeft aria-hidden="true" />}
                            onClick={handleBack}
                        >
                            Quay lại
                        </Button>
                        <Button
                            primary={!detail.isLocked}
                            outlineText={detail.isLocked}
                            className={cx('statusAction', {
                                unlock: detail.isLocked,
                            })}
                            leftIcon={
                                <StatusIcon
                                    aria-hidden="true"
                                    className={cx({
                                        spinning: submittingStatus,
                                    })}
                                />
                            }
                            disabled={submittingStatus}
                            onClick={handleToggleStatus}
                        >
                            {detail.isLocked
                                ? 'Mở khóa tài khoản'
                                : 'Khóa tài khoản'}
                        </Button>
                    </div>
                </header>

                {errorMessage ? (
                    <div className={cx('warningBanner')}>
                        <Activity />
                        <span>{errorMessage}</span>
                    </div>
                ) : null}

                {statusActionError ? (
                    <div className={cx('warningBanner', 'dangerBanner')}>
                        <Shield />
                        <span>{statusActionError}</span>
                    </div>
                ) : null}

                <div className={cx('content')}>
                    <aside className={cx('sidebar')}>
                        <section className={cx('card', 'profileCard')}>
                            <div className={cx('avatar')}>
                                {detail.avatarUrl ? (
                                    <img
                                        src={detail.avatarUrl}
                                        alt={detail.fullName}
                                    />
                                ) : (
                                    <span>{initials}</span>
                                )}
                            </div>

                            <h2>{detail.fullName}</h2>
                            <p>Gói: {detail.packageName}</p>

                            <div className={cx('contactList')}>
                                {contactRows.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <span key={item.value}>
                                            <Icon />
                                            {item.value}
                                        </span>
                                    );
                                })}
                            </div>
                        </section>

                        <section className={cx('card')}>
                            <h2>
                                <Shield />
                                Audit log
                            </h2>

                            <div className={cx('auditList')}>
                                {detail.auditLogs.length ? (
                                    detail.auditLogs.map((log) => (
                                        <div
                                            key={log.id}
                                            className={cx('auditItem')}
                                        >
                                            <strong>{log.action}</strong>
                                            <span>{log.actor}</span>
                                            <span>
                                                {formatDateTime(log.timestamp)}
                                            </span>
                                            {log.note ? (
                                                <p>{log.note}</p>
                                            ) : null}
                                        </div>
                                    ))
                                ) : (
                                    <p className={cx('emptyText')}>
                                        Chưa có audit log nào cho tài khoản này.
                                    </p>
                                )}
                            </div>
                        </section>
                    </aside>

                    <main className={cx('mainContent')}>
                        <section className={cx('statsGrid')}>
                            {stats.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <article
                                        key={item.key}
                                        className={cx('statCard')}
                                    >
                                        <span
                                            className={cx(
                                                'statIcon',
                                                item.tone,
                                            )}
                                        >
                                            <Icon />
                                        </span>
                                        <p>{item.label}</p>
                                        <strong>{item.value}</strong>
                                        {item.hint ? (
                                            <small>{item.hint}</small>
                                        ) : null}
                                    </article>
                                );
                            })}
                        </section>

                        <section className={cx('card')}>
                            <h2>
                                <Info />
                                Thông tin tài khoản
                            </h2>

                            <div className={cx('propertyGrid')}>
                                {infoRows.map((item) => (
                                    <div
                                        key={item.label}
                                        className={cx('propertyItem')}
                                    >
                                        <span>{item.label}</span>
                                        <strong>{item.value}</strong>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={cx('card')}>
                            <h2>
                                <Activity />
                                Quota sử dụng
                            </h2>

                            <div className={cx('quotaList')}>
                                <div className={cx('quotaItem')}>
                                    <div className={cx('quotaTop')}>
                                        <span>AI quota</span>
                                        <strong>
                                            {getQuotaText(
                                                detail.quotas.aiUsed,
                                                detail.quotas.aiLimit,
                                            )}
                                        </strong>
                                    </div>
                                    <div className={cx('quotaBar')}>
                                        <span
                                            style={{
                                                width: `${aiQuotaPercent}%`,
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className={cx('quotaItem')}>
                                    <div className={cx('quotaTop')}>
                                        <span>Export quota</span>
                                        <strong>
                                            {getQuotaText(
                                                detail.quotas.exportUsed,
                                                detail.quotas.exportLimit,
                                            )}
                                        </strong>
                                    </div>
                                    <div className={cx('quotaBar')}>
                                        <span
                                            className={cx('greenBar')}
                                            style={{
                                                width: `${exportQuotaPercent}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className={cx('bottomGrid')}>
                            <section className={cx('card')}>
                                <div className={cx('sectionHeader')}>
                                    <h2>
                                        <CheckCircle2 />
                                        Lịch sử giao dịch
                                    </h2>
                                    <span>
                                        {formatNumber(
                                            detail.transactions.length,
                                        )}{' '}
                                        hoạt động
                                    </span>
                                </div>

                                {detail.transactions.length ? (
                                    <div className={cx('historyList')}>
                                        {detail.transactions.map(
                                            (transaction) => (
                                                <div
                                                    key={transaction.id}
                                                    className={cx(
                                                        'historyItem',
                                                    )}
                                                >
                                                    <div>
                                                        <strong>
                                                            {transaction.title}
                                                        </strong>
                                                        <span>
                                                            {formatDate(
                                                                transaction.date,
                                                            )}
                                                            {transaction.reference
                                                                ? ` • ${transaction.reference}`
                                                                : ''}
                                                        </span>
                                                    </div>
                                                    <strong>
                                                        {formatCurrency(
                                                            transaction.amount,
                                                            transaction.currency,
                                                        )}
                                                    </strong>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                ) : (
                                    <p className={cx('emptyText')}>
                                        Chưa có giao dịch nào được ghi nhận.
                                    </p>
                                )}
                            </section>

                            <section className={cx('card')}>
                                <h2>
                                    <Download />
                                    Thống kê nhanh
                                </h2>

                                <div className={cx('metricsList')}>
                                    <div className={cx('metricRow')}>
                                        <span>Số CV đã tạo</span>
                                        <strong>
                                            {formatNumber(detail.stats.cvCount)}
                                        </strong>
                                    </div>
                                    <div className={cx('metricRow')}>
                                        <span>Số lần dùng AI</span>
                                        <strong>
                                            {formatNumber(
                                                detail.stats.aiUsageCount,
                                            )}
                                        </strong>
                                    </div>
                                    <div className={cx('metricRow')}>
                                        <span>Tổng lượt export</span>
                                        <strong>
                                            {formatNumber(
                                                detail.stats.exportCount,
                                            )}
                                        </strong>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </main>
                </div>
            </div>
        </section>
    );
}

export default UserDetailInfo;
