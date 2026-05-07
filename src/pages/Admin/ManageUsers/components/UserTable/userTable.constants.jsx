export const STATUS_FILTER_OPTIONS = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Bị khóa', value: 'locked' },
];

export const DEFAULT_FILTERS = {
    status: 'all',
    registeredPreset: 'all',
    registeredFrom: '',
    registeredTo: '',
};

export const INITIAL_PAGINATION = {
    currentPage: 1,
    pageSize: 8,
    totalItems: 0,
    totalPages: 1,
};

export const USER_TABLE_COLUMNS = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Tên người dùng' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Số điện thoại' },
    { key: 'planName', label: 'Gói hiện tại' },
    { key: 'cvCount', label: 'Số CV' },
    { key: 'registeredAt', label: 'Ngày đăng ký' },
    { key: 'actions', label: 'Hành động' },
];
