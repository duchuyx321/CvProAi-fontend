import { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import { Eye, LoaderCircle, Lock, RefreshCw, Unlock, ArrowUpCircle } from 'lucide-react';
import { toast } from 'react-toastify';

import GenericAdminToolbar from '~/components/GenericAdminToolbar';
import Pagination from '~/components/Pagination';
import { config } from '~/config';
import {
    getAdminUsers,
    updateAdminUserStatus,
} from '~/services/admin-user.service';

import UserUpgradeModal from './components/UserUpgradeModal';

import styles from './ManageUsers.module.scss';
import {
    DEFAULT_FILTERS,
    DEFAULT_META,
    PAGE_SIZE,
    SortOrder,
    UserSortBy,
    USER_RANGE_OPTIONS,
    USER_SORT_OPTIONS,
    buildAdminUsersQuery,
    formatDate,
    formatNumber,
    getErrorMessage,
    getPaginationFromPayload,
    getUserDisplayId,
    getUsersFromPayload,
    normalizeAdminUser,
} from './manageUsers.utils';


const cx = classNames.bind(styles);

function getPageFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const pageParam = Number(params.get('page'));
    return pageParam > 0 ? pageParam : 1;
}

function syncPageToUrl(nextPage, replace = false) {
    const params = new URLSearchParams(window.location.search);
    params.set('page', String(nextPage));

    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    const method = replace ? 'replaceState' : 'pushState';

    window.history[method](null, '', nextUrl);
}

function getUpdatedUserPayload({ user, payload, shouldLock }) {
    return {
        ...user.raw,
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
            (shouldLock ? false : user.isOnline),
    };
}

function ManageUsers() {
    const navigate = useNavigate();

    const [page, setPage] = useState(getPageFromUrl);
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState(DEFAULT_META);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [submittingUserId, setSubmittingUserId] = useState('');
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [selectedUpgradeUser, setSelectedUpgradeUser] = useState(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const pageParam = Number(params.get('page'));

        if (!params.get('page') || pageParam <= 0 || Number.isNaN(pageParam)) {
            syncPageToUrl(1, true);
            setPage(1);
        }
    }, []);

    useEffect(() => {
        let ignore = false;

        const fetchUsers = async () => {
            try {
                setLoading(true);
                setErrorMessage('');

                const response = await getAdminUsers(
                    buildAdminUsersQuery({
                        page,
                        limit: PAGE_SIZE,
                        ...filters,
                    }),
                );

                if (response?.success === false) {
                    throw new Error(
                        getErrorMessage(
                            response,
                            'Không thể tải danh sách người dùng',
                        ),
                    );
                }

                const nextUsers = getUsersFromPayload(response).map(normalizeAdminUser);
                const nextMeta = getPaginationFromPayload(response, PAGE_SIZE);

                if (ignore) return;

                setUsers(nextUsers);
                setMeta(nextMeta);
            } catch (error) {
                if (ignore) return;

                setUsers([]);
                setMeta(DEFAULT_META);
                setErrorMessage(
                    getErrorMessage(
                        error,
                        'Không thể tải danh sách người dùng',
                    ),
                );
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchUsers();

        return () => {
            ignore = true;
        };
    }, [page, filters]);

    const totalPages = Math.max(Number(meta?.total_pages) || 1, 1);
    const totalItems = Number(meta?.total_items) || users.length;
    const limit = Number(meta?.limit) || PAGE_SIZE;
    const startItem = totalItems ? (page - 1) * limit + 1 : 0;
    const endItem = totalItems ? Math.min(page * limit, totalItems) : 0;

    const handlePageChange = useCallback(
        (newPage) => {
            if (newPage < 1 || newPage > totalPages || newPage === page) {
                return;
            }

            setPage(newPage);
            syncPageToUrl(newPage);
        },
        [page, totalPages],
    );

    const handleToolbarChange = useCallback(
        ({ search, sort, range }) => {
            const nextFilters = {
                search: search || '',
                sort_by: sort?.sort_by || UserSortBy.UPDATED_AT,
                sort_order: sort?.sort_order || SortOrder.DESC,
                range: '',
                from: '',
                to: '',
            };

            if (typeof range === 'string') {
                nextFilters.range = range;
            } else {
                nextFilters.range = 'custom';
                nextFilters.from = range?.from || '';
                nextFilters.to = range?.to || '';
            }

            const isSame =
                filters.search === nextFilters.search &&
                filters.sort_by === nextFilters.sort_by &&
                filters.sort_order === nextFilters.sort_order &&
                filters.range === nextFilters.range &&
                filters.from === nextFilters.from &&
                filters.to === nextFilters.to;

            if (isSame) return;

            setFilters(nextFilters);
            setPage(1);
            syncPageToUrl(1, true);
        },
        [filters],
    );

    const handleViewUser = useCallback(
        (user) => {
            navigate(
                config.router.manageUsersDetail.replace(':userId', user.id),
                { state: { user } },
            );
        },
        [navigate],
    );

    const handleUpgradeUser = useCallback((user) => {
        setSelectedUpgradeUser(user);
    }, []);

    const handleRetryFetch = () => {
        setPage(1);
        syncPageToUrl(1, true);
        setFilters((previousFilters) => ({ ...previousFilters }));
    };

    const handleToggleUserStatus = async (user) => {
        if (!user?.id || submittingUserId === user.id) return;

        const shouldLock = !user.isLocked;
        setSubmittingUserId(user.id);

        try {
            const response = await updateAdminUserStatus(user.id, {
                action: shouldLock ? 'lock' : 'unlock',
            });

            if (response?.success === false) {
                throw new Error(
                    getErrorMessage(
                        response,
                        shouldLock
                            ? 'Không thể khóa tài khoản'
                            : 'Không thể mở khóa tài khoản',
                    ),
                );
            }

            const updatedUser = normalizeAdminUser(
                getUpdatedUserPayload({
                    user,
                    payload: response?.data,
                    shouldLock,
                }),
            );

            setUsers((currentUsers) =>
                currentUsers.map((currentUser) =>
                    currentUser.id === user.id ? updatedUser : currentUser,
                ),
            );

            toast.success(
                shouldLock
                    ? 'Đã khóa tài khoản người dùng'
                    : 'Đã mở khóa tài khoản người dùng',
            );
        } catch (error) {
            toast.error(
                getErrorMessage(
                    error,
                    shouldLock
                        ? 'Không thể khóa tài khoản người dùng'
                        : 'Không thể mở khóa tài khoản người dùng',
                ),
            );
        } finally {
            setSubmittingUserId('');
        }
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <div className={cx('title')}>
                    <h3>Quản lý người dùng</h3>
                    <p>
                        Theo dõi tài khoản, lọc nhanh theo thời gian và khóa
                        hoặc mở khóa người dùng trực tiếp trên bảng.
                    </p>
                </div>

                <div className={cx('summaryCard')}>
                    <span>Tổng người dùng</span>
                    <strong>{formatNumber(totalItems)}</strong>
                    <small>
                        {loading
                            ? 'Đang cập nhật...'
                            : `Trang ${page}/${totalPages}`}
                    </small>
                </div>
            </header>

            <div className={cx('toolbar')}>
                <GenericAdminToolbar
                    sortOptions={USER_SORT_OPTIONS}
                    rangeOptions={USER_RANGE_OPTIONS}
                    defaultSortBy={DEFAULT_FILTERS.sort_by}
                    defaultSortOrder={DEFAULT_FILTERS.sort_order}
                    defaultRange={DEFAULT_FILTERS.range}
                    onChange={handleToolbarChange}
                    searchPlaceholder="Tìm theo tên, email hoặc provider..."
                    searchLoading={loading && Boolean(filters.search)}
                />
            </div>

            <div className={cx('tableCard')}>
                <div className={cx('tableScroll')}>
                    <table className={cx('table')}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Người dùng</th>
                                <th>Email</th>
                                <th>Provider</th>
                                <th>Gói hiện tại</th>
                                <th>Số CV</th>
                                <th>Trạng thái</th>
                                <th>Ngày đăng ký</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => {
                                const isSubmitting = submittingUserId === user.id;

                                return (
                                    <tr key={user.id}>
                                        <td className={cx('idCell')}>
                                            {getUserDisplayId(user)}
                                        </td>
                                        <td>
                                            <div className={cx('userInfo')}>
                                                <span className={cx('avatar')}>
                                                    {user.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.fullName}
                                                        />
                                                    ) : (
                                                        user.fullName
                                                            .charAt(0)
                                                            .toUpperCase()
                                                    )}
                                                </span>
                                                <span className={cx('userName')}>
                                                    {user.fullName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={cx('contactCell')}>
                                            {user.email}
                                        </td>
                                        <td>
                                            <span className={cx('providerBadge')}>
                                                {user.provider}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={cx('planBadge')}>
                                                {user.planName}
                                            </span>
                                        </td>
                                        <td className={cx('numberCell')}>
                                            {formatNumber(user.cvCount)}
                                        </td>
                                        <td>
                                            <span
                                                className={cx('statusBadge', {
                                                    locked: user.isLocked,
                                                    active: !user.isLocked && user.isOnline,
                                                    inactive: !user.isLocked && !user.isOnline,
                                                })}
                                            >
                                                {user.statusLabel}
                                            </span>
                                        </td>
                                        <td className={cx('dateCell')}>
                                            {formatDate(user.registeredAt)}
                                        </td>
                                        <td>
                                            <div className={cx('actions')}>
                                                <button
                                                    type="button"
                                                    className={cx('iconButton')}
                                                    aria-label={`Xem ${user.fullName}`}
                                                    onClick={() => handleViewUser(user)}
                                                    title="Xem"
                                                >
                                                    <Eye />
                                                </button>
                                                <button
                                                    type="button"
                                                    className={cx('iconButton', 'upgrade')}
                                                    aria-label={`Nâng cấp ${user.fullName}`}
                                                    onClick={() => handleUpgradeUser(user)}
                                                    title="Nâng cấp tài khoản"
                                                >
                                                    <ArrowUpCircle />
                                                </button>
                                                <button
                                                    type="button"
                                                    className={cx('iconButton', {
                                                        danger: !user.isLocked,
                                                        success: user.isLocked,
                                                    })}
                                                    aria-label={
                                                        user.isLocked
                                                            ? `Mở khóa ${user.fullName}`
                                                            : `Khóa ${user.fullName}`
                                                    }
                                                    disabled={isSubmitting}
                                                    onClick={() => handleToggleUserStatus(user)}
                                                    title={user.isLocked ? 'Mở khóa' : 'Khóa'}
                                                >
                                                    {isSubmitting ? (
                                                        <LoaderCircle className={cx('spinning')} />
                                                    ) : user.isLocked ? (
                                                        <Unlock />
                                                    ) : (
                                                        <Lock />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {!loading && errorMessage ? (
                                <tr>
                                    <td className={cx('emptyCell')} colSpan="9">
                                        <div className={cx('errorState')}>
                                            <span>{errorMessage}</span>
                                            <button type="button" onClick={handleRetryFetch}>
                                                <RefreshCw />
                                                Thử lại
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : null}

                            {!loading && !errorMessage && !users.length ? (
                                <tr>
                                    <td className={cx('emptyCell')} colSpan="9">
                                        Chưa có người dùng phù hợp.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>

                    {loading ? (
                        <div className={cx('loadingOverlay')}>
                            <span className={cx('loader')} />
                            <span>Đang tải danh sách người dùng...</span>
                        </div>
                    ) : null}
                </div>

                <div className={cx('tableFooter')}>
                    <p>
                        Hiển thị {startItem} - {endItem} của {totalItems} người dùng
                    </p>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        disabled={loading}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            <UserUpgradeModal
                isOpen={Boolean(selectedUpgradeUser)}
                onClose={() => setSelectedUpgradeUser(null)}
                user={selectedUpgradeUser}
                onSuccess={() => handleRetryFetch()}
            />
        </div>
    );
}

export default ManageUsers;