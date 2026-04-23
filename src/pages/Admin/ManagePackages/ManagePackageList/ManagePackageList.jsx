import classNames from 'classnames/bind';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    MdOutlineDeleteOutline,
    MdOutlineEdit,
    MdOutlineVisibility,
} from 'react-icons/md';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import * as XLSX from 'xlsx-js-style';
import { config } from '~/config';
import { deletePackage, getPackages } from '~/services/managePackageService';
import ActionBar from './components/ActionBar';
import DeletePackageModal from './components/DeletePackageModal';
import ExportModal from './components/ExportModal';
import PackageTable from './components/PackageTable';
import styles from './ManagePackageList.module.scss';

const cx = classNames.bind(styles);

pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts;

const PAGE_SIZE = 4;

const FALLBACK_PACKAGES = [
    {
        id: 'PKG-001',
        code: 'PKG-001',
        name: 'Gói Miễn Phí',
        price: 0,
        durationUnit: 'permanent',
        durationValue: null,
        benefits: ['1 CV', 'AI cơ bản'],
        totalUsers: 15420,
        status: 'ACTIVE',
        createdAt: '2026-04-10T08:30:00.000Z',
    },
    {
        id: 'PKG-002',
        code: 'PKG-002',
        name: 'Premium',
        price: 199000,
        durationUnit: 'month',
        durationValue: 1,
        benefits: ['Không giới hạn', 'Phân tích sâu'],
        totalUsers: 2850,
        status: 'PAUSED',
        createdAt: '2026-04-09T08:30:00.000Z',
    },
];

const EXPORT_COLUMN_OPTIONS = [
    { value: 'id', label: 'ID', defaultChecked: true },
    { value: 'name', label: 'Tên gói', defaultChecked: true },
    { value: 'price', label: 'Giá', defaultChecked: true },
    { value: 'duration', label: 'Thời hạn', defaultChecked: true },
    { value: 'benefits', label: 'Quyền lợi', defaultChecked: true },
    { value: 'totalUsers', label: 'Số người dùng', defaultChecked: false },
    { value: 'status', label: 'Trạng thái', defaultChecked: true },
];

const EXPORT_DATE_RANGE_OPTIONS = [
    { value: 'all', label: 'Tất cả thời gian' },
    { value: 'today', label: 'Hôm nay' },
    { value: '7days', label: '7 ngày gần đây' },
    { value: '30days', label: '30 ngày gần đây' },
    { value: '90days', label: '90 ngày gần đây' },
];

const DEFAULT_EXPORT_CONFIG = {
    format: 'json',
    columns: EXPORT_COLUMN_OPTIONS.filter((item) => item.defaultChecked).map(
        (item) => item.value
    ),
    dateRange: 'all',
};

const INITIAL_FILTERS = {
    status: 'ALL',
    createdPreset: 'all',
    createdFrom: '',
    createdTo: '',
};

const EXPORT_COLUMN_LABEL_MAP = Object.fromEntries(
    EXPORT_COLUMN_OPTIONS.map((item) => [item.value, item.label])
);

const STATUS_LABEL_MAP = {
    ACTIVE: 'Hoạt động',
    PAUSED: 'Tạm ngưng',
};

function useDebounce(value, delay = 350) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => window.clearTimeout(timerId);
    }, [value, delay]);

    return debouncedValue;
}

function toSafeString(value = '') {
    return String(value ?? '').trim();
}

function toSafeNumber(value = 0) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function startOfDay(value) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
}

function endOfDay(value) {
    const date = new Date(value);
    date.setHours(23, 59, 59, 999);
    return date;
}

function normalizeStatus(value) {
    return toSafeString(value).toUpperCase() === 'PAUSED' ? 'PAUSED' : 'ACTIVE';
}

function normalizeDurationUnit(value) {
    const normalizedValue = toSafeString(value).toLowerCase();

    if (
        ['permanent', 'lifetime', 'forever', 'vinh_vien'].includes(
            normalizedValue
        )
    ) {
        return 'permanent';
    }

    if (['year', 'years', 'annual'].includes(normalizedValue)) {
        return 'year';
    }

    return 'month';
}

function normalizeBenefits(value) {
    if (Array.isArray(value)) {
        return value.map((item) => toSafeString(item)).filter(Boolean);
    }

    if (typeof value === 'string') {
        return value
            .split(/[|,]/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

function normalizePackage(item, index) {
    return {
        id:
            toSafeString(item?.id || item?._id || item?.packageId) ||
            `pkg-${index + 1}`,
        code:
            toSafeString(item?.code || item?.packageCode) ||
            `PKG-${String(index + 1).padStart(3, '0')}`,
        name:
            toSafeString(item?.name || item?.packageName || item?.title) ||
            'Chưa đặt tên',
        price: toSafeNumber(item?.price || item?.amount || item?.fee),
        durationUnit: normalizeDurationUnit(
            item?.durationUnit || item?.cycle || item?.billingUnit
        ),
        durationValue:
            item?.durationValue ??
            item?.duration ??
            item?.billingCycleValue ??
            1,
        benefits: normalizeBenefits(
            item?.benefits || item?.features || item?.privileges
        ),
        totalUsers: toSafeNumber(
            item?.totalUsers ||
                item?.users ||
                item?.subscribers ||
                item?.totalSubscriptions
        ),
        status: normalizeStatus(item?.status || item?.state),
        createdAt:
            item?.createdAt ||
            item?.created_date ||
            item?.createdDate ||
            '',
    };
}

function normalizePackageList(items = []) {
    return items.map(normalizePackage);
}

function formatCurrency(value = 0) {
    return `${new Intl.NumberFormat('vi-VN').format(toSafeNumber(value))}đ`;
}

function formatDuration(unit, value) {
    if (unit === 'permanent') {
        return 'Vĩnh viễn';
    }

    if (unit === 'year') {
        return `${toSafeNumber(value) || 1} năm`;
    }

    return `${toSafeNumber(value) || 1} tháng`;
}

function matchesCreatedFilter(sourceDate, filters) {
    const { createdPreset, createdFrom, createdTo } = filters;

    if (
        createdPreset === 'all' &&
        !toSafeString(createdFrom) &&
        !toSafeString(createdTo)
    ) {
        return true;
    }

    if (!sourceDate) {
        return false;
    }

    const createdDate = new Date(sourceDate);

    if (Number.isNaN(createdDate.getTime())) {
        return false;
    }

    const now = new Date();

    if (createdPreset === '7days') {
        const from = startOfDay(now);
        from.setDate(from.getDate() - 6);
        return createdDate >= from && createdDate <= endOfDay(now);
    }

    if (createdPreset === '30days') {
        const from = startOfDay(now);
        from.setDate(from.getDate() - 29);
        return createdDate >= from && createdDate <= endOfDay(now);
    }

    if (createdPreset === 'custom') {
        const from = createdFrom ? startOfDay(createdFrom) : null;
        const to = createdTo ? endOfDay(createdTo) : null;

        if (from && to && from > to) {
            return false;
        }

        if (from && createdDate < from) {
            return false;
        }

        if (to && createdDate > to) {
            return false;
        }

        return true;
    }

    return true;
}

function filterPackages(packageList = [], filters, keyword = '') {
    const normalizedKeyword = toSafeString(keyword).toLowerCase();

    return packageList.filter((item) => {
        const matchStatus =
            filters.status === 'ALL' || item.status === filters.status;

        const matchKeyword =
            !normalizedKeyword ||
            item.code.toLowerCase().includes(normalizedKeyword) ||
            item.name.toLowerCase().includes(normalizedKeyword);

        const matchDate = matchesCreatedFilter(item.createdAt, filters);

        return matchStatus && matchKeyword && matchDate;
    });
}

function getExportCellValue(item, column) {
    switch (column) {
        case 'id':
            return item.code || item.id || '-';
        case 'name':
            return item.name || '-';
        case 'price':
            return formatCurrency(item.price);
        case 'duration':
            return formatDuration(item.durationUnit, item.durationValue);
        case 'benefits':
            return item.benefits?.length ? item.benefits.join(' | ') : '-';
        case 'totalUsers':
            return toSafeNumber(item.totalUsers).toLocaleString('vi-VN');
        case 'status':
            return STATUS_LABEL_MAP[item.status] || STATUS_LABEL_MAP.ACTIVE;
        default:
            return '';
    }
}

function getExcelCellValue(item, column) {
    switch (column) {
        case 'price':
            return toSafeNumber(item.price);
        case 'totalUsers':
            return toSafeNumber(item.totalUsers);
        default:
            return getExportCellValue(item, column);
    }
}

function downloadBlob(blob, filename) {
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = downloadUrl;
    anchor.download = filename;
    anchor.click();

    URL.revokeObjectURL(downloadUrl);
}

function createExportFilename(extension) {
    const date = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, '-')
        .replace('T', '_');

    return `danh-sach-goi-dich-vu_${date}.${extension}`;
}

function filterRowsByDateRange(rows = [], range = 'all') {
    if (range === 'all') {
        return rows;
    }

    const now = new Date();

    if (range === 'today') {
        const from = startOfDay(now);
        const to = endOfDay(now);

        return rows.filter((item) => {
            if (!item.createdAt) {
                return false;
            }

            const createdDate = new Date(item.createdAt);
            return createdDate >= from && createdDate <= to;
        });
    }

    const from = startOfDay(now);

    if (range === '7days') {
        from.setDate(from.getDate() - 6);
    } else if (range === '30days') {
        from.setDate(from.getDate() - 29);
    } else if (range === '90days') {
        from.setDate(from.getDate() - 89);
    }

    return rows.filter((item) => {
        if (!item.createdAt) {
            return false;
        }

        const createdDate = new Date(item.createdAt);

        if (Number.isNaN(createdDate.getTime())) {
            return false;
        }

        return createdDate >= from && createdDate <= endOfDay(now);
    });
}

function exportRowsAsJson(rows = [], columns = []) {
    const jsonRows = rows.map((item) => {
        const mappedRow = {};

        columns.forEach((column) => {
            const label = EXPORT_COLUMN_LABEL_MAP[column] || column;
            mappedRow[label] = getExportCellValue(item, column);
        });

        return mappedRow;
    });

    const blob = new Blob([JSON.stringify(jsonRows, null, 2)], {
        type: 'application/json;charset=utf-8;',
    });

    downloadBlob(blob, createExportFilename('json'));
}

function exportRowsAsExcel(rows = [], columns = []) {
    const headers = columns.map(
        (column) => EXPORT_COLUMN_LABEL_MAP[column] || column
    );

    const bodyRows = rows.map((item) =>
        columns.map((column) => getExcelCellValue(item, column))
    );

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...bodyRows]);
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    worksheet['!autofilter'] = { ref: worksheet['!ref'] };
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };

    worksheet['!cols'] = columns.map((column) => {
        const widthMap = {
            id: 14,
            name: 24,
            price: 16,
            duration: 14,
            benefits: 34,
            totalUsers: 16,
            status: 16,
        };

        return { wch: widthMap[column] || 18 };
    });

    for (let row = range.s.r; row <= range.e.r; row += 1) {
        for (let col = range.s.c; col <= range.e.c; col += 1) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = worksheet[cellAddress];

            if (!cell) {
                continue;
            }

            const isHeader = row === 0;
            const columnKey = columns[col];

            cell.s = {
                font: {
                    name: 'Calibri',
                    sz: isHeader ? 12 : 11,
                    bold: isHeader,
                    color: { rgb: isHeader ? 'FFFFFF' : '1F2937' },
                },
                fill: {
                    fgColor: {
                        rgb: isHeader
                            ? '6366F1'
                            : row % 2 === 0
                              ? 'F8FAFC'
                              : 'FFFFFF',
                    },
                },
                alignment: {
                    vertical: 'center',
                    horizontal:
                        columnKey === 'price' || columnKey === 'totalUsers'
                            ? 'right'
                            : 'left',
                    wrapText: true,
                },
                border: {
                    top: { style: 'thin', color: { rgb: 'E2E8F0' } },
                    bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
                    left: { style: 'thin', color: { rgb: 'E2E8F0' } },
                    right: { style: 'thin', color: { rgb: 'E2E8F0' } },
                },
            };

            if (!isHeader && columnKey === 'price' && typeof cell.v === 'number') {
                cell.z = '#,##0"đ"';
            }

            if (
                !isHeader &&
                columnKey === 'totalUsers' &&
                typeof cell.v === 'number'
            ) {
                cell.z = '#,##0';
            }
        }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách gói');
    XLSX.writeFile(workbook, createExportFilename('xlsx'));
}

function exportRowsAsPdf(rows = [], columns = []) {
    const headers = columns.map(
        (column) => EXPORT_COLUMN_LABEL_MAP[column] || column
    );

    const body = rows.map((item) =>
        columns.map((column) => String(getExportCellValue(item, column) ?? ''))
    );

    pdfMake
        .createPdf({
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [32, 28, 32, 28],
            defaultStyle: {
                font: 'Roboto',
                fontSize: 10,
            },
            content: [
                {
                    text: 'Danh sách gói dịch vụ',
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 6],
                },
                {
                    text: `Ngày xuất: ${new Date().toLocaleString('vi-VN')}`,
                    fontSize: 10,
                    color: '#64748b',
                    margin: [0, 0, 0, 12],
                },
                {
                    table: {
                        headerRows: 1,
                        widths: headers.map(() => '*'),
                        body: [headers, ...body],
                    },
                    layout: {
                        fillColor: (rowIndex) => {
                            if (rowIndex === 0) {
                                return '#F8FAFC';
                            }

                            return rowIndex % 2 === 0 ? '#FCFDFF' : null;
                        },
                        hLineColor: () => '#E2E8F0',
                        vLineColor: () => '#E2E8F0',
                        hLineWidth: () => 0.8,
                        vLineWidth: () => 0.8,
                        paddingLeft: () => 8,
                        paddingRight: () => 8,
                        paddingTop: () => 6,
                        paddingBottom: () => 6,
                    },
                },
            ],
        })
        .download(createExportFilename('pdf'));
}

function ManagePackageList() {
    const navigate = useNavigate();
    const location = useLocation();

    const [packageList, setPackageList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportConfig, setExportConfig] = useState(DEFAULT_EXPORT_CONFIG);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const debouncedKeyword = useDebounce(searchValue, 350);

    const loadPackages = useCallback(async () => {
        setLoading(true);
        setLoadError('');

        try {
            const response = await getPackages();
            const apiItems = response?.data?.items ?? response?.data ?? [];
            const normalizedPackages = normalizePackageList(
                Array.isArray(apiItems) ? apiItems : []
            );

            setPackageList(
                normalizedPackages.length > 0
                    ? normalizedPackages
                    : FALLBACK_PACKAGES
            );
        } catch (error) {
            setLoadError(
                'Không thể tải dữ liệu từ máy chủ. Đang hiển thị dữ liệu mẫu.'
            );
            setPackageList(FALLBACK_PACKAGES);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPackages();
    }, [loadPackages]);

    useEffect(() => {
        if (location.state?.shouldReload) {
            loadPackages();
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [loadPackages, location.pathname, location.state, navigate]);

    const filteredPackages = useMemo(
        () => filterPackages(packageList, filters, debouncedKeyword),
        [packageList, filters, debouncedKeyword]
    );

    const totalPages = Math.max(
        1,
        Math.ceil(filteredPackages.length / PAGE_SIZE)
    );

    const paginatedPackages = useMemo(() => {
        const safeCurrentPage = Math.min(currentPage, totalPages);
        const startIndex = (safeCurrentPage - 1) * PAGE_SIZE;

        return filteredPackages.slice(startIndex, startIndex + PAGE_SIZE);
    }, [currentPage, filteredPackages, totalPages]);

    useEffect(() => {
        setCurrentPage((previousPage) =>
            previousPage > totalPages ? totalPages : previousPage
        );
    }, [totalPages]);

    const handleChangeFilter = useCallback((field, value) => {
        setFilters((previousState) => ({
            ...previousState,
            [field]: value,
        }));
        setCurrentPage(1);
    }, []);

    const handleChangeDateFilter = useCallback((nextDateFilter) => {
        setFilters((previousState) => ({
            ...previousState,
            ...nextDateFilter,
        }));
        setCurrentPage(1);
    }, []);

    const handleChangeSearch = useCallback((value) => {
        setSearchValue(value);
        setCurrentPage(1);
    }, []);

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

    const handleOpenDeleteModal = useCallback((item) => {
        setSelectedPackage(item);
        setIsDeleteModalOpen(true);
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        if (deleting) {
            return;
        }

        setIsDeleteModalOpen(false);
        setSelectedPackage(null);
    }, [deleting]);

    const handleConfirmDelete = useCallback(async () => {
        if (!selectedPackage?.id) {
            return;
        }

        setDeleting(true);

        try {
            const response = await deletePackage(selectedPackage.id);

            if (response?.success === false || response?.data?.success === false) {
                toast.error(
                    response?.message ||
                        response?.data?.message ||
                        'Xóa gói dịch vụ thất bại.'
                );
                return;
            }

            toast.success('Gói dịch vụ đã được xóa khỏi hệ thống.');

            setPackageList((previousState) =>
                previousState.filter(
                    (packageItem) => packageItem.id !== selectedPackage.id
                )
            );

            setIsDeleteModalOpen(false);
            setSelectedPackage(null);
            loadPackages();
        } catch (error) {
            toast.error('Không thể xóa gói dịch vụ.');
        } finally {
            setDeleting(false);
        }
    }, [loadPackages, selectedPackage]);

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
            const selectedColumns = nextConfig.columns || [];

            if (selectedColumns.length === 0) {
                return;
            }

            const scopedRows = filterRowsByDateRange(
                filteredPackages,
                nextConfig.dateRange
            );

            if (nextConfig.format === 'json') {
                exportRowsAsJson(scopedRows, selectedColumns);
            } else if (nextConfig.format === 'excel') {
                exportRowsAsExcel(scopedRows, selectedColumns);
            } else if (nextConfig.format === 'pdf') {
                exportRowsAsPdf(scopedRows, selectedColumns);
            }

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

            {isExportModalOpen ? (
                <ExportModal
                    value={exportConfig}
                    columnOptions={EXPORT_COLUMN_OPTIONS}
                    dateRangeOptions={EXPORT_DATE_RANGE_OPTIONS}
                    onChange={setExportConfig}
                    onClose={handleCloseExportModal}
                    onConfirm={handleConfirmExport}
                />
            ) : null}

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