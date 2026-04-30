// sectionKey / normalizedType luôn là lowercase
export const SECTION_TYPE_MAP = {
    profile: 'personal_info',
    profile_header: 'personal_info',
    personal_info: 'personal_info',

    contact: 'contact',
    summary: 'summary',
    skills: 'skills',
    experience: 'experience',
    projects: 'projects',
    education: 'education',
    certificates: 'certificates',
    additional: 'additional',
    activities: 'activities',
    languages: 'languages',
    awards: 'awards',
    custom: 'custom',
    references: 'references',
};

// Map type nội bộ / section key sang key thật trong cvData.content
export const SECTION_CONTENT_KEY_MAP = {
    profile: 'profile_header',
    profile_header: 'profile_header',
    personal_info: 'profile_header',

    contact: 'CONTACT',
    summary: 'SUMMARY',
    skills: 'SKILLS',
    experience: 'EXPERIENCE',
    projects: 'PROJECTS',
    education: 'EDUCATION',
    certificates: 'CERTIFICATES',
    additional: 'ADDITIONAL',
    activities: 'ACTIVITIES',
    languages: 'LANGUAGES',
    awards: 'AWARDS',
    custom: 'CUSTOM',
    references: 'REFERENCES',
};

export const ARRAY_SECTION_TYPES = new Set([
    'skills',
    'experience',
    'projects',
    'education',
    'certificates',
    'activities',
    'languages',
    'awards',
    'references',
]);

// Default value theo shape editor UI
export const DEFAULT_SECTION_VALUE_MAP = {
    personal_info: {},
    contact: {},
    summary: { summary: '' },
    skills: [],
    experience: [],
    projects: [],
    education: [],
    certificates: [],
    activities: [],
    additional: {},
    languages: [],
    awards: [],
    custom: {},
    references: [],
};

// Default item khi thêm mới phần tử trong section dạng array
export const DEFAULT_ARRAY_ITEM_MAP = {
    skills: {
        name: '',
        description: '',
    },

    experience: {
        role: '',
        company: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '<p></p>',
    },

    projects: {
        name: '',
        role: '',
        start_date: '',
        end_date: '',
        technologies: '',
        description: '<p></p>',
    },

    education: {
        school: '',
        degree: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '<p></p>',
    },

    certificates: {
        name: '',
        issuer: '',
        organization: '',
        date: '',
        issue_date: '',
        credential_url: '',
        description: '<p></p>',
    },

    activities: {
        organization: '',
        role: '',
        start_date: '',
        end_date: '',
        description: '<p></p>',
    },

    languages: {
        name: '',
        level: '',
        description: '',
    },

    awards: {
        name: '',
        issuer: '',
        organization: '',
        date: '',
        year: '',
        description: '',
    },

    references: {
        name: '',
        company: '',
        position: '',
        email: '',
        phone: '',
    },
};

function normalizeRawKey(value = '') {
    return String(value).trim().toLowerCase();
}

export function normalizeSectionType(sectionKey, sectionConfig = {}) {
    const rawSectionKey = normalizeRawKey(sectionKey);
    const rawType = normalizeRawKey(sectionConfig?.type || sectionKey);

    return (
        SECTION_TYPE_MAP[rawSectionKey] ||
        SECTION_TYPE_MAP[rawType] ||
        rawType ||
        rawSectionKey
    );
}

export function getContentKey(sectionKey, sectionConfig = {}) {
    const normalizedSectionKey = normalizeRawKey(sectionKey);
    const normalizedType = normalizeSectionType(sectionKey, sectionConfig);
    const rawType = sectionConfig?.type || sectionKey;

    return (
        SECTION_CONTENT_KEY_MAP[normalizedSectionKey] ||
        SECTION_CONTENT_KEY_MAP[normalizedType] ||
        rawType ||
        sectionKey
    );
}

export function isArraySection(sectionKey, sectionConfig = {}) {
    return ARRAY_SECTION_TYPES.has(
        normalizeSectionType(sectionKey, sectionConfig),
    );
}

export function getDefaultSectionValue(sectionKey, sectionConfig = {}) {
    const normalizedType = normalizeSectionType(sectionKey, sectionConfig);
    const defaultValue = DEFAULT_SECTION_VALUE_MAP[normalizedType];

    if (Array.isArray(defaultValue)) return [...defaultValue];
    if (defaultValue && typeof defaultValue === 'object')
        return { ...defaultValue };

    return {};
}

export function createDefaultArrayItem(sectionKey, sectionConfig = {}) {
    const normalizedSectionKey = normalizeRawKey(sectionKey);
    const normalizedType = normalizeSectionType(sectionKey, sectionConfig);

    const item =
        DEFAULT_ARRAY_ITEM_MAP[normalizedSectionKey] ||
        DEFAULT_ARRAY_ITEM_MAP[normalizedType] ||
        {};
    const nextItem = { ...item };
    const fieldKeys = Array.isArray(sectionConfig?.fields)
        ? sectionConfig.fields
              .flatMap((field) => {
                  if (typeof field === 'string') return [field];
                  if (field?.type === 'FIELD' && field?.key) return [field.key];
                  if (Array.isArray(field?.items)) {
                      return field.items
                          .map((itemField) =>
                              typeof itemField === 'string'
                                  ? itemField
                                  : itemField?.key,
                          )
                          .filter(Boolean);
                  }
                  return field?.key ? [field.key] : [];
              })
              .filter(Boolean)
        : [];

    fieldKeys.forEach((fieldKey) => {
        if (nextItem[fieldKey] !== undefined) return;
        nextItem[fieldKey] = fieldKey === 'level' ? 0 : '';
    });

    if (sectionConfig?.options?.skill?.display === 'PROGRESS_BAR') {
        nextItem.level = nextItem.level ?? 0;
    }

    return nextItem;
}

export function buildSectionListFromConfig(templateConfig = {}, options = {}) {
    const zones = templateConfig?.zones || {};
    const sections = templateConfig?.sections || {};
    const removableSectionKeys = options?.removableSectionKeys || new Set();
    const nonExpandableSectionKeys =
        options?.nonExpandableSectionKeys || new Set();

    const orderedKeys = Object.values(zones).flat().filter(Boolean);
    const uniqueOrderedKeys = [...new Set(orderedKeys)];

    return uniqueOrderedKeys.map((sectionKey, index) => {
        const sectionConfig = sections?.[sectionKey] || {};
        const normalizedType = normalizeSectionType(sectionKey, sectionConfig);

        return {
            key: sectionKey,
            zoneKey: sectionKey,
            title: sectionConfig?.title || sectionKey,
            type: normalizedType,
            number: index + 1,
            removable: removableSectionKeys.has(sectionKey),
            expandable: !nonExpandableSectionKeys.has(sectionKey),
            rawType: sectionConfig?.type || sectionKey,
            fields: sectionConfig?.fields || [],
            variant: sectionConfig?.variant || '',
            options: sectionConfig?.options || {},
            style: sectionConfig?.style || {},
            visible: sectionConfig?.visible,
        };
    });
}

export function mapResumeDataBySection(templateConfig = {}, resumeData = {}) {
    const sections = templateConfig?.sections || {};
    const nextResumeData = { ...resumeData };

    Object.keys(sections).forEach((sectionKey) => {
        if (nextResumeData[sectionKey] !== undefined) return;

        const sectionConfig = sections[sectionKey];
        const normalizedType = normalizeSectionType(sectionKey, sectionConfig);

        if (normalizedType === 'personal_info') {
            nextResumeData[sectionKey] =
                resumeData[sectionKey] ||
                resumeData.profile ||
                resumeData.profile_header ||
                resumeData.personal_info ||
                {};
            return;
        }

        if (normalizedType === 'summary') {
            const currentValue = resumeData[sectionKey] || resumeData.summary;

            nextResumeData[sectionKey] =
                currentValue && typeof currentValue === 'object'
                    ? currentValue
                    : { summary: '' };
            return;
        }

        nextResumeData[sectionKey] =
            resumeData[sectionKey] ??
            getDefaultSectionValue(sectionKey, sectionConfig);
    });

    return nextResumeData;
}

export function buildEditorResumeData(cvData = {}) {
    const content = cvData?.content || {};
    const configSections = cvData?.config?.sections || {};
    const result = {};

    Object.keys(configSections).forEach((sectionKey) => {
        const sectionConfig = configSections[sectionKey];
        const normalizedType = normalizeSectionType(sectionKey, sectionConfig);
        const contentKey = getContentKey(sectionKey, sectionConfig);
        const rawValue = content?.[contentKey];

        if (normalizedType === 'summary') {
            result[sectionKey] = {
                summary: typeof rawValue === 'string' ? rawValue : '',
            };
            return;
        }

        if (isArraySection(sectionKey, sectionConfig)) {
            result[sectionKey] = Array.isArray(rawValue) ? rawValue : [];
            return;
        }

        result[sectionKey] =
            rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)
                ? rawValue
                : {};
    });

    return result;
}

// State khởi tạo cho CvEditor
export function createInitialCvState() {
    return {
        id: '',
        slug: '',
        name: '',
        code: '',
        content: {},
        config: {},
    };
}

export function validateTemplateConfig(templateConfig = {}) {
    const zones = templateConfig?.zones || {};
    const sections = templateConfig?.sections || {};

    if (!zones || typeof zones !== 'object') {
        return {
            isValid: false,
            message: 'templateConfig.zones không hợp lệ',
        };
    }

    if (!sections || typeof sections !== 'object') {
        return {
            isValid: false,
            message: 'templateConfig.sections không hợp lệ',
        };
    }

    const zoneSectionKeys = Object.values(zones).flat().filter(Boolean);
    const missingSections = zoneSectionKeys.filter((key) => !sections[key]);

    if (missingSections.length > 0) {
        return {
            isValid: false,
            message: `Thiếu config cho section: ${missingSections.join(', ')}`,
        };
    }

    return {
        isValid: true,
        message: '',
    };
}
