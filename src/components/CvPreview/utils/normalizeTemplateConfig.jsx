const DEFAULT_SECTION_CONFIGS = {
    profile_header: {
        type: 'profile_header',
        title: 'Thông tin cá nhân',
        fields: [
            {
                items: [
                    'avatar_url',
                    {
                        items: ['full_name', 'headline'],
                        layout: 'COLUMN',
                    },
                ],
                layout: 'ROW',
            },
        ],
        styles: 'text-align-left',
    },
    CONTACT: {
        type: 'CONTACT',
        title: 'Liên hệ',
        variant: 'icon_list',
    },
    SKILLS: {
        type: 'SKILLS',
        title: 'Kỹ năng',
        variant: 'progress_bar',
    },
    EXPERIENCE: {
        type: 'EXPERIENCE',
        title: 'Kinh nghiệm',
        variant: 'timeline',
    },
    EDUCATION: {
        type: 'EDUCATION',
        title: 'Học vấn',
        variant: 'list',
    },
    PROJECTS: {
        type: 'PROJECTS',
        title: 'Dự án',
        variant: 'list',
    },
};

export default function normalizeTemplateConfig(rawConfig = {}, content = {}) {
    const config = { ...(rawConfig || {}) };
    const zones = config?.zones || {};
    const currentSections = config?.sections || {};
    const nextSections = { ...currentSections };

    const zoneSectionKeys = Object.values(zones).flat().filter(Boolean);
    const contentKeys = Object.keys(content || {});
    const allKeys = [...new Set([...zoneSectionKeys, ...contentKeys])];

    allKeys.forEach((sectionKey) => {
        if (!nextSections[sectionKey] && DEFAULT_SECTION_CONFIGS[sectionKey]) {
            nextSections[sectionKey] = DEFAULT_SECTION_CONFIGS[sectionKey];
        }
    });

    return {
        ...config,
        sections: nextSections,
    };
}
