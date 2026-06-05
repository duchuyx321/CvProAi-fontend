import images from '~/assets';

export const defaultMockContent = {
    profile_header: {
        full_name: 'Nhập Tên Của Bạn',
        headline: 'Nhập Chức Danh Của Bạn',
        avatar_url: images.NoImage,
        summary: 'Nhập Mục Tiêu Nghề Nghiệp',
    },

    CONTACT: {
        email: 'Nhập emal',
        phone: 'Nhập Số Điện Thoại',
        address: 'Nhập Địa Chỉ',
        website: 'Nhập Link Trang Web',
    },

    SKILLS: [{ name: 'Nhập Kỹ Năng', level: 85 }],

    EXPERIENCE: [
        {
            company: 'CVProAI',
            role: 'Backend Developer Intern',
            start_date: '01/2025',
            end_date: 'Hiện tại',
            description:
                'Xây dựng hệ thống CV động, API cho template, preview và export PDF.',
            achievements: [
                'Thiết kế schema config-driven cho CV',
                'Đồng bộ editor trái và preview phải realtime',
                'Tổ chức layout theo STACK / SPLIT / BANNER_SPLIT',
            ],
        },
    ],

    EDUCATION: [
        {
            school: 'Trường Đại Học',
            degree: 'Khoa',
            start_date: '2022',
            end_date: '2026',
            description:
                'Tập trung Web Development, Database, Software Engineering.',
        },
    ],

    PROJECTS: [
        {
            name: 'CVProAI',
            tech_stack: 'ReactJS, SCSS, Node.js, Express, MySQL',
            description:
                'Website tạo CV động với nhiều template, custom content, theme, layout.',
            link: '',
        },
    ],
};

export const mockContentByTemplateCode = {
    DEV_01: {
        ...defaultMockContent,
    },
    CV_MODERN_01: {
        ...defaultMockContent,
        profile_header: {
            ...defaultMockContent.profile_header,
            full_name: 'Nhập Tên Của Bạn',
            headline: 'Nhập Chức Danh Của Bạn',
        },
    },
    CV_MODERN_02: {
        ...defaultMockContent,
        profile_header: {
            ...defaultMockContent.profile_header,
            full_name: 'Nhập Tên Của Bạn',
            headline: 'Nhập Chức Danh Của Bạn',
        },
    },
};

export function getMockContent(templateCode) {
    return mockContentByTemplateCode[templateCode] || defaultMockContent;
}
