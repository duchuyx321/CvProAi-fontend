// src/pages/Admin/ManageTemplates/constants.jsx

export const TEMPLATE_PAGE_SIZE = 5;

export const TEMPLATE_TYPE_FILTERS = [
    { label: 'Tất cả mẫu', value: 'all' },
    { label: 'Free', value: 'free' },
    { label: 'Premium', value: 'premium' },
];

export const TEMPLATE_SORT_OPTIONS = [
    { label: 'Ngày tạo: Mới nhất', value: 'newest' },
    { label: 'Ngày tạo: Cũ nhất', value: 'oldest' },
    { label: 'Lượt dùng: Nhiều nhất', value: 'most_used' },
    { label: 'Lượt dùng: Ít nhất', value: 'least_used' },
];

export const DEFAULT_TEMPLATE_FILTERS = {
    searchValue: '',
    typeFilter: 'all',
    sortValue: 'newest',
};

export const MOCK_TEMPLATE_TOTAL = 120;

export const MOCK_TEMPLATE_STATS = {
    totalUsage: 45672,
    activeCount: 112,
    inactiveCount: 8,
    activePercent: 93,
};

export const MOCK_ADMIN_TEMPLATES = [
    {
        id: 'CV-001',
        code: 'CV-MODERN-001',
        name: 'Modern Tech Architect',
        description: 'Modern technology CV template for software engineers.',
        is_premium: true,
        is_active: true,
        usage_count: 1245,
        created_at: '2023-10-12',
        category: 'IT & Software',
        thumbnail_variant: 'classic',
    },
    {
        id: 'CV-002',
        code: 'CV-SALES-002',
        name: 'Sales & Marketing Pro',
        description: 'Optimized layout for business and marketing profiles.',
        is_premium: false,
        is_active: false,
        usage_count: 890,
        created_at: '2023-10-08',
        category: 'Business',
        thumbnail_variant: 'dark',
    },
    {
        id: 'CV-003',
        code: 'CV-CREATIVE-003',
        name: 'Creative Designer Portfolio',
        description: 'Portfolio-focused CV template for creative roles.',
        is_premium: true,
        is_active: true,
        usage_count: 2102,
        created_at: '2023-09-25',
        category: 'Design',
        thumbnail_variant: 'purple',
    },
    {
        id: 'CV-004',
        code: 'CV-DEVELOPER-004',
        name: 'Frontend Developer Grid',
        description: 'Clean modern layout for frontend developers.',
        is_premium: false,
        is_active: true,
        usage_count: 1688,
        created_at: '2023-09-18',
        category: 'IT & Software',
        thumbnail_variant: 'classic',
    },
    {
        id: 'CV-005',
        code: 'CV-MINIMAL-005',
        name: 'Minimal Corporate Resume',
        description: 'Minimal professional CV template for office roles.',
        is_premium: false,
        is_active: true,
        usage_count: 760,
        created_at: '2023-09-12',
        category: 'Corporate',
        thumbnail_variant: 'purple',
    },
    {
        id: 'CV-006',
        code: 'CV-PREMIUM-006',
        name: 'Executive Premium Profile',
        description: 'Premium CV template for management positions.',
        is_premium: true,
        is_active: false,
        usage_count: 540,
        created_at: '2023-09-01',
        category: 'Management',
        thumbnail_variant: 'dark',
    },
];
