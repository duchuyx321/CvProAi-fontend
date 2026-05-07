// src/pages/Admin/ManageTemplates/TemplateEditor/RightPreview/templateSchema.jsx

const SPACING_THEME = {
    compact: {
        itemGap: 8,
        sectionGap: 16,
    },
    comfortable: {
        itemGap: 12,
        sectionGap: 24,
    },
    loose: {
        itemGap: 16,
        sectionGap: 34,
    },
};

const SECTION_DEFINITIONS = {
    profile: {
        type: 'profile_header',
        title: '',
        variant: 'profile_top_avatar_left_contact_inline',
        fields: ['avatar_url', 'full_name', 'headline'],
        options: {
            avatar: {
                width: 118,
                height: 118,
                shape: 'circle',
                objectFit: 'cover',
            },
        },
        style: {
            container: {
                margin: '0 0 8px 0',
            },
            title: {
                fontSize: 34,
                fontWeight: 800,
                lineHeight: 1.08,
            },
            content: {
                fontSize: 15,
                lineHeight: 1.45,
            },
        },
    },
    contact: {
        type: 'CONTACT',
        title: 'Liên hệ',
        variant: 'contact_icon_list',
        fields: [
            { key: 'email', icon: 'mail' },
            { key: 'phone', icon: 'phone' },
            { key: 'address', icon: 'location' },
            { key: 'website', icon: 'link' },
        ],
    },
    summary: {
        type: 'SUMMARY',
        title: 'Tóm tắt chuyên môn',
        variant: 'content_box_richtext',
        fields: ['summary'],
    },
    experience: {
        type: 'EXPERIENCE',
        title: 'Kinh nghiệm làm việc',
        variant: 'right_date_timeline',
        fields: ['role', 'company', 'description'],
        options: {
            date: {
                position: 'right',
                separator: ' - ',
                currentText: 'Hiện tại',
            },
        },
    },
    skills: {
        type: 'SKILLS',
        title: 'Kỹ năng',
        variant: 'skills_tags',
        fields: ['name', 'description'],
        options: {
            skill: {
                display: 'TAG',
                showDescription: false,
            },
        },
    },
    education: {
        type: 'EDUCATION',
        title: 'Học vấn',
        variant: 'date_badge_card',
        fields: ['degree', 'school', 'description'],
        options: {
            date: {
                position: 'badge',
                separator: ' - ',
            },
            card: {
                enabled: true,
                background: '#ffffff',
                borderRadius: 8,
                padding: '14px 16px',
                shadow: 'none',
            },
        },
    },
    languages: {
        type: 'LANGUAGES',
        title: 'Ngoại ngữ',
        variant: 'skills_bullet',
        fields: ['name', 'level', 'description'],
    },
};

const getLayoutSectionOverrides = (sectionKey, editor) => {
    if (sectionKey !== 'profile') return {};

    if (editor.layout === 'twoColumn') {
        return {
            variant: 'profile_sidebar_avatar_top',
            options: {
                avatar: {
                    width: 132,
                    height: 132,
                    shape: 'circle',
                    objectFit: 'cover',
                },
            },
            style: {
                container: {
                    margin: '0 0 4px 0',
                },
                title: {
                    fontSize: 26,
                    fontWeight: 900,
                    lineHeight: 1.12,
                    wordBreak: 'normal',
                    overflowWrap: 'break-word',
                },
                content: {
                    fontSize: 12,
                    lineHeight: 1.4,
                },
            },
        };
    }

    return {
        variant: 'profile_top_avatar_left_contact_inline',
    };
};

export const TEMPLATE_PREVIEW_CONTENT = {
    profile_header: {
        full_name: 'Nguyễn Văn Long',
        headline: 'Senior Frontend Developer',
        avatar_url: '',
    },
    CONTACT: {
        email: 'long.nguyen@email.com',
        phone: '0901 234 567',
        address: 'TP. Hồ Chí Minh',
        website: 'linkedin.com/in/longnguyen',
    },
    SUMMARY:
        'Hơn 5 năm kinh nghiệm phát triển ứng dụng web hiện đại, tối ưu hiệu năng và xây dựng trải nghiệm người dùng nhất quán.',
    EXPERIENCE: [
        {
            role: 'Senior Frontend Lead',
            company: 'Tech Solutions Asia',
            start_date: '2020',
            end_date: 'Hiện tại',
            description:
                'Xây dựng kiến trúc frontend cho hệ thống quản trị quy mô lớn, dẫn dắt guideline UI và tối ưu trải nghiệm người dùng.',
        },
        {
            role: 'Frontend Developer',
            company: 'Creative Studio XYZ',
            start_date: '2018',
            end_date: '2020',
            description:
                'Phát triển dashboard và landing page cho các sản phẩm fintech, phối hợp cùng design team để chuẩn hoá component.',
        },
    ],
    EDUCATION: [
        {
            school: 'ĐH Bách Khoa TP.HCM',
            degree: 'Kỹ sư Công nghệ thông tin',
            start_date: '2014',
            end_date: '2018',
            description: 'Tập trung vào web development và software design.',
        },
    ],
    SKILLS: [
        { name: 'React.js' },
        { name: 'TypeScript' },
        { name: 'GraphQL' },
        { name: 'UI System' },
    ],
    LANGUAGES: [
        { name: 'Tiếng Anh', level: 'IELTS 7.5' },
        { name: 'Tiếng Nhật', level: 'N3' },
    ],
};

const getEnabledKeys = (editor) => {
    return Object.entries(editor?.sections || {})
        .filter(([, enabled]) => Boolean(enabled))
        .map(([key]) => key)
        .filter((key) => SECTION_DEFINITIONS[key]);
};

const buildZones = (editor) => {
    const enabled = new Set(getEnabledKeys(editor));

    if (editor.layout === 'oneColumn') {
        return {
            main: getEnabledKeys(editor),
        };
    }

    if (editor.layout === 'modernHeader') {
        return {
            banner: enabled.has('profile') ? ['profile'] : [],
            left_col: ['skills', 'languages'].filter((key) => enabled.has(key)),
            right_col: ['summary', 'experience', 'education'].filter((key) =>
                enabled.has(key),
            ),
        };
    }

    return {
        left_col: ['profile', 'contact', 'skills', 'languages'].filter(
            (key) => key === 'contact' || enabled.has(key),
        ),
        right_col: ['summary', 'experience', 'education'].filter((key) =>
            enabled.has(key),
        ),
    };
};

const buildLayout = (editor) => {
    if (editor.layout === 'oneColumn') {
        return {
            key: 'admin_one_column',
            page: {
                size: 'A4',
                margin: { top: 12, right: 12, bottom: 12, left: 12 },
            },
            body: {
                layout: 'STACK',
                columns: [{ id: 'main', width: 100 }],
            },
        };
    }

    if (editor.layout === 'modernHeader') {
        return {
            key: 'admin_modern_header',
            page: {
                size: 'A4',
                margin: { top: 0, right: 0, bottom: 0, left: 0 },
            },
            body: {
                layout: 'BANNER_SPLIT',
                columns: [
                    {
                        id: 'left_col',
                        width: 34,
                        style: {
                            background: '#F8FAFC',
                            padding: '26px 22px 34px',
                        },
                    },
                    {
                        id: 'right_col',
                        width: 66,
                        style: {
                            padding: '26px 32px 34px',
                        },
                    },
                ],
            },
        };
    }

    return {
        key: 'admin_two_column',
        page: {
            size: 'A4',
            margin: { top: 12, right: 12, bottom: 12, left: 12 },
        },
        body: {
            layout: 'SPLIT',
            columns: [
                {
                    id: 'left_col',
                    width: 34,
                    style: {
                        background: '#F8FAFC',
                        padding: '22px',
                    },
                },
                {
                    id: 'right_col',
                    width: 66,
                    style: {
                        padding: '22px 0 22px 26px',
                    },
                },
            ],
        },
    };
};

const buildTheme = (editor, baseTheme = {}) => ({
    ...baseTheme,
    fontFamily: editor.fontFamily,
    colors: {
        ...(baseTheme?.colors || {}),
        primary: editor.primaryColor,
        accent: baseTheme?.colors?.accent || '#EEF2FF',
        text: baseTheme?.colors?.text || '#24384D',
        muted: baseTheme?.colors?.muted || '#64748B',
        background: baseTheme?.colors?.background || '#FFFFFF',
        surface: baseTheme?.colors?.surface || '#F8FAFC',
        border: baseTheme?.colors?.border || '#E2E8F0',
        icon: editor.primaryColor,
    },
    spacing: {
        ...(baseTheme?.spacing || {}),
        ...(SPACING_THEME[editor.spacing] || SPACING_THEME.comfortable),
    },
    fontSize: {
        ...(baseTheme?.fontSize || {}),
        name: 34,
        headline: 15,
        sectionTitle: 15,
        body: 13,
        small: 12,
    },
});

export const buildEditorTemplateConfig = (editor, baseConfig = {}) => {
    const zones = buildZones(editor);
    const zoneKeys = [...new Set(Object.values(zones).flat())];

    const sections = zoneKeys.reduce((result, sectionKey) => {
        const baseSection = baseConfig?.sections?.[sectionKey] || {};
        const layoutOverrides = getLayoutSectionOverrides(sectionKey, editor);

        result[sectionKey] = {
            ...SECTION_DEFINITIONS[sectionKey],
            ...baseSection,
            ...layoutOverrides,
            visible:
                sectionKey === 'contact'
                    ? true
                    : editor.sections[sectionKey] !== false,
        };
        return result;
    }, {});

    return {
        ...baseConfig,
        rendererVersion: baseConfig?.rendererVersion || 1,
        version: baseConfig?.version || 2,
        layout: buildLayout(editor),
        zones,
        sections,
        theme: buildTheme(editor, baseConfig?.theme),
        admin_editor: {
            layout: editor.layout,
            primaryColor: editor.primaryColor,
            fontFamily: editor.fontFamily,
            spacing: editor.spacing,
            sections: editor.sections,
        },
    };
};

export const getEditorSectionsFromConfig = (config = {}) => {
    const zoneSectionKeys = new Set(Object.values(config?.zones || {}).flat());

    if (zoneSectionKeys.size === 0) return {};

    return Object.keys(SECTION_DEFINITIONS).reduce((result, sectionKey) => {
        if (sectionKey === 'contact') return result;
        result[sectionKey] = zoneSectionKeys.has(sectionKey);
        return result;
    }, {});
};

export const buildEditorPreviewTemplate = (editor, template = {}) => {
    const config = buildEditorTemplateConfig(editor, template?.config || {});

    return {
        ...(template || {}),
        id: template?.id || 'admin-preview-template',
        code: editor.code || template?.code || 'ADMIN_PREVIEW',
        name: editor.name || template?.name || 'Preview CV Template',
        content: TEMPLATE_PREVIEW_CONTENT,
        config,
    };
};

export const buildEditorPreviewCv = (editor, template = {}) => {
    const previewTemplate = buildEditorPreviewTemplate(editor, template);

    return {
        id: 'admin-preview-cv',
        title: previewTemplate.name,
        code: previewTemplate.code,
        template_code: previewTemplate.code,
        template_id: previewTemplate.id,
        content: TEMPLATE_PREVIEW_CONTENT,
        template_content: TEMPLATE_PREVIEW_CONTENT,
        config: previewTemplate.config,
    };
};
