const SECTION_KEY_MAP = {
    profile_header: 'profile_header',
    CONTACT: 'CONTACT',
    SUMMARY: 'SUMMARY',
    EXPERIENCE: 'EXPERIENCE',
    EDUCATION: 'EDUCATION',
    SKILLS: 'SKILLS',
    PROJECTS: 'PROJECTS',
    ADDITIONAL: 'ADDITIONAL',
    ACTIVITIES: 'ACTIVITIES',
    AWARDS: 'AWARDS',
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

    if (
        source?.[field] !== undefined &&
        source?.[field] !== null &&
        source?.[field] !== ''
    ) {
        return source[field];
    }

    if (content?.profile_header?.[field]) return content.profile_header[field];
    if (content?.CONTACT?.[field]) return content.CONTACT[field];

    return '';
}

export function getDateText(item = {}) {
    const start = item.start_date || '';
    const end = item.is_current ? 'Hiện tại' : item.end_date || '';

    if (!start && !end) return '';
    if (start && end) return `${start} - ${end}`;
    return start || end;
}
