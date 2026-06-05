import { DEFAULT_CV_AVATAR_URL } from '~/utils/cv-data.normalizer';

const SECTION_KEY_MAP = {
    PROFILE: 'profile_header',
    profile: 'profile_header',
    profile_header: 'profile_header',
    personal_info: 'profile_header',
    PERSONAL_INFO: 'profile_header',
    contact: 'CONTACT',
    CONTACT: 'CONTACT',
    summary: 'SUMMARY',
    SUMMARY: 'SUMMARY',
    experience: 'EXPERIENCE',
    EXPERIENCE: 'EXPERIENCE',
    education: 'EDUCATION',
    EDUCATION: 'EDUCATION',
    skills: 'SKILLS',
    SKILLS: 'SKILLS',
    projects: 'PROJECTS',
    PROJECTS: 'PROJECTS',
    additional: 'ADDITIONAL',
    ADDITIONAL: 'ADDITIONAL',
    activities: 'ACTIVITIES',
    ACTIVITIES: 'ACTIVITIES',
    awards: 'AWARDS',
    AWARDS: 'AWARDS',
    certificates: 'CERTIFICATES',
    CERTIFICATES: 'CERTIFICATES',
};

export const DATE_FIELDS = ['start_date', 'end_date', 'is_current'];
export const RICH_FIELDS = ['SUMMARY', 'summary', 'description', 'content'];

const CURRENT_DATE_VALUES = new Set(['now', 'nay', 'hiện tại', 'hien tai', 'present', 'current']);

export function isFieldGroup(value) {
    return (
        value &&
        typeof value === 'object' &&
        (value.type === 'GROUP' || Array.isArray(value.items))
    );
}

export function isFieldRef(value) {
    return value && typeof value === 'object' && value.type === 'FIELD';
}

export function isEmpty(value) {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return !value.trim();
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

export function isHtml(value) {
    return typeof value === 'string' && /<\/?[a-z][\s\S]*>/i.test(value);
}

export function resolveSectionData(type, content) {
    return content?.[SECTION_KEY_MAP[type]];
}

function normalizeKey(value = '') {
    return String(value).trim().toLowerCase();
}

export function getValueByPath(source = {}, path = '') {
    if (!source || !path) return undefined;

    return String(path)
        .split('.')
        .reduce((value, key) => {
            if (value === null || value === undefined) return undefined;
            return value?.[key];
        }, source);
}

export function getSectionData(sectionKey, section = {}, content = {}) {
    const candidates = [
        sectionKey,
        section?.type,
        SECTION_KEY_MAP[sectionKey],
        SECTION_KEY_MAP[section?.type],
        SECTION_KEY_MAP[normalizeKey(sectionKey)],
        SECTION_KEY_MAP[normalizeKey(section?.type)],
    ].filter(Boolean);

    for (const key of candidates) {
        if (content?.[key] !== undefined) return content[key];
    }

    return undefined;
}

export function resolveFieldValue(field, source = {}, content = {}) {
    const key = typeof field === 'string' ? field : field?.key;
    if (!key) return '';

    if (key === 'SUMMARY' || key === 'summary') {
        return content?.SUMMARY || source?.summary || source?.SUMMARY || '';
    }

    if (key === 'avatar_url') {
        return (
            source?.avatar_url ||
            content?.profile_header?.avatar_url ||
            DEFAULT_CV_AVATAR_URL
        );
    }

    if (
        getValueByPath(source, key) !== undefined &&
        getValueByPath(source, key) !== null &&
        getValueByPath(source, key) !== ''
    ) {
        return getValueByPath(source, key);
    }

    if (content?.profile_header?.[key] !== undefined) {
        return content.profile_header[key];
    }
    if (content?.CONTACT?.[key] !== undefined) return content.CONTACT[key];

    return '';
}

export function formatFieldValue(value, format) {
    if (isEmpty(value)) return '';

    if (format === 'percent') {
        const number = Number(value);
        return Number.isFinite(number) ? `${number}%` : String(value);
    }

    if (format === 'url' || format === 'email' || format === 'phone') {
        return String(value);
    }

    if (format === 'year') {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? String(value) : String(date.getFullYear());
    }

    if (format === 'month_year') {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    }

    if (format === 'date') {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return String(value);
        return date.toLocaleDateString('vi-VN');
    }

    return String(value);
}

export function getDateText(item = {}, options = {}) {
    const start = item.start_date || '';
    const rawEnd = item.end_date || '';
    const currentText = options?.currentText || 'Hiện tại';
    const separator = options?.separator || ' - ';
    const isCurrent =
        item.is_current ||
        CURRENT_DATE_VALUES.has(String(rawEnd).trim().toLowerCase());
    const end = isCurrent ? currentText : rawEnd;

    if (!start && !end) return '';
    if (start && end) return `${start}${separator}${end}`;
    return start || end;
}

export function getAvatarBorderRadius(shape) {
    if (shape === 'circle') return '50%';
    if (shape === 'rounded') return '12px';
    return '0px';
}

export function getSkillName(item = {}) {
    return item?.name || item?.title || item?.skill || item?.description || '';
}
