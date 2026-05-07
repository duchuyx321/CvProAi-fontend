// src/pages/Admin/ManageTemplates/utils.jsx

export const getTemplateRecordId = (template) => {
    if (!template) return null;
    return (
        template.id ||
        template._id ||
        template.template_id ||
        template.code ||
        null
    );
};

export const getTemplateListFromResponse = (result) => {
    if (!result) return [];
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.data?.items)) return result.data.items;
    if (Array.isArray(result?.data?.data)) return result.data.data;
    if (Array.isArray(result?.data?.templates)) return result.data.templates;
    if (Array.isArray(result?.items)) return result.items;
    return [];
};

export const getTemplateIdLabel = (template, index = 0) => {
    if (!template) return `#CV-${String(index + 1).padStart(3, '0')}`;

    if (template.id && typeof template.id === 'string') {
        if (template.id.startsWith('CV-')) return `#${template.id}`;
        return template.id.length > 8
            ? `#CV-${template.id.slice(0, 6).toUpperCase()}`
            : `#${template.id}`;
    }

    if (template.code) return `#${template.code}`;
    return `#CV-${String(index + 1).padStart(3, '0')}`;
};

export const getTemplateCreatedDate = (template) => {
    const raw =
        template?.created_at ||
        template?.createdAt ||
        template?.created_date ||
        template?.date;

    if (!raw) return '—';

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};

export const getTemplateUsageCount = (template) => {
    return Number(
        template?.usage_count ||
            template?.usageCount ||
            template?.used_count ||
            template?.usage ||
            0,
    );
};

export const formatNumber = (value) => {
    const number = Number(value);
    if (Number.isNaN(number)) return '0';
    return new Intl.NumberFormat('vi-VN').format(number);
};

export const filterTemplates = ({
    templates,
    searchValue,
    typeFilter,
    sortValue,
}) => {
    if (!Array.isArray(templates)) return [];

    let result = [...templates];

    const keyword = (searchValue || '').trim().toLowerCase();
    if (keyword) {
        result = result.filter((item) => {
            const name = (item?.name || '').toLowerCase();
            const code = (item?.code || '').toLowerCase();
            const id = String(item?.id || item?._id || '').toLowerCase();
            return (
                name.includes(keyword) ||
                code.includes(keyword) ||
                id.includes(keyword)
            );
        });
    }

    if (typeFilter === 'free') {
        result = result.filter((item) => !item?.is_premium);
    } else if (typeFilter === 'premium') {
        result = result.filter((item) => Boolean(item?.is_premium));
    }

    const getTime = (item) => {
        const raw =
            item?.created_at ||
            item?.createdAt ||
            item?.created_date ||
            item?.date;
        const date = new Date(raw);
        return Number.isNaN(date.getTime()) ? 0 : date.getTime();
    };

    if (sortValue === 'newest') {
        result.sort((a, b) => getTime(b) - getTime(a));
    } else if (sortValue === 'oldest') {
        result.sort((a, b) => getTime(a) - getTime(b));
    } else if (sortValue === 'most_used') {
        result.sort(
            (a, b) => getTemplateUsageCount(b) - getTemplateUsageCount(a),
        );
    } else if (sortValue === 'least_used') {
        result.sort(
            (a, b) => getTemplateUsageCount(a) - getTemplateUsageCount(b),
        );
    }

    return result;
};

export const buildTemplateStats = (templates) => {
    if (!Array.isArray(templates) || templates.length === 0) {
        return {
            totalUsage: 0,
            activeCount: 0,
            inactiveCount: 0,
            activePercent: 0,
        };
    }

    const totalUsage = templates.reduce(
        (sum, item) => sum + getTemplateUsageCount(item),
        0,
    );

    const activeCount = templates.filter(
        (item) => item?.is_active !== false,
    ).length;

    const inactiveCount = templates.filter(
        (item) => item?.is_active === false,
    ).length;

    const activePercent = Math.round(
        (activeCount / Math.max(1, templates.length)) * 100,
    );

    return { totalUsage, activeCount, inactiveCount, activePercent };
};

export const getTemplateAdminConfig = (template) => {
    const adminEditor = template?.config?.admin_editor || {};
    const bodyLayout = template?.config?.layout?.body?.layout;
    const theme = template?.config?.theme || {};

    const resolvedLayout =
        adminEditor.layout ||
        (bodyLayout === 'STACK'
            ? 'oneColumn'
            : bodyLayout === 'BANNER_SPLIT'
              ? 'modernHeader'
              : bodyLayout === 'SPLIT'
                ? 'twoColumn'
                : 'modernHeader');

    return {
        layout: resolvedLayout,
        primaryColor:
            adminEditor.primaryColor || theme?.colors?.primary || '#635BFF',
        fontFamily: adminEditor.fontFamily || theme.fontFamily || 'Inter',
        spacing: adminEditor.spacing || 'comfortable',
        sections: adminEditor.sections || {},
    };
};
