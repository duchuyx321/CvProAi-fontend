export const PAGE_SIZE = 4;

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
        (item) => item.value
    ),
    dateRange: 'all',
};

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