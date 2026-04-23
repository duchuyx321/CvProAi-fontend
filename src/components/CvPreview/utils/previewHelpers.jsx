import { DEFAULT_CV_AVATAR_URL } from '~/utils/cv-data.normalizer';

const SECTION_KEY_MAP = {
    profile: 'profile_header',
    profile_header: 'profile_header',
    personal_info: 'profile_header',
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
export const RICH_FIELDS = ['SUMMARY', 'description', 'content'];

export function isFieldGroup(value) {
    return value && typeof value === 'object' && Array.isArray(value.items);
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

export function resolveFieldValue(field, source = {}, content = {}) {
    if (field === 'SUMMARY') return content?.SUMMARY || '';

    if (field === 'avatar_url') {
        return (
            source?.avatar_url ||
            content?.profile_header?.avatar_url ||
            DEFAULT_CV_AVATAR_URL
        );
    }

    if (
        source?.[field] !== undefined &&
        source?.[field] !== null &&
        source?.[field] !== ''
    ) {
        return source[field];
    }

    if (content?.profile_header?.[field] !== undefined) {
        return content.profile_header[field];
    }
    if (content?.CONTACT?.[field] !== undefined) return content.CONTACT[field];

    return '';
}

export function getDateText(item = {}) {
    const start = item.start_date || '';
    const end = item.is_current ? 'Hiện tại' : item.end_date || '';

    if (!start && !end) return '';
    if (start && end) return `${start} - ${end}`;
    return start || end;
}
