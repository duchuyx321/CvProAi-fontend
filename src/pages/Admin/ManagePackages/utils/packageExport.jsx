import { EXPORT_COLUMN_OPTIONS, STATUS_LABEL_MAP } from '../constants';
import {
    formatCurrency,
    formatDuration,
    toSafeNumber,
} from './packageFormatters';
import { endOfDay, startOfDay } from './packageFilter';

const EXPORT_COLUMN_LABEL_MAP = Object.fromEntries(
    EXPORT_COLUMN_OPTIONS.map((item) => [item.value, item.label])
);

let xlsxModulePromise;
let pdfMakePromise;

async function loadXlsxModule() {
    if (!xlsxModulePromise) {
        xlsxModulePromise = import('xlsx-js-style').then(
            (module) => module.default || module
        );
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

async function exportRowsAsExcel(rows = [], columns = []) {
    const XLSX = await loadXlsxModule();
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

async function exportRowsAsPdf(rows = [], columns = []) {
    const pdfMake = await loadPdfMake();
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

export async function exportPackageRows(rows = [], config = {}) {
    const selectedColumns = config.columns || [];

    if (selectedColumns.length === 0) {
        return;
    }

    const scopedRows = filterRowsByDateRange(rows, config.dateRange);

    if (config.format === 'json') {
        exportRowsAsJson(scopedRows, selectedColumns);
        return;
    }

    if (config.format === 'excel') {
        await exportRowsAsExcel(scopedRows, selectedColumns);
        return;
    }

    if (config.format === 'pdf') {
        await exportRowsAsPdf(scopedRows, selectedColumns);
    }
}
