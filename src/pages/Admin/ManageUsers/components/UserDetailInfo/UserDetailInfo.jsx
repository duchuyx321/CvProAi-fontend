import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    Activity,
    ArrowLeft,
    ArrowUpCircle,
    Bot,
    Calendar,
    Check,
    ChevronDown,
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
    updateAdminUserRole,
    updateAdminUserStatus,
} from '~/services/admin-user.service';
import UserUpgradeModal from '../UserUpgradeModal';

import styles from './UserDetailInfo.module.scss';
import {
    formatDate,
    formatNumber,
    getDetailPayload,
    getQuotaText,
    getRoleLabel,
    getUserDetailErrorMessage,
    normalizeAdminUserDetail,
    USER_ROLE_OPTIONS,
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

function UserDetailInfo() {
    const navigate = useNavigate();
    const location = useLocation();
    const { userId } = useParams();
    const listUser = location.state?.user || null;

    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [submittingStatus, setSubmittingStatus] = useState(false);
    const [statusActionError, setStatusActionError] = useState('');
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [roleMenuOpen, setRoleMenuOpen] = useState(false);
    const [submittingRole, setSubmittingRole] = useState(false);
    const roleMenuRef = useRef(null);

    const handleBack = () => {
        navigate(config.router.manageUsers);
    };

    useEffect(() => {
        if (!roleMenuOpen) return undefined;

        const handleClickOutside = (event) => {
            if (
                roleMenuRef.current &&
                !roleMenuRef.current.contains(event.target)
            ) {
                setRoleMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [roleMenuOpen]);

    useEffect(() => {
        let ignore = false;

        const fetchUserDetail = async () => {
            if (!userId) {
                setLoading(false);
                setErrorMessage('Không tìm thấy ID người dùng');
                return;
            }

            try {
                setLoading(true);
                setErrorMessage('');

                const response = await getAdminUserDetail(userId);

                if (response?.success === false) {
                    throw new Error(
                        getUserDetailErrorMessage(
                            response,
                            'Không thể tải chi tiết người dùng',
                        ),
                    );
                }

                const payload = getDetailPayload(response);

                if (!payload || !Object.keys(payload).length) {
                    throw new Error('Không có dữ liệu người dùng');
                }

                if (!ignore) {
                    setDetail(normalizeAdminUserDetail(payload, listUser));
                }
            } catch (error) {
                if (!ignore) {
                    setDetail(null);
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
    }, [userId, refreshTrigger, listUser]);

    const handleUpgradeSuccess = () => {
        setRefreshTrigger((prev) => prev + 1);
        setIsUpgradeModalOpen(false);
    };

    const handleAssignRole = async (nextRole) => {
        if (!detail?.id || submittingRole || detail.role === nextRole) return;

        setSubmittingRole(true);

        try {
            const response = await updateAdminUserRole(detail.id, nextRole);

            if (response?.success === false) {
                throw new Error(
                    getUserDetailErrorMessage(
                        response,
                        'Không thể cập nhật quyền người dùng',
                    ),
                );
            }

            setDetail((current) =>
                current
                    ? {
                          ...current,
                          role: nextRole,
                          roleLabel: getRoleLabel(nextRole),
                      }
                    : current,
            );
            setRoleMenuOpen(false);
            toast.success(`Đã phân quyền: ${getRoleLabel(nextRole)}`);
        } catch (error) {
            toast.error(
                getUserDetailErrorMessage(
                    error,
                    'Không thể cập nhật quyền người dùng',
                ),
            );
        } finally {
            setSubmittingRole(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!detail?.id || submittingStatus) return;

        const shouldLock = !detail.isLocked;
        setSubmittingStatus(true);
        setStatusActionError('');

        try {
            const response = await updateAdminUserStatus(detail.id, {
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

            setDetail((current) =>
                current
                    ? {
                          ...current,
                          isLocked: shouldLock,
                          isOnline: !shouldLock,
                          statusLabel: shouldLock
                              ? 'Bị khóa'
                              : 'Hoạt động',
                      }
                    : current,
            );

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

    if (errorMessage && !detail) {
        return (
            <section className={cx('wrapper')}>
                <div className={cx('inner')}>
                    <div className={cx('loading', { error: true })}>
                        <h3>Không thể tải chi tiết người dùng</h3>
                        <p>{errorMessage}</p>
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
    const cvQuotaPercent = getQuotaPercent(
        detail.quotas.cvUsed,
        detail.quotas.cvLimit,
    );
    const initials = buildInitialLetters(detail.fullName) || 'U';
    const statusIcon = detail.isLocked ? UnlockKeyhole : LockKeyhole;
    const StatusIcon = submittingStatus ? RefreshCw : statusIcon;
    const isAdminRole = detail.role === 'ADMIN';

    const stats = [
        {
            key: 'cv',
            icon: FileText,
            tone: 'blue',
            label: 'CV đã tạo',
            value: formatNumber(detail.stats.cvCount),
        },
        {
            key: 'ai',
            icon: Bot,
            tone: 'violet',
            label: 'Lượt dùng AI',
            value: formatNumber(detail.stats.aiUsageCount),
            hint: `${aiQuotaPercent}% hạn mức`,
        },
        {
            key: 'export',
            icon: Activity,
            tone: 'green',
            label: 'Lượt export',
            value: formatNumber(detail.stats.exportCount),
            hint: `${exportQuotaPercent}% hạn mức`,
        },
        {
            key: 'package',
            icon: UserRound,
            tone: 'amber',
            label: 'Gói dịch vụ',
            value: detail.planName,
            hint: `Hết hạn ${formatDate(detail.packageExpiredAt)}`,
        },
    ];

    const infoRows = [
        { label: 'Email', value: detail.email },
        { label: 'Số điện thoại', value: detail.phone },
        { label: 'Vai trò', value: detail.roleLabel },
        { label: 'Trạng thái', value: detail.statusLabel },
        { label: 'Provider', value: detail.provider },
        { label: 'Gói hiện tại', value: detail.planName },
        { label: 'Ngày đăng ký', value: formatDate(detail.registeredAt) },
    ];

    const quotaItems = [
        {
            key: 'cv',
            label: 'CV',
            used: detail.quotas.cvUsed,
            limit: detail.quotas.cvLimit,
            percent: cvQuotaPercent,
            barClass: 'cvBar',
        },
        {
            key: 'ai',
            label: 'AI',
            used: detail.quotas.aiUsed,
            limit: detail.quotas.aiLimit,
            percent: aiQuotaPercent,
            barClass: 'aiBar',
        },
        {
            key: 'export',
            label: 'Export',
            used: detail.quotas.exportUsed,
            limit: detail.quotas.exportLimit,
            percent: exportQuotaPercent,
            barClass: 'exportBar',
        },
    ];

    return (
        <section className={cx('wrapper')}>
            <div className={cx('inner')}>
                <header className={cx('header')}>
                    <div className={cx('headerIntro')}>
                        <button
                            type="button"
                            className={cx('backLink')}
                            onClick={handleBack}
                        >
                            <ArrowLeft aria-hidden="true" />
                            Quay lại danh sách
                        </button>
                        <h1>{detail.fullName}</h1>
                        <p>ID #{detail.id}</p>
                    </div>

                    <div className={cx('headerActions')}>
                        {!isAdminRole ? (
                            <Button
                                outlineText
                                className={cx('upgradeAction')}
                                leftIcon={<ArrowUpCircle aria-hidden="true" />}
                                onClick={() => setIsUpgradeModalOpen(true)}
                            >
                                Nâng cấp
                            </Button>
                        ) : null}

                        <div className={cx('roleMenuWrap')} ref={roleMenuRef}>
                            <Button
                                outlineText
                                className={cx('roleAction')}
                                leftIcon={<Shield aria-hidden="true" />}
                                rightIcon={
                                    <ChevronDown
                                        aria-hidden="true"
                                        className={cx('roleChevron', {
                                            open: roleMenuOpen,
                                        })}
                                    />
                                }
                                disabled={submittingRole || loading}
                                onClick={() =>
                                    setRoleMenuOpen((open) => !open)
                                }
                            >
                                Phân quyền
                            </Button>

                            {roleMenuOpen ? (
                                <div className={cx('roleDropdown')}>
                                    {USER_ROLE_OPTIONS.map((option) => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            className={cx('roleOption', {
                                                active:
                                                    detail.role ===
                                                    option.value,
                                            })}
                                            disabled={
                                                submittingRole ||
                                                detail.role === option.value
                                            }
                                            onClick={() =>
                                                handleAssignRole(option.value)
                                            }
                                        >
                                            <span>{option.label}</span>
                                            {detail.role === option.value ? (
                                                <Check aria-hidden="true" />
                                            ) : null}
                                        </button>
                                    ))}
                                </div>
                            ) : null}
                        </div>

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
                            disabled={submittingStatus || loading}
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

                <div className={cx('content', { isRefreshing: loading })}>
                    <section className={cx('profileHero')}>
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

                        <div className={cx('profileBody')}>
                            <div className={cx('badgeRow')}>
                                <span
                                    className={cx('badge', 'role', detail.role)}
                                >
                                    {detail.roleLabel}
                                </span>
                                <span
                                    className={cx('badge', 'status', {
                                        locked: detail.isLocked,
                                        active:
                                            !detail.isLocked && detail.isOnline,
                                    })}
                                >
                                    {detail.statusLabel}
                                </span>
                                <span className={cx('badge', 'provider')}>
                                    {detail.provider}
                                </span>
                                <span
                                    className={cx(
                                        'badge',
                                        detail.emailVerified
                                            ? 'emailVerified'
                                            : 'emailPending',
                                    )}
                                >
                                    {detail.emailVerified
                                        ? 'Email đã xác thực'
                                        : 'Email chưa xác thực'}
                                </span>
                            </div>

                            <div className={cx('contactRow')}>
                                <span>
                                    <Mail />
                                    {detail.email}
                                </span>
                                <span>
                                    <Phone />
                                    {detail.phone}
                                </span>
                                <span>
                                    <Calendar />
                                    Tham gia {formatDate(detail.registeredAt)}
                                </span>
                                <span>
                                    <MapPin />
                                    {detail.location}
                                </span>
                            </div>

                            {!isAdminRole ? (
                                <p className={cx('packageNote')}>
                                    <span className={cx('planBadge')}>
                                        {detail.planName}
                                    </span>
                                    <span className={cx('packageExpiry')}>
                                        Hết hạn{' '}
                                        {formatDate(detail.packageExpiredAt)}
                                    </span>
                                </p>
                            ) : null}
                        </div>
                    </section>

                    <section className={cx('statsGrid')}>
                        {stats.map((item) => {
                            const Icon = item.icon;

                            return (
                                <article
                                    key={item.key}
                                    className={cx('statCard')}
                                >
                                    <span
                                        className={cx('statIcon', item.tone)}
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

                    <div className={cx('detailsGrid')}>
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
                                Hạn mức sử dụng
                            </h2>

                            <div className={cx('quotaList')}>
                                {quotaItems.map((item) => (
                                    <div
                                        key={item.key}
                                        className={cx('quotaItem')}
                                    >
                                        <div className={cx('quotaTop')}>
                                            <span>{item.label}</span>
                                            <strong>
                                                {getQuotaText(
                                                    item.used,
                                                    item.limit,
                                                )}
                                            </strong>
                                        </div>
                                        <div className={cx('quotaBar')}>
                                            <span
                                                className={cx(item.barClass)}
                                                style={{
                                                    width: `${item.percent}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {loading ? (
                        <div className={cx('refreshOverlay')}>
                            <RefreshCw className={cx('spinning')} />
                            <span>Đang cập nhật dữ liệu...</span>
                        </div>
                    ) : null}
                </div>
            </div>

            <UserUpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                user={detail}
                onSuccess={handleUpgradeSuccess}
            />
        </section>
    );
}

export default UserDetailInfo;
