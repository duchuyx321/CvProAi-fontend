// ─── Fallback data ────────────────────────────────────────────────────────────
export const FALLBACK_PACKAGES = [
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
        description: 'Gói miễn phí cho người dùng mới.',
        maxCv: 1,
        aiLimit: 10,
        premiumCv: false,
        removeWatermark: false,
        customDomain: false,
        support247: false,
        allowAiAddon: false,
        fullAiAnalysis: false,
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
        description: 'Gói tối ưu dành cho ứng viên chuyên nghiệp.',
        maxCv: 50,
        aiLimit: 100,
        premiumCv: true,
        removeWatermark: true,
        customDomain: true,
        support247: true,
        allowAiAddon: false,
        fullAiAnalysis: false,
    },
    {
        id: 'PKG-003',
        code: 'PKG-003',
        name: 'Doanh Nghiệp',
        price: 4990000,
        durationUnit: 'year',
        durationValue: 1,
        benefits: ['Hỗ trợ 24/7', 'White Label'],
        totalUsers: 142,
        status: 'PAUSED',
        createdAt: '2026-04-08T08:30:00.000Z',
        description: 'Gói doanh nghiệp với quản trị nâng cao.',
        maxCv: 200,
        aiLimit: 500,
        premiumCv: true,
        removeWatermark: true,
        customDomain: true,
        support247: true,
        allowAiAddon: true,
        fullAiAnalysis: true,
    },
];

// ─── Package list page ─────────────────────────────────────────────────────────
export const PAGE_SIZE = 4;

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
        (item) => item.value
    ),
    dateRange: 'all',
};

// ─── Package detail / edit form ───────────────────────────────────────────────
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
