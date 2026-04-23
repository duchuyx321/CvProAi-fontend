import { MOCK_TEMPLATE_DETAIL } from '~/pages/User/CvTemplateDetail/CvTemplateDetail';
import * as Response from '~/utils/HttpsRequest';

export const getCvTemplates = async (limit = 8, page = 1) => {
    try {
        const result = await Response.GET(
            `cv-templates?limit=${limit}&page=${page}`,
        );
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getCvTemplateDetail = async (code) => {
    if (!code) {
        throw new Error('Thiếu code template');
    }

    try {
        // const result = await Response.GET(`cv-templates/code/${code}`);
        const result = MOCK_TEMPLATE_DETAIL;
        if (!result?.success) {
            return {
                success: false,
                message: 'Không tìm thấy mẫu CV',
                data: null,
            };
        }

        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getCvDetailBySlug = async (slug) => {
    if (!slug) {
        throw new Error('Thiếu slug CV');
    }

    try {
        // const result = await Response.GET(`cvs/slug/${slug}`);
        const result = {
            success: true,
            messsage: 'Lấy dữ liệu CV thành công.',
            data: {
                id: '8d416d05-abab-4fed-a868-249e994bec4d',
                user_id: 'c0ca274b-2722-4755-99bb-9e249b3d3dce',
                template_id: '29713ded-64c6-4af0-b11a-1323f3a51eb3',
                title: 'CV Backend Developer Intern - Lê Đức Huy',
                language: 'vi',
                preview_url:
                    'http://res.cloudinary.com/djzsbcrk9/image/upload/v1775665562/cvproai/lbglt6pqbmazd9thj3jf.webp',
                status: 'DRAFT',
                visibility: 'PRIVATE',
                slug: 'cv-backend-developer-intern-le-duc-huy',
                content: {
                    profile_header: {
                        headline: '',
                        full_name: '',
                        avatar_url:
                            'http://res.cloudinary.com/djzsbcrk9/image/upload/v1775665562/cvproai/gk3gemyc8ydzzvcm4epa.jpg',
                    },
                },
                createdAt: '2026-04-08T15:40:37.727Z',
                updatedAt: '2026-04-08T17:05:23.219Z',
                config: {
                    theme: {
                        colors: {
                            accent: '#f0f4f8',
                            primary: '#1a4b8c',
                        },
                        prefix: '//',
                        spacing: {
                            itemGap: 10,
                            sectionGap: 25,
                        },
                        fontFamily: 'Inter',
                    },
                    zones: {
                        left_col: [
                            'profile_header',
                            'CONTACT',
                            'SKILLS',
                            'additional',
                        ],
                        right_col: [
                            'SUMMARY',
                            'EDUCATION',
                            'EXPERIENCE',
                            'ADDITIONAL_INFO',
                        ],
                    },
                    layout: {
                        key: 'dev_2_style',
                        body: {
                            layout: 'SPLIT',
                            columns: [
                                {
                                    id: 'left_col',
                                    width: 35,
                                },
                                {
                                    id: 'right_col',
                                    width: 65,
                                },
                            ],
                        },
                        page: {
                            size: 'A4',
                            margin: {
                                top: 24,
                                left: 24,
                                right: 24,
                                bottom: 24,
                            },
                        },
                    },
                    version: 1,
                    sections: {
                        skills: {
                            type: 'SKILLS',
                            title: 'Các Kỹ Năng',
                            fields: ['name', 'description'],
                            variant: 'sidebar_box_richtext',
                        },
                        contact: {
                            type: 'CONTACT',
                            title: 'Thông Tin Liên Hệ',
                            fields: [
                                'birth_date',
                                'email',
                                'website',
                                'phone',
                                'address',
                            ],
                            variant: 'icon_list',
                        },
                        profile: {
                            type: 'profile_header',
                            title: '',
                            fields: ['avatar_url', 'headline', 'full_name'],
                            variant: 'sidebar_avatar_badge_name',
                        },
                        summary: {
                            type: 'SUMMARY',
                            title: 'Mục Tiêu Nghề Nghiệp',
                            fields: ['SUMMARY'],
                            variant: 'content_box_richtext',
                        },
                        education: {
                            type: 'EDUCATION',
                            title: 'Học Vấn',
                            fields: [
                                {
                                    items: [
                                        {
                                            items: [
                                                'degree',
                                                'school',
                                                'description',
                                            ],
                                            layout: 'STACK',
                                        },
                                        {
                                            items: [
                                                'start_date',
                                                'end_date',
                                                'is_current',
                                            ],
                                            layout: 'STACK',
                                        },
                                    ],
                                    layout: 'SPLIT',
                                },
                            ],
                            variant: 'card_right_date_badge',
                        },
                        additional: {
                            type: 'ADDITIONAL',
                            title: 'Thông Tin Thêm',
                            fields: ['content'],
                            variant: 'sidebar_box_richtext',
                        },
                        experience: {
                            type: 'EXPERIENCE',
                            title: 'Kinh Nghiệm Làm Việc',
                            fields: [
                                {
                                    items: [
                                        {
                                            items: [
                                                'role',
                                                'company',
                                                'description',
                                            ],
                                            layout: 'STACK',
                                        },
                                        {
                                            items: [
                                                'start_date',
                                                'end_date',
                                                'is_current',
                                            ],
                                            layout: 'STACK',
                                        },
                                    ],
                                    layout: 'SPLIT',
                                },
                            ],
                            variant: 'card_right_date_badge',
                        },
                    },
                },
            },
            date: '13:40:45 23/4/2026',
            path: '/api/v1/cvs/me/cv-backend-developer-intern-le-duc-huy',
        };
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const createCv = async (data) => {
    try {
        const result = await Response.POST('cvs', data);
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const updateCvBySlug = async (slug, data) => {
    if (!slug) {
        throw new Error('Thiếu slug CV');
    }

    try {
        const result = await Response.PUT(`cvs/slug/${slug}`, data);
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
export const downloadCvPdfBySlug = async (slug) => {
    if (!slug) {
        throw new Error('Thiếu slug CV');
    }

    try {
        const result = await Response.GET(`cvs/slug/${slug}/pdf`);
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
