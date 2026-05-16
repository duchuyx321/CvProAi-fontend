import classNames from 'classnames/bind';
import { useCallback, useEffect, useState } from 'react';
import {
    MdOutlineDeleteOutline,
    MdOutlineEdit,
    MdOutlineFileDownload,
    MdOutlineVisibility,
} from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import GenericAdminToolbar from '~/components/GenericAdminToolbar';
import Pagination from '~/components/Pagination';
import { config } from '~/config';
import DeletePackageModal from './components/DeletePackageModal';
import ExportModal from './components/ExportModal';
import PackageTable from './components/PackageTable';
import {
    DEFAULT_EXPORT_CONFIG,
    EXPORT_COLUMN_OPTIONS,
    EXPORT_DATE_RANGE_OPTIONS,
    exportPackageRows,
    formatCurrency,
    formatDuration,
    PACKAGE_RANGE_OPTIONS,
    PACKAGE_SORT_OPTIONS,
    PAGE_SIZE,
    STATUS_LABEL_MAP,
    usePackageDelete,
    usePackageFilters,
    usePackageList,
} from './managePackages.utils';
import styles from './ManagePackages.module.scss';

const cx = classNames.bind(styles);

const STATUS_FILTER_OPTIONS = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'ACTIVE', label: STATUS_LABEL_MAP.ACTIVE },
    { value: 'PAUSED', label: STATUS_LABEL_MAP.PAUSED },
];

const getPackageRouteKey = (item) => item.slug || item.id;

function ManagePackages() {
    const navigate = useNavigate();
    const location = useLocation();

    const { packageList, setPackageList, loading, loadError, loadPackages } =
        usePackageList();

    const {
        filters,
        currentPage,
        totalPages,
        filteredPackages,
        paginatedPackages,
        setCurrentPage,
        handleChangeFilter,
        handleToolbarChange,
    } = usePackageFilters(packageList);

    const {
        isDeleteModalOpen,
        selectedPackage,
        deleting,
        handleOpenDeleteModal,
        handleCloseDeleteModal,
        handleConfirmDelete,
    } = usePackageDelete({ setPackageList, loadPackages });

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportConfig, setExportConfig] = useState(DEFAULT_EXPORT_CONFIG);

    useEffect(() => {
        if (location.state?.shouldReload) {
            loadPackages();
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [loadPackages, location.pathname, location.state, navigate]);

    const handleView = useCallback(
        (item) =>
            navigate(
                `${config.router.packageDetail.replace(':packageId', getPackageRouteKey(item))}?mode=view`,
                { state: { package: item } },
            ),
        [navigate],
    );

    const handleEdit = useCallback(
        (item) =>
            navigate(
                config.router.packageDetail.replace(':packageId', getPackageRouteKey(item)),
                { state: { package: item } },
            ),
        [navigate],
    );

    const handleOpenCreate = useCallback(
        () => navigate(config.router.createPackage),
        [navigate],
    );

    const totalItems = filteredPackages.length;
    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(currentPage * PAGE_SIZE, totalItems);

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
                        className={cx('btnOutline')}
                        onClick={() => setIsExportModalOpen(true)}
                    >
                        <MdOutlineFileDownload />
                        Xuất danh sách
                    </button>
                    <button
                        type="button"
                        className={cx('btnPrimary')}
                        onClick={handleOpenCreate}
                    >
                        + Thêm gói dịch vụ
                    </button>
                </div>
            </header>

            <div className={cx('toolbar')}>
                <GenericAdminToolbar
                    sortOptions={PACKAGE_SORT_OPTIONS}
                    rangeOptions={PACKAGE_RANGE_OPTIONS}
                    defaultSortBy="createdAt"
                    defaultSortOrder="DESC"
                    defaultRange="all"
                    searchPlaceholder="Tìm kiếm theo mã hoặc tên gói..."
                    onChange={handleToolbarChange}
                />
                <div className={cx('statusFilter')}>
                    <label className={cx('statusLabel')}>Trạng thái</label>
                    <select
                        className={cx('statusSelect')}
                        value={filters.status}
                        onChange={(e) =>
                            handleChangeFilter('status', e.target.value)
                        }
                    >
                        {STATUS_FILTER_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {loadError ? (
                <p className={cx('helperText')}>{loadError}</p>
            ) : null}

            <div className={cx('tableCard')}>
                <PackageTable
                    loading={loading}
                    packages={paginatedPackages}
                    formatCurrency={formatCurrency}
                    formatDuration={formatDuration}
                    renderActions={(item) => (
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
                                className={cx('iconBtn', 'iconBtnDanger')}
                                onClick={() => handleOpenDeleteModal(item)}
                                title="Xóa gói dịch vụ"
                                aria-label={`Xóa gói ${item.name}`}
                            >
                                <MdOutlineDeleteOutline />
                            </button>
                        </>
                    )}
                />
            </div>

            <div className={cx('footer')}>
                <span className={cx('summary')}>
                    Hiển thị {startItem} – {endItem} trong {totalItems} gói
                    dịch vụ
                </span>
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    disabled={loading}
                />
            </div>

            <ExportModal
                open={isExportModalOpen}
                value={exportConfig}
                columnOptions={EXPORT_COLUMN_OPTIONS}
                dateRangeOptions={EXPORT_DATE_RANGE_OPTIONS}
                onChange={setExportConfig}
                onClose={() => setIsExportModalOpen(false)}
                onConfirm={async (nextConfig) => {
                    await exportPackageRows(filteredPackages, nextConfig);
                    setIsExportModalOpen(false);
                }}
            />

            <DeletePackageModal
                open={isDeleteModalOpen}
                packageItem={selectedPackage}
                submitting={deleting}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
}

export default ManagePackages;
