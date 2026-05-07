export const STATUS_FILTER_OPTIONS = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Bị khóa', value: 'locked' },
];

export const USER_SORT_OPTIONS = [
    {
        label: 'Cập nhật mới nhất',
        sort_by: 'updatedAt',
        sort_order: 'DESC',
    },
    {
        label: 'Cập nhật cũ nhất',
        sort_by: 'updatedAt',
        sort_order: 'ASC',
    },
    {
        label: 'Đăng ký mới nhất',
        sort_by: 'createdAt',
        sort_order: 'DESC',
    },
    {
        label: 'Đăng ký cũ nhất',
        sort_by: 'createdAt',
        sort_order: 'ASC',
    },
];

export const USER_RANGE_OPTIONS = [
    { label: 'Tất cả thời gian', value: 'all' },
    { label: '7 ngày qua', value: '7d' },
    { label: '30 ngày qua', value: '30d' },
    { label: 'Tháng này', value: 'month' },
    { label: 'Năm nay', value: 'year' },
    { label: 'Tùy chỉnh', value: 'custom' },
];

export const DEFAULT_FILTERS = {
    search: '',
    sort_by: 'updatedAt',
    sort_order: 'DESC',
    range: 'all',
    from: '',
    to: '',
    status: 'all',
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
