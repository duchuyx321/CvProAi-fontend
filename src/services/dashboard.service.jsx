import * as Response from '~/utils/HttpsRequest';

const DEFAULT_DASHBOARD_STATS = {
    totalCv: 0,
    aiUsed: 0,
    aiLimit: 0,
    currentPlan: '--',
    totalPdfExports: 0,
};

const DASHBOARD_ENDPOINT = 'dashboard';
const RECENT_CVS_ENDPOINT = 'cvs?limit=50&page=1';

const toNumber = (value, fallback = 0) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeText = (value = '') =>
    String(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .toLowerCase()
        .trim();

const parseDate = (value) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatUpdatedText = (value) => {
    const date = parseDate(value);

    if (!date) {
        return 'Chưa cập nhật';
    }

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();

    if (diffMs < 60 * 1000) {
        return 'Vừa xong';
    }

    const diffMinutes = Math.floor(diffMs / (60 * 1000));
    if (diffMinutes < 60) {
        return `${diffMinutes} phút trước`;
    }

    const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
    if (diffHours < 24) {
        return `${diffHours} giờ trước`;
    }

    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays < 30) {
        return `${diffDays} ngày trước`;
    }

    return date.toLocaleDateString('vi-VN');
};

const getValue = (source = {}, paths = [], fallback = undefined) => {
    for (const path of paths) {
        const keys = path.split('.');
        let current = source;

        for (const key of keys) {
            if (current == null) {
                current = undefined;
                break;
            }
            current = current[key];
        }

        if (current !== undefined && current !== null && current !== '') {
            return current;
        }
    }

    return fallback;
};

const extractList = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.results)) return payload.results;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.data?.items)) return payload.data.items;
    return [];
};

const mapStatus = (source = {}) => {
    const rawStatusValue =
        getValue(source, [
            'statusLabel',
            'status_text',
            'statusText',
            'status',
            'state',
        ]) || '';

    const normalizedStatus = normalizeText(rawStatusValue);

    const isCompleted =
        source?.isCompleted === true ||
        source?.is_completed === true ||
        normalizedStatus.includes('hoan tat') ||
        normalizedStatus.includes('complete') ||
        normalizedStatus.includes('done') ||
        normalizedStatus.includes('publish');

    if (isCompleted) {
        return { status: 'Hoàn tất', statusCode: 'success' };
    }

    const isEditing =
        source?.isDraft === true ||
        source?.is_draft === true ||
        normalizedStatus.includes('draft') ||
        normalizedStatus.includes('edit') ||
        normalizedStatus.includes('dang');

    if (isEditing) {
        return { status: 'Đang chỉnh sửa', statusCode: 'warning' };
    }

    return {
        status: rawStatusValue ? String(rawStatusValue) : 'Không xác định',
        statusCode: 'warning',
    };
};

const normalizeCvItem = (source = {}) => {
    const id = getValue(source, ['id', 'cvId', '_id', 'slug'], null);
    const slug = getValue(source, ['slug', 'cv_slug', 'cvSlug'], null);

    const name =
        getValue(source, ['name', 'title', 'fileName', 'originalFileName']) ||
        'CV chưa đặt tên';

    const template =
        getValue(source, [
            'template_name',
            'templateName',
            'template.name',
            'template.code',
            'template_code',
            'code',
        ]) || 'Không rõ mẫu';

    const updatedRaw = getValue(source, [
        'updatedAt',
        'updated_at',
        'modifiedAt',
        'createdAt',
        'created_at',
    ]);

    const { status, statusCode } = mapStatus(source);

    return {
        id,
        slug,
        name,
        template,
        updated: formatUpdatedText(updatedRaw),
        status,
        statusCode,
        updatedAt: updatedRaw || null,
    };
};

const normalizeStats = (source = {}) => {
    const currentPlan =
        getValue(source, [
            'currentPlan',
            'current_plan',
            'plan.name',
            'package.name',
            'subscription.plan_name',
        ]) || DEFAULT_DASHBOARD_STATS.currentPlan;

    return {
        totalCv: toNumber(
            getValue(source, [
                'totalCv',
                'totalCV',
                'total_cv',
                'total_cvs',
                'cvCount',
                'stats.totalCv',
            ]),
            DEFAULT_DASHBOARD_STATS.totalCv,
        ),
        aiUsed: toNumber(
            getValue(source, [
                'aiUsed',
                'ai_used',
                'ai_usage.used',
                'stats.aiUsed',
                'analysis.used',
            ]),
            DEFAULT_DASHBOARD_STATS.aiUsed,
        ),
        aiLimit: toNumber(
            getValue(source, [
                'aiLimit',
                'ai_limit',
                'ai_usage.limit',
                'stats.aiLimit',
                'analysis.limit',
            ]),
            DEFAULT_DASHBOARD_STATS.aiLimit,
        ),
        currentPlan,
        totalPdfExports: toNumber(
            getValue(source, [
                'totalPdfExports',
                'total_pdf_exports',
                'pdfExportCount',
                'stats.totalPdfExports',
                'exports.pdf',
            ]),
            DEFAULT_DASHBOARD_STATS.totalPdfExports,
        ),
    };
};

const normalizeDashboardPayload = (res = {}) => {
    const raw = res?.data ?? res ?? {};

    const statsSource =
        raw?.stats ||
        raw?.summary ||
        raw?.overview ||
        raw?.data?.stats ||
        raw;

    const recentFromSummary = extractList(
        getValue(raw, [
            'recentCvs',
            'recentCVs',
            'recent_cvs',
            'cvs',
            'recent',
            'data.recentCvs',
        ]),
    );

    return {
        stats: normalizeStats(statsSource),
        recentCvs: recentFromSummary.map(normalizeCvItem),
        message: res?.message || raw?.message || '',
    };
};

const normalizeRecentCvsPayload = (res = {}) => {
    const raw = res?.data ?? res ?? {};
    const items = extractList(raw);

    const sorted = [...items].sort((a, b) => {
        const dateA = parseDate(
            getValue(a, ['updatedAt', 'updated_at', 'modifiedAt', 'createdAt']),
        );
        const dateB = parseDate(
            getValue(b, ['updatedAt', 'updated_at', 'modifiedAt', 'createdAt']),
        );

        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;

        return dateB.getTime() - dateA.getTime();
    });

    return sorted.map(normalizeCvItem);
};

const buildErrorMessage = (errors = []) => {
    for (const error of errors) {
        const message = error?.response?.data?.message || error?.message;
        if (message) return message;
    }

    return 'Không thể tải dữ liệu dashboard';
};

// export const getDashboardOverview = async () => {
//     const [summaryResult, recentCvsResult] = await Promise.allSettled([
//         Response.GET(DASHBOARD_ENDPOINT),
//         Response.GET(RECENT_CVS_ENDPOINT),
//     ]);

//     const errors = [];
//     const normalized = {
//         stats: DEFAULT_DASHBOARD_STATS,
//         recentCvs: [],
//     };

//     if (summaryResult.status === 'fulfilled') {
//         const summary = normalizeDashboardPayload(summaryResult.value);
//         normalized.stats = summary.stats;
//         normalized.recentCvs = summary.recentCvs;
//     } else {
//         errors.push(summaryResult.reason);
//     }

//     if (recentCvsResult.status === 'fulfilled') {
//         const recentCvs = normalizeRecentCvsPayload(recentCvsResult.value);

//         if (recentCvs.length > 0) {
//             normalized.recentCvs = recentCvs;
//         }
//     } else {
//         errors.push(recentCvsResult.reason);
//     }

//     const success = summaryResult.status === 'fulfilled' || recentCvsResult.status === 'fulfilled';

//     return {
//         success,
//         data: normalized,
//         message: success ? '' : buildErrorMessage(errors),
//     };


// };


// HÀM MOCK DATA ĐỂ TEST KHI CHƯA CÓ BACKEND
export const getDashboardOverview = async () => {
    // Giả lập độ trễ mạng (1.5 giây) để test hiệu ứng Loading
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Dữ liệu giả định khớp với format mà Dashboard.jsx đang mong đợi
    const mockData = {
        stats: {
            totalCv: 12,
            aiUsed: 15,
            aiLimit: 50,
            currentPlan: 'Free',
            totalPdfExports: 24,
        },
        recentCvs: [
            {
                id: 'cv-1',
                slug: 'frontend-dev-2026',
                name: 'CV Frontend Developer',
                template: 'Modern Tech',
                // Giả lập thời gian: 5 phút trước
                updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), 
                status: 'Hoàn tất'
            },
            {
                id: 'cv-2',
                slug: 'react-fresher',
                name: 'CV React JS Fresher',
                template: 'Minimalist',
                // Giả lập thời gian: 2 giờ trước
                updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                status: 'Đang chỉnh sửa'
            },
            {
                id: 'cv-3',
                slug: 'ui-ux-designer',
                name: 'CV UI/UX Designer',
                template: 'Creative',
                // Giả lập thời gian: 2 ngày trước
                updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                status: 'Hoàn tất'
            }
        ]
    };

    // Đổi success thành false để test giao diện lỗi (errorMessage)
    return {
        success: true, 
        data: mockData,
        message: 'Lấy dữ liệu thành công',
    };
};