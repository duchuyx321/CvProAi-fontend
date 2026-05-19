import classNames from 'classnames/bind';
import { useCallback, useEffect, useState } from 'react';
import {
    MdOutlineAdd,
    MdOutlineEdit,
    MdOutlineLock,
    MdOutlineLockOpen,
    MdOutlineSync,
    MdOutlineVisibility,
} from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import GenericAdminToolbar from '~/components/GenericAdminToolbar';
import Pagination from '~/components/Pagination';
import { config } from '~/config';
import { getPackages } from '~/services/managePackageService';
import PackageTable from './components/PackageTable';
import {
    DEFAULT_FILTERS,
    DEFAULT_META,
    PACKAGE_RANGE_OPTIONS,
    PACKAGE_SORT_OPTIONS,
    PAGE_SIZE,
    buildPackageQuery,
    formatCurrency,
    formatDuration,
    getApiMessage,
    getErrorMessage,
    getPackageItemsFromResponse,
    getPaginationFromResponse,
    isSamePackageFilters,
    normalizePackageList,
    normalizeToolbarFilters,
    usePackageStatusAction,
} from './managePackages.utils';
import styles from './ManagePackages.module.scss';

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

const getPackageRouteKey = (item) => item?.slug || item?.id;

function ManagePackages() {
    const navigate = useNavigate();
    const location = useLocation();

    const [page, setPage] = useState(getPageFromUrl);
    const [packages, setPackages] = useState([]);
    const [meta, setMeta] = useState(DEFAULT_META);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [filters, setFilters] = useState(DEFAULT_FILTERS);
    const [reloadToken, setReloadToken] = useState(0);

    const reloadPackages = useCallback(() => {
        setReloadToken((current) => current + 1);
    }, []);

    const handleAfterStatusChanged = useCallback((updatedPackage) => {
        setPackages((currentPackages) =>
            currentPackages.map((item) =>
                item.id === updatedPackage.id ? updatedPackage : item,
            ),
        );
    }, []);

    const {
        submittingPackageId,
        handleTogglePackageStatus,
    } = usePackageStatusAction({ onStatusChanged: handleAfterStatusChanged });

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

        const fetchPackages = async () => {
            try {
                setLoading(true);
                setLoadError('');

                const response = await getPackages(
                    buildPackageQuery({
                        ...filters,
                        page,
                        limit: PAGE_SIZE,
                    }),
                );

                if (response?.success === false) {
                    throw new Error(
                        getApiMessage(
                            response,
                            'Không thể tải danh sách gói dịch vụ',
                        ),
                    );
                }

                const normalizedPackages = normalizePackageList(
                    getPackageItemsFromResponse(response),
                );
                const { hasPagination, meta: nextMeta } =
                    getPaginationFromResponse(response, PAGE_SIZE);

                if (ignore) return;

                setPackages(normalizedPackages);
                setMeta(
                    hasPagination
                        ? {
                              ...nextMeta,
                              total_items:
                                  nextMeta.total_items ||
                                  normalizedPackages.length,
                          }
                        : {
                              page,
                              limit: PAGE_SIZE,
                              total_items: normalizedPackages.length,
                              total_pages: 1,
                          },
                );
            } catch (error) {
                if (ignore) return;

                setPackages([]);
                setMeta(DEFAULT_META);
                setLoadError(
                    getErrorMessage(
                        error,
                        'Không thể tải danh sách gói dịch vụ',
                    ),
                );
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchPackages();

        return () => {
            ignore = true;
        };
    }, [filters, page, reloadToken]);

    useEffect(() => {
        if (!location.state?.shouldReload) return;

        reloadPackages();
        navigate(location.pathname, { replace: true, state: {} });
    }, [location.pathname, location.state, navigate, reloadPackages]);

    const totalPages = Math.max(Number(meta?.total_pages) || 1, 1);
    const totalItems = Number(meta?.total_items) || packages.length;
    const limit = Number(meta?.limit) || PAGE_SIZE;
    const startItem = totalItems ? (page - 1) * limit + 1 : 0;
    const endItem = totalItems ? Math.min(page * limit, totalItems) : 0;

    const handlePageChange = useCallback(
        (nextPage) => {
            if (nextPage < 1 || nextPage > totalPages || nextPage === page) {
                return;
            }

            setPage(nextPage);
            syncPageToUrl(nextPage);
        },
        [page, totalPages],
    );

    const handleToolbarChange = useCallback(
        ({ search, sort, range }) => {
            const nextFilters = normalizeToolbarFilters({ search, sort, range });

            if (isSamePackageFilters(filters, nextFilters)) return;

            setFilters(nextFilters);
            setPage(1);
            syncPageToUrl(1, true);
        },
        [filters],
    );

    const handleView = useCallback(
        (item) => {
            const routeKey = getPackageRouteKey(item);
            if (!routeKey) return;

            navigate(
                `${config.router.packageDetail.replace(
                    ':slug',
                    routeKey,
                )}?mode=view`,
            );
        },
        [navigate],
    );

    const handleEdit = useCallback(
        (item) => {
            const routeKey = getPackageRouteKey(item);
            if (!routeKey) return;

            navigate(config.router.packageDetail.replace(':slug', routeKey));
        },
        [navigate],
    );

    const handleOpenCreate = useCallback(
        () => navigate(config.router.createPackage),
        [navigate],
    );

    return (
        <div className={cx('wrapper')}>
            <header>
                <div className={cx('title')}>
                    <h3>Quản lý gói dịch vụ</h3>
                    <p>
                        Quản lý danh sách gói dịch vụ, lọc dữ liệu và theo dõi
                        trạng thái sử dụng.
                    </p>
                </div>
                <div className={cx('headerActions')}>
                    <button
                        type="button"
                        className={cx('btnPrimary')}
                        onClick={handleOpenCreate}
                    >
                        <MdOutlineAdd />
                        Thêm gói dịch vụ
                    </button>
                </div>
            </header>

            <div className={cx('toolbar')}>
                <GenericAdminToolbar
                    sortOptions={PACKAGE_SORT_OPTIONS}
                    rangeOptions={PACKAGE_RANGE_OPTIONS}
                    defaultSortBy={DEFAULT_FILTERS.sort_by}
                    defaultSortOrder={DEFAULT_FILTERS.sort_order}
                    defaultRange={DEFAULT_FILTERS.range}
                    searchPlaceholder="Tìm kiếm theo tên gói..."
                    searchLoading={loading && Boolean(filters.search)}
                    onChange={handleToolbarChange}
                />
            </div>

            {loadError ? <p className={cx('helperText')}>{loadError}</p> : null}

            <div className={cx('tableCard')}>
                <PackageTable
                    loading={loading}
                    packages={packages}
                    formatCurrency={formatCurrency}
                    formatDuration={formatDuration}
                    renderActions={(item) => {
                        const isSubmitting = submittingPackageId === item.id;
                        const isActive = item.status === 'ACTIVE';
                        const statusActionTitle = isActive
                            ? 'Khóa gói dịch vụ'
                            : 'Mở khóa gói dịch vụ';

                        return (
                            <>
                                <button
                                    type="button"
                                    className={cx('iconBtn')}
                                    onClick={() => handleView(item)}
                                    title="Xem chi tiết"
                                    aria-label={`Xem chi tiết ${item.name}`}
                                >
                                    <MdOutlineVisibility />
                                </button>
                                <button
                                    type="button"
                                    className={cx('iconBtn')}
                                    onClick={() => handleEdit(item)}
                                    title="Chỉnh sửa"
                                    aria-label={`Chỉnh sửa ${item.name}`}
                                >
                                    <MdOutlineEdit />
                                </button>
                                <button
                                    type="button"
                                    className={cx('iconBtn', {
                                        iconBtnDanger: isActive,
                                        iconBtnSuccess: !isActive,
                                    })}
                                    onClick={() => handleTogglePackageStatus(item)}
                                    title={statusActionTitle}
                                    aria-label={`${statusActionTitle} ${item.name}`}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <MdOutlineSync className={cx('spinning')} />
                                    ) : isActive ? (
                                        <MdOutlineLock />
                                    ) : (
                                        <MdOutlineLockOpen />
                                    )}
                                </button>
                            </>
                        );
                    }}
                />
            </div>

            <div className={cx('footer')}>
                <span className={cx('summary')}>
                    Hiển thị {startItem} - {endItem} trong {totalItems} gói dịch vụ
                </span>
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    disabled={loading}
                />
            </div>

        </div>
    );
}

export default ManagePackages;
