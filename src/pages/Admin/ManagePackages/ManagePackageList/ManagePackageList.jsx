import classNames from 'classnames/bind';
import { useCallback, useEffect, useState } from 'react';
import {
    MdOutlineDeleteOutline,
    MdOutlineEdit,
    MdOutlineVisibility,
} from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { config } from '~/config';
import ActionBar from './components/ActionBar';
import DeletePackageModal from './components/DeletePackageModal';
import ExportModal from './components/ExportModal';
import PackageTable from './components/PackageTable';
import {
    DEFAULT_EXPORT_CONFIG,
    EXPORT_COLUMN_OPTIONS,
    EXPORT_DATE_RANGE_OPTIONS,
    PAGE_SIZE,
} from './constants';
import { usePackageDelete } from './hooks/usePackageDelete';
import { usePackageFilters } from './hooks/usePackageFilters';
import { usePackageList } from './hooks/usePackageList';
import { exportPackageRows } from './utils/packageExport';
import { formatCurrency, formatDuration } from './utils/packageFormatters';
import styles from './ManagePackageList.module.scss';

const cx = classNames.bind(styles);

function ManagePackageList() {
    const navigate = useNavigate();
    const location = useLocation();

    const {
        packageList,
        setPackageList,
        loading,
        loadError,
        loadPackages,
    } = usePackageList();

    const {
        filters,
        searchValue,
        currentPage,
        totalPages,
        filteredPackages,
        paginatedPackages,
        setCurrentPage,
        handleChangeFilter,
        handleChangeDateFilter,
        handleChangeSearch,
    } = usePackageFilters(packageList);

    const {
        isDeleteModalOpen,
        selectedPackage,
        deleting,
        handleOpenDeleteModal,
        handleCloseDeleteModal,
        handleConfirmDelete,
    } = usePackageDelete({
        setPackageList,
        loadPackages,
    });

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportConfig, setExportConfig] = useState(DEFAULT_EXPORT_CONFIG);

    useEffect(() => {
        if (location.state?.shouldReload) {
            loadPackages();
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [loadPackages, location.pathname, location.state, navigate]);

    const handleView = useCallback(
        (item) => {
            navigate(
                `${config.router.packageDetail.replace(':packageId', item.id)}?mode=view`
            );
        },
        [navigate]
    );

    const handleEdit = useCallback(
        (item) => {
            navigate(config.router.packageDetail.replace(':packageId', item.id));
        },
        [navigate]
    );

    const handleOpenCreate = useCallback(() => {
        navigate(config.router.createPackage);
    }, [navigate]);

    const handleOpenExportModal = useCallback(() => {
        setIsExportModalOpen(true);
    }, []);

    const handleCloseExportModal = useCallback(() => {
        setIsExportModalOpen(false);
    }, []);

    const handleOpenTrash = useCallback(() => {
        window.alert('Tính năng Thùng rác sẽ được triển khai ở bước tiếp theo.');
    }, []);

    const handleConfirmExport = useCallback(
        (nextConfig) => {
            exportPackageRows(filteredPackages, nextConfig);
            setIsExportModalOpen(false);
        },
        [filteredPackages]
    );

    return (
        <section className={cx('page')}>
            <div className={cx('pageHeader')}>
                <h1 className={cx('pageTitle')}>Quản lý gói dịch vụ</h1>
                <p className={cx('pageDescription')}>
                    Quản lý danh sách gói dịch vụ, lọc dữ liệu và theo dõi trạng thái sử dụng.
                </p>
            </div>

            <ActionBar
                filters={filters}
                searchValue={searchValue}
                onChangeFilter={handleChangeFilter}
                onChangeDateFilter={handleChangeDateFilter}
                onChangeSearch={handleChangeSearch}
                onTrash={handleOpenTrash}
                onExport={handleOpenExportModal}
                onOpenCreate={handleOpenCreate}
            />

            {loadError ? <p className={cx('helperText')}>{loadError}</p> : null}

            <div className={cx('tableCard')}>
                <PackageTable
                    loading={loading}
                    packages={paginatedPackages}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredPackages.length}
                    pageSize={PAGE_SIZE}
                    onChangePage={setCurrentPage}
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

            <ExportModal
                open={isExportModalOpen}
                value={exportConfig}
                columnOptions={EXPORT_COLUMN_OPTIONS}
                dateRangeOptions={EXPORT_DATE_RANGE_OPTIONS}
                onChange={setExportConfig}
                onClose={handleCloseExportModal}
                onConfirm={handleConfirmExport}
            />

            <DeletePackageModal
                open={isDeleteModalOpen}
                packageItem={selectedPackage}
                submitting={deleting}
                onClose={handleCloseDeleteModal}
                onConfirm={handleConfirmDelete}
            />
        </section>
    );
}

export default ManagePackageList;