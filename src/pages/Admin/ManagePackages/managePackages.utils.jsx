import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { deletePackage, getPackages } from '~/services/managePackageService';

// ─── Constants ────────────────────────────────────────────────────────────────

export const PAGE_SIZE = 4;

export const PACKAGE_SORT_OPTIONS = [
    { label: 'Tạo mới nhất', sort_by: 'createdAt', sort_order: 'DESC' },
    { label: 'Tạo cũ nhất', sort_by: 'createdAt', sort_order: 'ASC' },
    { label: 'Tên: A → Z', sort_by: 'name', sort_order: 'ASC' },
    { label: 'Tên: Z → A', sort_by: 'name', sort_order: 'DESC' },
    { label: 'Giá: Cao → Thấp', sort_by: 'price', sort_order: 'DESC' },
    { label: 'Giá: Thấp → Cao', sort_by: 'price', sort_order: 'ASC' },
];

export const PACKAGE_RANGE_OPTIONS = [
    { label: 'Tất cả thời gian', value: 'all' },
    { label: '7 ngày qua', value: '7days' },
    { label: '30 ngày qua', value: '30days' },
    { label: 'Tùy chỉnh', value: 'custom' },
];

export const INITIAL_FILTERS = {
    status: 'ALL',
    createdPreset: 'all',
    createdFrom: '',
    createdTo: '',
};

export const STATUS_LABEL_MAP = {
    ACTIVE: 'Hoạt động',
    PAUSED: 'Tạm ngưng',
};

export const EXPORT_COLUMN_OPTIONS = [
    { value: 'id', label: 'ID', defaultChecked: true },
    { value: 'name', label: 'Tên gói', defaultChecked: true },
    { value: 'price', label: 'Giá', defaultChecked: true },
    { value: 'duration', label: 'Thời hạn', defaultChecked: true },
    { value: 'benefits', label: 'Quyền lợi', defaultChecked: true },
    { value: 'totalUsers', label: 'Số người dùng', defaultChecked: false },
    { value: 'status', label: 'Trạng thái', defaultChecked: true },
];

export const EXPORT_DATE_RANGE_OPTIONS = [
    { value: 'all', label: 'Tất cả thời gian' },
    { value: 'today', label: 'Hôm nay' },
    { value: '7days', label: '7 ngày gần đây' },
    { value: '30days', label: '30 ngày gần đây' },
    { value: '90days', label: '90 ngày gần đây' },
];

export const DEFAULT_EXPORT_CONFIG = {
    format: 'json',
    columns: EXPORT_COLUMN_OPTIONS.filter((item) => item.defaultChecked).map(
        (item) => item.value,
    ),
    dateRange: 'all',
};

export const DEFAULT_FORM_DATA = {
    id: '',
    code: '',
    name: '',
    price: '',
    durationUnit: 'year',
    durationValue: '1',
    description: '',
    maxCv: '50',
    aiLimit: '100',
    premiumCv: true,
    removeWatermark: true,
    customDomain: true,
    support247: true,
    allowAiAddon: false,
    fullAiAnalysis: false,
    totalUsers: 0,
    status: 'ACTIVE',
};

// ─── Formatters ───────────────────────────────────────────────────────────────

export function toSafeString(value = '') {
    return String(value ?? '').trim();
}

export function toSafeNumber(value = 0) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function formatCurrency(value = 0) {
    return `${new Intl.NumberFormat('vi-VN').format(toSafeNumber(value))}đ`;
}

export function formatDuration(unit, value) {
    if (unit === 'permanent') return 'Vĩnh viễn';
    if (unit === 'year') return `${toSafeNumber(value) || 1} năm`;
    return `${toSafeNumber(value) || 1} tháng`;
}

// ─── Date / Filter helpers ────────────────────────────────────────────────────

export function startOfDay(value) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
}

export function endOfDay(value) {
    const date = new Date(value);
    date.setHours(23, 59, 59, 999);
    return date;
}

export function matchesCreatedFilter(sourceDate, filters) {
    const { createdPreset, createdFrom, createdTo } = filters;

    if (createdPreset === 'all' && !toSafeString(createdFrom) && !toSafeString(createdTo)) {
        return true;
    }

    if (!sourceDate) return false;

    const createdDate = new Date(sourceDate);
    if (Number.isNaN(createdDate.getTime())) return false;

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

        if (from && to && from > to) return false;
        if (from && createdDate < from) return false;
        if (to && createdDate > to) return false;
        return true;
    }

    return true;
}

export function filterPackages(packageList = [], filters, keyword = '') {
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

// ─── Normalize ────────────────────────────────────────────────────────────────

function normalizeStatus(value) {
    return toSafeString(value).toUpperCase() === 'PAUSED' ? 'PAUSED' : 'ACTIVE';
}

function normalizeDurationUnit(value) {
    const v = toSafeString(value).toLowerCase();
    if (['permanent', 'lifetime', 'forever', 'vinh_vien'].includes(v)) return 'permanent';
    if (['year', 'years', 'annual'].includes(v)) return 'year';
    return 'month';
}

function normalizeBenefits(value) {
    if (Array.isArray(value)) return value.map((item) => toSafeString(item)).filter(Boolean);
    if (typeof value === 'string') return value.split(/[|,]/).map((item) => item.trim()).filter(Boolean);
    return [];
}

export function normalizePackage(item, index) {
    return {
        id: toSafeString(item?.id || item?._id || item?.packageId) || `pkg-${index + 1}`,
        code: toSafeString(item?.code || item?.packageCode) || `PKG-${String(index + 1).padStart(3, '0')}`,
        name: toSafeString(item?.name || item?.packageName || item?.title) || 'Chưa đặt tên',
        price: toSafeNumber(item?.price || item?.amount || item?.fee),
        durationUnit: normalizeDurationUnit(item?.durationUnit || item?.cycle || item?.billingUnit),
        durationValue: item?.durationValue ?? item?.duration ?? item?.billingCycleValue ?? 1,
        benefits: normalizeBenefits(item?.benefits || item?.features || item?.privileges),
        totalUsers: toSafeNumber(item?.totalUsers || item?.users || item?.subscribers || item?.totalSubscriptions),
        status: normalizeStatus(item?.status || item?.state),
        createdAt: item?.createdAt || item?.created_date || item?.createdDate || '',
    };
}

export function normalizePackageList(items = []) {
    return items.map(normalizePackage);
}

// ─── Export (PDF / Excel / JSON) ──────────────────────────────────────────────

const EXPORT_COLUMN_LABEL_MAP = Object.fromEntries(
    EXPORT_COLUMN_OPTIONS.map((item) => [item.value, item.label]),
);

let xlsxModulePromise;
let pdfMakePromise;

async function loadXlsxModule() {
    if (!xlsxModulePromise) {
        xlsxModulePromise = import('xlsx-js-style').then((m) => m.default || m);
    }
    return xlsxModulePromise;
}

async function loadPdfMake() {
    if (!pdfMakePromise) {
        pdfMakePromise = Promise.all([
            import('pdfmake/build/pdfmake'),
            import('pdfmake/build/vfs_fonts'),
        ]).then(([pdfMakeModule, pdfFontsModule]) => {
            const pdfMake = pdfMakeModule.default || pdfMakeModule;
            const pdfFonts = pdfFontsModule.default || pdfFontsModule;
            pdfMake.vfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs || pdfFonts;
            return pdfMake;
        });
    }
    return pdfMakePromise;
}

function getExportCellValue(item, column) {
    switch (column) {
        case 'id': return item.code || item.id || '-';
        case 'name': return item.name || '-';
        case 'price': return formatCurrency(item.price);
        case 'duration': return formatDuration(item.durationUnit, item.durationValue);
        case 'benefits': return item.benefits?.length ? item.benefits.join(' | ') : '-';
        case 'totalUsers': return toSafeNumber(item.totalUsers).toLocaleString('vi-VN');
        case 'status': return STATUS_LABEL_MAP[item.status] || STATUS_LABEL_MAP.ACTIVE;
        default: return '';
    }
}

function getExcelCellValue(item, column) {
    if (column === 'price') return toSafeNumber(item.price);
    if (column === 'totalUsers') return toSafeNumber(item.totalUsers);
    return getExportCellValue(item, column);
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
}

function createExportFilename(extension) {
    const date = new Date().toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '_');
    return `danh-sach-goi-dich-vu_${date}.${extension}`;
}

function filterRowsByDateRange(rows = [], range = 'all') {
    if (range === 'all') return rows;

    const now = new Date();

    if (range === 'today') {
        const from = startOfDay(now);
        const to = endOfDay(now);
        return rows.filter((item) => {
            if (!item.createdAt) return false;
            const d = new Date(item.createdAt);
            return d >= from && d <= to;
        });
    }

    const from = startOfDay(now);
    if (range === '7days') from.setDate(from.getDate() - 6);
    else if (range === '30days') from.setDate(from.getDate() - 29);
    else if (range === '90days') from.setDate(from.getDate() - 89);

    return rows.filter((item) => {
        if (!item.createdAt) return false;
        const d = new Date(item.createdAt);
        if (Number.isNaN(d.getTime())) return false;
        return d >= from && d <= endOfDay(now);
    });
}

function exportRowsAsJson(rows = [], columns = []) {
    const jsonRows = rows.map((item) => {
        const row = {};
        columns.forEach((col) => {
            row[EXPORT_COLUMN_LABEL_MAP[col] || col] = getExportCellValue(item, col);
        });
        return row;
    });
    const blob = new Blob([JSON.stringify(jsonRows, null, 2)], { type: 'application/json;charset=utf-8;' });
    downloadBlob(blob, createExportFilename('json'));
}

async function exportRowsAsExcel(rows = [], columns = []) {
    const XLSX = await loadXlsxModule();
    const headers = columns.map((col) => EXPORT_COLUMN_LABEL_MAP[col] || col);
    const bodyRows = rows.map((item) => columns.map((col) => getExcelCellValue(item, col)));
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...bodyRows]);
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    worksheet['!autofilter'] = { ref: worksheet['!ref'] };
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
    worksheet['!cols'] = columns.map((col) => {
        const widthMap = { id: 14, name: 24, price: 16, duration: 14, benefits: 34, totalUsers: 16, status: 16 };
        return { wch: widthMap[col] || 18 };
    });

    for (let row = range.s.r; row <= range.e.r; row += 1) {
        for (let col = range.s.c; col <= range.e.c; col += 1) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = worksheet[cellAddress];
            if (!cell) continue;

            const isHeader = row === 0;
            const columnKey = columns[col];

            cell.s = {
                font: { name: 'Calibri', sz: isHeader ? 12 : 11, bold: isHeader, color: { rgb: isHeader ? 'FFFFFF' : '1F2937' } },
                fill: { fgColor: { rgb: isHeader ? '6366F1' : row % 2 === 0 ? 'F8FAFC' : 'FFFFFF' } },
                alignment: { vertical: 'center', horizontal: columnKey === 'price' || columnKey === 'totalUsers' ? 'right' : 'left', wrapText: true },
                border: { top: { style: 'thin', color: { rgb: 'E2E8F0' } }, bottom: { style: 'thin', color: { rgb: 'E2E8F0' } }, left: { style: 'thin', color: { rgb: 'E2E8F0' } }, right: { style: 'thin', color: { rgb: 'E2E8F0' } } },
            };

            if (!isHeader && columnKey === 'price' && typeof cell.v === 'number') cell.z = '#,##0"đ"';
            if (!isHeader && columnKey === 'totalUsers' && typeof cell.v === 'number') cell.z = '#,##0';
        }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách gói');
    XLSX.writeFile(workbook, createExportFilename('xlsx'));
}

async function exportRowsAsPdf(rows = [], columns = []) {
    const pdfMake = await loadPdfMake();
    const headers = columns.map((col) => EXPORT_COLUMN_LABEL_MAP[col] || col);
    const body = rows.map((item) => columns.map((col) => String(getExportCellValue(item, col) ?? '')));

    pdfMake.createPdf({
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [32, 28, 32, 28],
        defaultStyle: { font: 'Roboto', fontSize: 10 },
        content: [
            { text: 'Danh sách gói dịch vụ', fontSize: 18, bold: true, margin: [0, 0, 0, 6] },
            { text: `Ngày xuất: ${new Date().toLocaleString('vi-VN')}`, fontSize: 10, color: '#64748b', margin: [0, 0, 0, 12] },
            {
                table: { headerRows: 1, widths: headers.map(() => '*'), body: [headers, ...body] },
                layout: {
                    fillColor: (rowIndex) => (rowIndex === 0 ? '#F8FAFC' : rowIndex % 2 === 0 ? '#FCFDFF' : null),
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
    }).download(createExportFilename('pdf'));
}

export async function exportPackageRows(rows = [], config = {}) {
    const selectedColumns = config.columns || [];
    if (selectedColumns.length === 0) return;

    const scopedRows = filterRowsByDateRange(rows, config.dateRange);

    if (config.format === 'json') { exportRowsAsJson(scopedRows, selectedColumns); return; }
    if (config.format === 'excel') { await exportRowsAsExcel(scopedRows, selectedColumns); return; }
    if (config.format === 'pdf') { await exportRowsAsPdf(scopedRows, selectedColumns); }
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useDebounce(value, delay = 350) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const id = window.setTimeout(() => setDebouncedValue(value), delay);
        return () => window.clearTimeout(id);
    }, [value, delay]);

    return debouncedValue;
}

export function usePackageList() {
    const [packageList, setPackageList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const loadPackages = useCallback(async () => {
        setLoading(true);
        setLoadError('');

        try {
            const response = await getPackages();

            if (response?.success === false) {
                setLoadError('Không thể tải dữ liệu từ máy chủ.');
                setPackageList([]);
                return;
            }

            const apiItems = response?.data?.items ?? response?.data ?? [];
            const normalized = normalizePackageList(Array.isArray(apiItems) ? apiItems : []);
            setPackageList(normalized);
        } catch {
            setLoadError('Không thể tải dữ liệu từ máy chủ.');
            setPackageList([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadPackages(); }, [loadPackages]);

    return { packageList, setPackageList, loading, loadError, loadPackages };
}

const DEFAULT_SORT = { sort_by: 'createdAt', sort_order: 'DESC' };

function sortPackages(list, { sort_by, sort_order }) {
    return [...list].sort((a, b) => {
        let aVal = a[sort_by];
        let bVal = b[sort_by];
        if (sort_by === 'createdAt') { aVal = new Date(aVal).getTime() || 0; bVal = new Date(bVal).getTime() || 0; }
        if (aVal < bVal) return sort_order === 'ASC' ? -1 : 1;
        if (aVal > bVal) return sort_order === 'ASC' ? 1 : -1;
        return 0;
    });
}

export function usePackageFilters(packageList = []) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [filters, setFilters] = useState(INITIAL_FILTERS);
    const [sortConfig, setSortConfig] = useState(DEFAULT_SORT);

    const debouncedKeyword = useDebounce(searchValue, 350);

    const filteredPackages = useMemo(() => {
        const filtered = filterPackages(packageList, filters, debouncedKeyword);
        return sortPackages(filtered, sortConfig);
    }, [packageList, filters, debouncedKeyword, sortConfig]);

    const totalPages = Math.max(1, Math.ceil(filteredPackages.length / PAGE_SIZE));
    const currentPageForView = Math.min(currentPage, totalPages);

    const paginatedPackages = useMemo(() => {
        const start = (currentPageForView - 1) * PAGE_SIZE;
        return filteredPackages.slice(start, start + PAGE_SIZE);
    }, [currentPageForView, filteredPackages]);

    const handleChangePage = useCallback(
        (page) => setCurrentPage(Math.min(Math.max(1, page), totalPages)),
        [totalPages],
    );

    const handleChangeFilter = useCallback((field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
        setCurrentPage(1);
    }, []);

    const handleToolbarChange = useCallback(({ search, sort, range }) => {
        if (search !== undefined) setSearchValue(search);
        if (sort) setSortConfig(sort);
        if (range !== undefined) {
            if (typeof range === 'string') {
                setFilters((prev) => ({ ...prev, createdPreset: range || 'all', createdFrom: '', createdTo: '' }));
            } else if (range && typeof range === 'object') {
                setFilters((prev) => ({ ...prev, createdPreset: 'custom', createdFrom: range.from || '', createdTo: range.to || '' }));
            }
        }
        setCurrentPage(1);
    }, []);

    return {
        filters,
        searchValue,
        currentPage: currentPageForView,
        totalPages,
        filteredPackages,
        paginatedPackages,
        setCurrentPage: handleChangePage,
        handleChangeFilter,
        handleToolbarChange,
    };
}

export function usePackageDelete({ setPackageList, loadPackages }) {
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const handleOpenDeleteModal = useCallback((item) => {
        setSelectedPackage(item);
        setIsDeleteModalOpen(true);
    }, []);

    const handleCloseDeleteModal = useCallback(() => {
        if (deleting) return;
        setIsDeleteModalOpen(false);
        setSelectedPackage(null);
    }, [deleting]);

    const handleConfirmDelete = useCallback(async () => {
        if (!selectedPackage?.id) return;

        setDeleting(true);

        try {
            const response = await deletePackage(selectedPackage.id);

            if (response?.success === false || response?.data?.success === false) {
                toast.error(response?.message || response?.data?.message || 'Xóa gói dịch vụ thất bại.');
                return;
            }

            toast.success('Gói dịch vụ đã được xóa khỏi hệ thống.');
            setPackageList((prev) => prev.filter((item) => item.id !== selectedPackage.id));
            setIsDeleteModalOpen(false);
            setSelectedPackage(null);
            loadPackages();
        } catch {
            toast.error('Không thể xóa gói dịch vụ.');
        } finally {
            setDeleting(false);
        }
    }, [loadPackages, selectedPackage, setPackageList]);

    return { isDeleteModalOpen, selectedPackage, deleting, handleOpenDeleteModal, handleCloseDeleteModal, handleConfirmDelete };
}
