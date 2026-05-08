import * as Response from '~/utils/HttpsRequest';

export const getAllTemplate = async ({
    limit = 8,
    page = 1,
    from,
    to,
    range,
    search = '',
    sort_by = 'updatedAt',
    sort_order = 'DESC',
} = {}) => {
    let queryUrl = `limit=${limit}&page=${page}&sort_by=${sort_by}&sort_order=${sort_order}`;
    if (search.trim()) {
        queryUrl += `&search=${encodeURIComponent(search.trim())}`;
    }
    if (!from && !to && !range) {
        queryUrl += `&range=7d`;
    } else if (from && to && !range) {
        queryUrl += `&from=${from}&to=${to}`;
    } else if (range && !from && !to) {
        queryUrl += `&range=${range}`;
    }
    try {
        const res = await Response.GET(`admin/cv-templates?${queryUrl}`);
        // const res = response;
        return res.data;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};

const template = {
    success: true,
    messsage: 'Lấy mẫu cv thành công',
    data: {
        id: '29713ded-64c6-4af0-b11a-1323f3a51eb3',
        code: 'CV_DEVELOPER_SIDEBAR_BLUE_01',
        name: 'Mẫu CV Developer Sidebar Blue',
        preview_url:
            'https://res.cloudinary.com/djzsbcrk9/image/upload/v1775665562/cvproai/lbglt6pqbmazd9thj3jf.webp',
        is_premium: false,
        config: {
            theme: {
                colors: {
                    icon: '#2E70B8',
                    text: '#2E70B8',
                    muted: '#6B9BCD',
                    accent: '#DDEEFF',
                    border: '#EAF0F6',
                    primary: '#2E70B8',
                    surface: '#FAFAFA',
                    secondary: '#EAF5FF',
                    background: '#FFFFFF',
                },
                prefix: '//',
                spacing: {
                    itemGap: 12,
                    bulletGap: 6,
                    sectionGap: 18,
                    pagePaddingX: 0,
                    pagePaddingY: 0,
                },
                fontSize: {
                    body: 14,
                    name: 24,
                    small: 13,
                    headline: 13,
                    sectionTitle: 20,
                },
                fontFamily: 'Inter',
            },
            zones: {
                left: ['profile', 'contact', 'skills', 'additional'],
                main: ['summary', 'education', 'experience'],
            },
            layout: {
                key: 'sidebar_blue_developer',
                body: {
                    layout: 'SPLIT',
                    columns: [
                        {
                            id: 'left',
                            style: {
                                padding: '22px 20px 32px 20px',
                                background: '#F4FAFF',
                            },
                            width: 34,
                        },
                        {
                            id: 'main',
                            style: {
                                padding: '28px 28px 36px 28px',
                                background: '#FFFFFF',
                            },
                            width: 66,
                        },
                    ],
                },
                page: {
                    size: 'A4',
                    margin: {
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    },
                },
            },
            version: 2,
            sections: {
                skills: {
                    type: 'SKILLS',
                    style: {
                        title: {
                            color: '#2E70B8',
                            margin: '0 0 14px 0',
                            fontSize: 18,
                            fontWeight: 800,
                        },
                        content: {
                            color: '#2E70B8',
                            fontSize: 13,
                            lineHeight: 1.8,
                        },
                        container: {
                            margin: '0 0 28px 0',
                        },
                    },
                    title: 'Các Kỹ Năng',
                    fields: [
                        {
                            key: 'name',
                            type: 'FIELD',
                        },
                        {
                            key: 'description',
                            type: 'FIELD',
                        },
                    ],
                    options: {
                        card: {
                            shadow: 'none',
                            enabled: true,
                            padding: '18px 20px',
                            background: '#FFFFFF',
                            borderRadius: 12,
                        },
                        skill: {
                            display: 'CARD_TEXT',
                            showLevel: false,
                            showDescription: true,
                        },
                    },
                    variant: 'skills_card_text',
                    visible: true,
                },
                contact: {
                    type: 'CONTACT',
                    style: {
                        title: {
                            color: '#2E70B8',
                            margin: '0 0 14px 0',
                            fontSize: 18,
                            fontWeight: 800,
                        },
                        content: {
                            color: '#2E70B8',
                            fontSize: 13,
                            lineHeight: 1.8,
                        },
                        container: {
                            margin: '0 0 34px 0',
                        },
                    },
                    title: 'Thông Tin Liên Hệ',
                    fields: [
                        {
                            key: 'birth_date',
                            icon: 'calendar',
                            type: 'FIELD',
                            format: 'date',
                            hideWhenEmpty: true,
                        },
                        {
                            key: 'email',
                            icon: 'mail',
                            type: 'FIELD',
                            format: 'email',
                            hideWhenEmpty: true,
                        },
                        {
                            key: 'website',
                            icon: 'globe',
                            type: 'FIELD',
                            format: 'url',
                            hideWhenEmpty: true,
                        },
                        {
                            key: 'phone',
                            icon: 'phone',
                            type: 'FIELD',
                            format: 'phone',
                            hideWhenEmpty: true,
                        },
                        {
                            key: 'address',
                            icon: 'home',
                            type: 'FIELD',
                            hideWhenEmpty: true,
                        },
                    ],
                    variant: 'contact_icon_list',
                    visible: true,
                },
                profile: {
                    type: 'profile_header',
                    style: {
                        title: {
                            color: '#2E70B8',
                            fontSize: 24,
                            fontWeight: 800,
                        },
                        content: {
                            color: '#2E70B8',
                            fontSize: 14,
                            lineHeight: 1.4,
                        },
                        container: {
                            margin: '0 0 34px 0',
                        },
                    },
                    title: '',
                    fields: [
                        {
                            gap: 16,
                            type: 'GROUP',
                            items: [
                                {
                                    key: 'avatar_url',
                                    type: 'FIELD',
                                },
                                {
                                    key: 'headline',
                                    type: 'FIELD',
                                },
                                {
                                    key: 'full_name',
                                    type: 'FIELD',
                                },
                            ],
                            layout: 'STACK',
                        },
                    ],
                    options: {
                        card: {
                            enabled: false,
                        },
                        avatar: {
                            shape: 'rounded',
                            width: 170,
                            height: 170,
                            position: 'top',
                            objectFit: 'cover',
                        },
                    },
                    variant: 'profile_sidebar_avatar_top',
                    visible: true,
                },
                summary: {
                    type: 'SUMMARY',
                    style: {
                        title: {
                            color: '#2E70B8',
                            margin: '0 0 14px 0',
                            fontSize: 20,
                            fontWeight: 800,
                        },
                        content: {
                            color: '#2E70B8',
                            fontSize: 14,
                            lineHeight: 1.8,
                        },
                        container: {
                            margin: '0 0 18px 0',
                        },
                    },
                    title: 'Mục Tiêu Nghề Nghiệp',
                    fields: [
                        {
                            key: 'summary',
                            type: 'FIELD',
                        },
                    ],
                    options: {
                        card: {
                            shadow: 'none',
                            enabled: true,
                            padding: '18px 22px',
                            background: '#FAFAFA',
                            borderRadius: 12,
                        },
                    },
                    variant: 'card_content',
                    visible: true,
                },
                education: {
                    type: 'EDUCATION',
                    style: {
                        title: {
                            color: '#2E70B8',
                            margin: '0 0 14px 0',
                            fontSize: 20,
                            fontWeight: 800,
                        },
                        content: {
                            color: '#2E70B8',
                            fontSize: 14,
                            lineHeight: 1.8,
                        },
                        container: {
                            margin: '0 0 18px 0',
                        },
                    },
                    title: 'Học Vấn',
                    fields: [
                        {
                            gap: 14,
                            type: 'GROUP',
                            items: [
                                {
                                    gap: 12,
                                    type: 'GROUP',
                                    items: [
                                        {
                                            key: 'degree',
                                            type: 'FIELD',
                                        },
                                        {
                                            key: 'school',
                                            type: 'FIELD',
                                        },
                                        {
                                            key: 'description',
                                            type: 'FIELD',
                                        },
                                    ],
                                    layout: 'STACK',
                                },
                                {
                                    type: 'GROUP',
                                    items: [
                                        {
                                            key: 'start_date',
                                            type: 'FIELD',
                                            format: 'date',
                                        },
                                        {
                                            key: 'end_date',
                                            type: 'FIELD',
                                            format: 'date',
                                        },
                                    ],
                                    layout: 'INLINE',
                                    separator: ' - ',
                                },
                            ],
                            ratio: [70, 30],
                            layout: 'SPLIT',
                        },
                    ],
                    options: {
                        card: {
                            shadow: 'none',
                            enabled: true,
                            padding: '22px 20px',
                            background: '#FAFAFA',
                            borderRadius: 12,
                        },
                        date: {
                            format: 'date',
                            position: 'badge',
                            separator: ' - ',
                            currentText: 'Hiện Tại',
                        },
                    },
                    variant: 'date_badge_card',
                    visible: true,
                },
                additional: {
                    type: 'ADDITIONAL',
                    style: {
                        title: {
                            color: '#2E70B8',
                            margin: '0 0 14px 0',
                            fontSize: 18,
                            fontWeight: 800,
                        },
                        content: {
                            color: '#2E70B8',
                            fontSize: 13,
                            lineHeight: 1.8,
                        },
                        container: {
                            margin: '0 0 28px 0',
                        },
                    },
                    title: 'Thông Tin Thêm',
                    fields: [
                        {
                            key: 'description',
                            type: 'FIELD',
                        },
                    ],
                    options: {
                        card: {
                            shadow: 'none',
                            enabled: true,
                            padding: '18px 20px',
                            background: '#FFFFFF',
                            borderRadius: 12,
                        },
                    },
                    variant: 'card_content',
                    visible: true,
                },
                experience: {
                    type: 'EXPERIENCE',
                    style: {
                        title: {
                            color: '#2E70B8',
                            margin: '0 0 14px 0',
                            fontSize: 20,
                            fontWeight: 800,
                        },
                        content: {
                            color: '#2E70B8',
                            fontSize: 14,
                            lineHeight: 1.8,
                        },
                        container: {
                            margin: '0 0 18px 0',
                        },
                    },
                    title: 'Kinh Nghiệm Làm Việc',
                    fields: [
                        {
                            gap: 14,
                            type: 'GROUP',
                            items: [
                                {
                                    gap: 12,
                                    type: 'GROUP',
                                    items: [
                                        {
                                            key: 'company',
                                            type: 'FIELD',
                                        },
                                        {
                                            key: 'role',
                                            type: 'FIELD',
                                        },
                                        {
                                            key: 'description',
                                            type: 'FIELD',
                                        },
                                    ],
                                    layout: 'STACK',
                                },
                                {
                                    type: 'GROUP',
                                    items: [
                                        {
                                            key: 'start_date',
                                            type: 'FIELD',
                                            format: 'date',
                                        },
                                        {
                                            key: 'end_date',
                                            type: 'FIELD',
                                            format: 'date',
                                        },
                                    ],
                                    layout: 'INLINE',
                                    separator: ' - ',
                                },
                            ],
                            ratio: [70, 30],
                            layout: 'SPLIT',
                        },
                    ],
                    options: {
                        card: {
                            shadow: 'none',
                            enabled: true,
                            padding: '22px 20px',
                            background: '#FAFAFA',
                            borderRadius: 12,
                        },
                        date: {
                            format: 'date',
                            position: 'badge',
                            separator: ' - ',
                            currentText: 'Hiện Tại',
                        },
                    },
                    variant: 'date_badge_card',
                    visible: true,
                },
            },
            rendererVersion: 1,
        },
        is_active: true,
        createdAt: '2026-04-08T03:42:24.278Z',
        updatedAt: '2026-05-05T15:12:21.289Z',
        used_count: 4,
    },
    date: '19:17:46 7/5/2026',
    path: '/api/v1/admin/cv-templates/code/CV_DEVELOPER_SIDEBAR_BLUE_01',
};
export const getTemplateByCode = async (code) => {
    try {
        // const res = await Response.GET(`cv-templates/code/${code}`);
        const res = {
            ...template,
            path: `/api/v1/admin/cv-templates/code/${code}`,
        };
        return res;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};
