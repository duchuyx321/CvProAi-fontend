import { deepMerge } from '~/components/CvPreview/utils/deepMerge';
import {
    defaultMockContent,
    getMockContent,
} from '~/components/CvPreview/utils/mockContent';
import {
    getContentKey,
    normalizeSectionType,
} from './cv-section.schema';

const DEFAULT_THEME = {
    colors: {
        accent: '#EAF3FC',
        primary: '#3F73A7',
        bg_session: '#ffffff',
    },
    prefix: '//',
    spacing: {
        itemGap: 12,
        sectionGap: 24,
    },
    fontFamily: 'Inter',
};

const DEFAULT_LAYOUT = {
    body: {
        layout: 'SPLIT',
        columns: [
            { id: 'left_col', width: 33 },
            { id: 'right_col', width: 67 },
        ],
    },
    page: {
        size: 'A4',
        margin: {
            top: 12,
            left: 12,
            right: 12,
            bottom: 12,
        },
    },
};

const DEFAULT_SECTION_CONFIGS = {
    profile: {
        type: 'profile_header',
        title: 'Thông tin cá nhân',
        fields: ['avatar_url', 'headline', 'full_name'],
        variant: 'sidebar_avatar_badge_name',
    },
    contact: {
        type: 'CONTACT',
        title: 'Thông tin liên hệ',
        fields: ['email', 'phone', 'website', 'address'],
        variant: 'icon_list',
    },
    summary: {
        type: 'SUMMARY',
        title: 'Mục tiêu nghề nghiệp',
        fields: ['SUMMARY'],
        variant: 'content_box_richtext',
    },
    skills: {
        type: 'SKILLS',
        title: 'Kỹ năng',
        fields: ['name', 'description'],
        variant: 'progress_bar',
    },
    experience: {
        type: 'EXPERIENCE',
        title: 'Kinh nghiệm',
        fields: ['role', 'company', 'description'],
        variant: 'timeline',
    },
    education: {
        type: 'EDUCATION',
        title: 'Học vấn',
        fields: ['degree', 'school', 'description'],
        variant: 'list',
    },
    projects: {
        type: 'PROJECTS',
        title: 'Dự án',
        fields: ['name', 'tech_stack', 'description', 'link'],
        variant: 'list',
    },
    additional: {
        type: 'ADDITIONAL',
        title: 'Thông tin thêm',
        fields: ['content'],
        variant: 'sidebar_box_richtext',
    },
    certificates: {
        type: 'CERTIFICATES',
        title: 'Chứng chỉ',
        fields: ['name', 'issuer', 'description'],
        variant: 'list',
    },
    languages: {
        type: 'LANGUAGES',
        title: 'Ngôn ngữ',
        fields: ['name', 'level', 'description'],
        variant: 'list',
    },
    awards: {
        type: 'AWARDS',
        title: 'Giải thưởng',
        fields: ['name', 'issuer', 'description'],
        variant: 'list',
    },
    references: {
        type: 'REFERENCES',
        title: 'Người tham chiếu',
        fields: ['name', 'position', 'company', 'email', 'phone'],
        variant: 'list',
    },
};

const SECTION_KEY_BY_TYPE = {
    personal_info: 'profile',
    contact: 'contact',
    summary: 'summary',
    skills: 'skills',
    experience: 'experience',
    projects: 'projects',
    education: 'education',
    certificates: 'certificates',
    additional: 'additional',
    languages: 'languages',
    awards: 'awards',
    references: 'references',
};

const CONTENT_KEY_BY_RAW_KEY = {
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
    languages: 'LANGUAGES',
    awards: 'AWARDS',
    references: 'REFERENCES',
};

export const DEFAULT_CV_AVATAR_URL = defaultMockContent.profile_header.avatar_url;

const MINIMAL_FALLBACK_CONTENT = {
    profile_header: {
        full_name: defaultMockContent.profile_header.full_name,
        headline: defaultMockContent.profile_header.headline,
        avatar_url: DEFAULT_CV_AVATAR_URL,
    },
    CONTACT: {
        ...defaultMockContent.CONTACT,
    },
    SUMMARY: '',
    EXPERIENCE: [],
    EDUCATION: [],
    SKILLS: [],
    PROJECTS: [],
    ADDITIONAL: {},
    CERTIFICATES: [],
    LANGUAGES: [],
    AWARDS: [],
    REFERENCES: [],
};

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toObject(value) {
    return isPlainObject(value) ? value : {};
}

function toArray(value) {
    return Array.isArray(value) ? value : [];
}

function normalizeRawKey(value = '') {
    return String(value).trim().toLowerCase();
}

function hasObjectValues(value) {
    return Object.keys(toObject(value)).length > 0;
}

function buildSeedContent(
    templateCode,
    seedContent = {},
    useMockContent = false,
) {
    const baseContent = useMockContent
        ? getMockContent(templateCode)
        : MINIMAL_FALLBACK_CONTENT;
    const normalizedSeedContent = normalizeContentShape(seedContent);
    return deepMerge(baseContent, normalizedSeedContent);
}

function getCanonicalContentKey(rawKey = '') {
    return CONTENT_KEY_BY_RAW_KEY[normalizeRawKey(rawKey)] || rawKey;
}

function getCanonicalSectionKey(sectionKey = '', sectionConfig = {}) {
    const normalizedType = normalizeSectionType(sectionKey, sectionConfig);
    return (
        SECTION_KEY_BY_TYPE[normalizedType] ||
        normalizeRawKey(sectionKey) ||
        sectionKey
    );
}

function getDefaultSectionConfig(sectionKey = '') {
    const canonicalSectionKey = getCanonicalSectionKey(sectionKey);
    const defaultConfig = DEFAULT_SECTION_CONFIGS[canonicalSectionKey];

    if (!defaultConfig) return null;

    return {
        ...defaultConfig,
        fields: Array.isArray(defaultConfig.fields)
            ? [...defaultConfig.fields]
            : [],
    };
}

function buildSectionAliasLookup(sections = {}) {
    return Object.entries(toObject(sections)).reduce(
        (result, [sectionKey, sectionConfig]) => {
            const safeConfig = toObject(sectionConfig);
            const normalizedType = normalizeSectionType(sectionKey, safeConfig);
            const contentKey = getContentKey(sectionKey, safeConfig);
            const canonicalSectionKey = getCanonicalSectionKey(
                sectionKey,
                safeConfig,
            );

            [
                sectionKey,
                safeConfig?.type,
                normalizedType,
                contentKey,
                canonicalSectionKey,
            ]
                .filter(Boolean)
                .forEach((alias) => {
                    result[normalizeRawKey(alias)] = canonicalSectionKey;
                });

            return result;
        },
        {},
    );
}

function normalizeContentShape(rawContent = {}) {
    return Object.entries(toObject(rawContent)).reduce((result, [key, value]) => {
        const nextKey = getCanonicalContentKey(key);
        const previousValue = result[nextKey];

        if (previousValue === undefined) {
            result[nextKey] = value;
            return result;
        }

        if (isPlainObject(previousValue) && isPlainObject(value)) {
            result[nextKey] = deepMerge(previousValue, value);
            return result;
        }

        result[nextKey] = value;
        return result;
    }, {});
}

function normalizeContent({
    content = {},
    seedContent = {},
    templateCode = '',
    userProfile = {},
    useMockContent = false,
} = {}) {
    const normalizedSeedContent = buildSeedContent(
        templateCode,
        seedContent,
        useMockContent,
    );
    const normalizedContent = normalizeContentShape(content);
    const mergedContent = deepMerge(normalizedSeedContent, normalizedContent);
    const profileHeader = toObject(mergedContent.profile_header);
    const safeUserProfile = toObject(userProfile);

    const resolvedProfileHeader = {
        ...defaultMockContent.profile_header,
        ...profileHeader,
        full_name:
            profileHeader.full_name ||
            safeUserProfile.full_name ||
            safeUserProfile.name ||
            defaultMockContent.profile_header.full_name,
        headline:
            profileHeader.headline ||
            safeUserProfile.headline ||
            defaultMockContent.profile_header.headline,
        avatar_url:
            profileHeader.avatar_url ||
            safeUserProfile.avatar_url ||
            DEFAULT_CV_AVATAR_URL,
    };

    return {
        ...mergedContent,
        profile_header: resolvedProfileHeader,
        CONTACT: {
            ...defaultMockContent.CONTACT,
            ...toObject(mergedContent.CONTACT),
        },
        SUMMARY:
            typeof mergedContent.SUMMARY === 'string'
                ? mergedContent.SUMMARY
                : typeof profileHeader.summary === 'string'
                  ? profileHeader.summary
                  : '',
        EXPERIENCE: toArray(mergedContent.EXPERIENCE),
        EDUCATION: toArray(mergedContent.EDUCATION),
        SKILLS: toArray(mergedContent.SKILLS),
        PROJECTS: toArray(mergedContent.PROJECTS),
        ADDITIONAL: toObject(mergedContent.ADDITIONAL),
        CERTIFICATES: toArray(mergedContent.CERTIFICATES),
        LANGUAGES: toArray(mergedContent.LANGUAGES),
        AWARDS: toArray(mergedContent.AWARDS),
        REFERENCES: toArray(mergedContent.REFERENCES),
    };
}

function buildDefaultZones(sections = {}) {
    const leftCol = [];
    const rightCol = [];

    Object.entries(toObject(sections)).forEach(([sectionKey, sectionConfig]) => {
        const normalizedType = normalizeSectionType(sectionKey, sectionConfig);

        if (
            ['personal_info', 'contact', 'skills', 'additional', 'languages'].includes(
                normalizedType,
            )
        ) {
            leftCol.push(sectionKey);
            return;
        }

        rightCol.push(sectionKey);
    });

    return {
        left_col: leftCol,
        right_col: rightCol,
    };
}

function normalizeSections(rawSections = {}) {
    return Object.entries(toObject(rawSections)).reduce(
        (result, [sectionKey, sectionConfig]) => {
            const safeConfig = toObject(sectionConfig);
            const canonicalSectionKey = getCanonicalSectionKey(
                sectionKey,
                safeConfig,
            );
            const defaultConfig =
                getDefaultSectionConfig(canonicalSectionKey) || {};
            const previousConfig = result[canonicalSectionKey] || {};

            result[canonicalSectionKey] = {
                ...defaultConfig,
                ...previousConfig,
                ...safeConfig,
                type: safeConfig?.type || defaultConfig?.type || sectionKey,
                title: safeConfig?.title ?? defaultConfig?.title ?? '',
                fields:
                    Array.isArray(safeConfig?.fields) && safeConfig.fields.length > 0
                        ? safeConfig.fields
                        : Array.isArray(previousConfig?.fields) &&
                            previousConfig.fields.length > 0
                          ? previousConfig.fields
                          : defaultConfig?.fields || [],
                variant:
                    safeConfig?.variant ??
                    previousConfig?.variant ??
                    defaultConfig?.variant ??
                    '',
            };

            return result;
        },
        {},
    );
}

function normalizeConfig(rawConfig = {}, content = {}) {
    const safeConfig = toObject(rawConfig);
    const nextSections = normalizeSections(safeConfig?.sections);
    const sectionAliasLookup = buildSectionAliasLookup(nextSections);
    const rawZones = toObject(safeConfig?.zones);

    const nextZones = Object.entries(rawZones).reduce((result, [zoneKey, value]) => {
        const normalizedSectionKeys = toArray(value)
            .map((sectionKey) => {
                const normalizedKey = normalizeRawKey(sectionKey);
                return (
                    sectionAliasLookup[normalizedKey] ||
                    getCanonicalSectionKey(sectionKey)
                );
            })
            .filter(Boolean)
            .filter((sectionKey, index, array) => array.indexOf(sectionKey) === index)
            .filter((sectionKey) => {
                if (nextSections[sectionKey]) return true;

                const defaultConfig = getDefaultSectionConfig(sectionKey);
                if (!defaultConfig) return false;

                nextSections[sectionKey] = defaultConfig;
                return true;
            });

        result[zoneKey] = normalizedSectionKeys;
        return result;
    }, {});

    Object.keys(content || {}).forEach((contentKey) => {
        const canonicalSectionKey =
            sectionAliasLookup[normalizeRawKey(contentKey)] ||
            getCanonicalSectionKey(contentKey);

        if (nextSections[canonicalSectionKey]) return;

        const defaultConfig = getDefaultSectionConfig(canonicalSectionKey);
        if (defaultConfig) {
            nextSections[canonicalSectionKey] = defaultConfig;
        }
    });

    const hasConfiguredZones = Object.values(nextZones).some(
        (items) => Array.isArray(items) && items.length > 0,
    );

    return {
        ...safeConfig,
        theme: deepMerge(DEFAULT_THEME, toObject(safeConfig?.theme)),
        layout: deepMerge(DEFAULT_LAYOUT, toObject(safeConfig?.layout)),
        sections: nextSections,
        zones: hasConfiguredZones ? nextZones : buildDefaultZones(nextSections),
    };
}

export function normalizeCvData(source = {}, options = {}) {
    const safeSource = toObject(source);
    const template = toObject(safeSource?.template);
    const configFromApi = toObject(safeSource?.config);
    const customConfig = toObject(safeSource?.custom_config);
    const templateConfig = toObject(template?.config);
    const mergedConfig =
        hasObjectValues(configFromApi)
            ? configFromApi
            : deepMerge(templateConfig, customConfig);
    const templateCode =
        safeSource?.template_code ||
        safeSource?.code ||
        template?.code ||
        options?.templateCode ||
        '';
    const userProfile = toObject(
        safeSource?.user_profile || safeSource?.userProfile,
    );
    const seedContent =
        options?.seedContent ??
        safeSource?.template_content ??
        template?.content ??
        {};
    const content = normalizeContent({
        content: safeSource?.content,
        seedContent,
        templateCode,
        userProfile,
        useMockContent: Boolean(options?.useMockContent),
    });
    const config = normalizeConfig(mergedConfig, content);

    return {
        ...safeSource,
        title: safeSource?.title || safeSource?.name || '',
        name: safeSource?.name || safeSource?.title || '',
        code: safeSource?.code || templateCode,
        template_code: templateCode,
        template_id: safeSource?.template_id || template?.id || '',
        preview_url: safeSource?.preview_url || template?.preview_url || '',
        user_profile: userProfile,
        content,
        config,
        template_content: normalizeContentShape(seedContent),
    };
}
