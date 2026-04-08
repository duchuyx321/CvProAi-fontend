export const STACK_TEMPLATE_CONFIG = {
    version: 1,
    layout_key: 'stack',
    layout: {
        key: 'stack',
        page: {
            size: 'A4',
            margin: {
                top: 28,
                right: 28,
                bottom: 28,
                left: 28,
            },
        },
        body: {
            type: 'stack',
            gap: 24,
            columns: [
                {
                    id: 'main',
                    width_percent: 100,
                    zones: [
                        'profile_header',
                        'contact',
                        'summary',
                        'skills',
                        'education',
                        'experience',
                    ],
                },
            ],
        },
    },
    sections: {
        profile_header: {
            type: 'profile_header',
            title: '',
            variant: 'stacked_center',
            fields: ['avatar_url', 'full_name', 'headline'],
            styles: {
                avatar_shape: 'circle',
                headline_style: 'text_plain',
                name_style: 'uppercase_bold',
            },
        },
        contact: {
            type: 'contact',
            title: 'Thông Tin Liên Hệ',
            variant: 'inline_list',
        },
        summary: {
            type: 'summary',
            title: 'Mục Tiêu Nghề Nghiệp',
            variant: 'paragraph',
        },
        skills: {
            type: 'skills',
            title: 'Kỹ Năng',
            variant: 'tag_list',
        },
        education: {
            type: 'education',
            title: 'Học Vấn',
            variant: 'timeline_simple',
        },
        experience: {
            type: 'experience',
            title: 'Kinh Nghiệm Làm Việc',
            variant: 'timeline_simple',
        },
    },
    theme: {
        colors: {
            primary: '#0f172a',
            accent: '#2563eb',
            text_main: '#334155',
            bg_soft: '#eff6ff',
            bg_card: '#ffffff',
        },
        typography: {
            font_family: 'Inter',
            section_title: {
                prefix: '',
                color: '#0f172a',
                font_size: 20,
                font_weight: 700,
            },
        },
        spacing: {
            section_gap: 24,
            item_gap: 14,
        },
    },
};

export const SPLIT_TEMPLATE_CONFIG = {
    version: 1,
    layout_key: 'split',
    layout: {
        key: 'split',
        page: {
            size: 'A4',
            margin: {
                top: 24,
                right: 24,
                bottom: 24,
                left: 24,
            },
        },
        body: {
            type: 'split',
            gap: 24,
            columns: [
                {
                    id: 'left',
                    width_percent: 34,
                    zones: ['profile_header', 'contact', 'skills'],
                },
                {
                    id: 'right',
                    width_percent: 66,
                    zones: ['summary', 'education', 'experience'],
                },
            ],
        },
    },
    sections: {
        profile_header: {
            type: 'profile_header',
            title: '',
            variant: 'stacked_left',
            fields: ['avatar_url', 'headline', 'full_name'],
            styles: {
                avatar_shape: 'rounded_rect',
                headline_style: 'pill_badge',
                name_style: 'uppercase_bold',
            },
        },
        contact: {
            type: 'contact',
            title: 'Thông Tin Liên Hệ',
            variant: 'icon_box_list',
        },
        skills: {
            type: 'skills',
            title: 'Các Kỹ Năng',
            variant: 'bullet_list',
        },
        summary: {
            type: 'summary',
            title: 'Mục Tiêu Nghề Nghiệp',
            variant: 'paragraph',
        },
        education: {
            type: 'education',
            title: 'Học Vấn',
            variant: 'card_with_date_badge',
        },
        experience: {
            type: 'experience',
            title: 'Kinh Nghiệm Làm Việc',
            variant: 'card_timeline_right_badge',
        },
    },
    theme: {
        colors: {
            primary: '#1e3a8a',
            accent: '#3b82f6',
            text_main: '#1f2937',
            bg_soft: '#eff6ff',
            bg_card: '#f8fafc',
        },
        typography: {
            font_family: 'Inter',
            section_title: {
                prefix: '// ',
                color: '#1e3a8a',
                font_size: 18,
                font_weight: 700,
            },
        },
        spacing: {
            section_gap: 24,
            item_gap: 12,
        },
    },
};

export const BANNER_SPLIT_TEMPLATE_CONFIG = {
    version: 1,
    layout_key: 'banner_split',
    layout: {
        key: 'banner_split',
        page: {
            size: 'A4',
            margin: {
                top: 0,
                right: 24,
                bottom: 24,
                left: 24,
            },
        },
        body: {
            type: 'banner_split',
            gap: 24,
            columns: [
                {
                    id: 'header',
                    width_percent: 100,
                    zones: ['profile_header', 'contact'],
                },
                {
                    id: 'left',
                    width_percent: 38,
                    zones: ['skills'],
                },
                {
                    id: 'right',
                    width_percent: 62,
                    zones: ['summary', 'education', 'experience'],
                },
            ],
        },
    },
    sections: {
        profile_header: {
            type: 'profile_header',
            title: '',
            variant: 'banner_left_avatar', fields: ['avatar_url', 'full_name', 'headline'],
            styles: {
                avatar_shape: 'circle',
                headline_style: 'text_light',
                name_style: 'uppercase_bold',
            },
        },
        contact: {
            type: 'contact',
            title: 'Liên Hệ',
            variant: 'banner_inline_list',
        },
        skills: {
            type: 'skills',
            title: 'Kỹ Năng',
            variant: 'progress_list',
        },
        summary: {
            type: 'summary',
            title: 'Giới Thiệu',
            variant: 'paragraph',
        },
        education: {
            type: 'education',
            title: 'Học Vấn',
            variant: 'card_with_left_border',
        },
        experience: {
            type: 'experience',
            title: 'Kinh Nghiệm',
            variant: 'card_timeline_right_badge',
        },
    },
    theme: {
        colors: {
            primary: '#ffffff',
            accent: '#0ea5e9',
            text_main: '#1f2937',
            bg_soft: '#e0f2fe',
            bg_card: '#f8fafc',
            banner_bg: '#0f172a',
        },
        typography: {
            font_family: 'Inter',
            section_title: {
                prefix: '• ',
                color: '#0f172a',
                font_size: 18,
                font_weight: 700,
            },
        },
        spacing: {
            section_gap: 24,
            item_gap: 12,
        },
    },
};

export const TEMPLATE_DATA = [
    {
        id: 'template_stack_01',
        name: 'CV Tối Giản',
        category: 'Đơn giản',
        layout_key: 'stack',
        thumbnail:
            'https://via.placeholder.com/300x420.png?text=Stack+Template',
        is_new: false,
        description: 'Mẫu CV dạng dọc, gọn gàng, dễ đọc và phù hợp nhiều ngành nghề.',
        template_config: STACK_TEMPLATE_CONFIG,
        sample_data: {
            avatar_url: '',
            headline: 'Frontend Developer',
            full_name: 'Trần Thị B',
            email: 'ttb@example.com',
            phone: '0912345678',
            address: 'Hà Nội',
            website: 'portfolio-tranthib.dev',
            summary:
                'Frontend Developer yêu thích xây dựng giao diện hiện đại, tối ưu trải nghiệm người dùng và hiệu năng.',
            skills: ['ReactJS', 'Sass', 'JavaScript', 'Figma'],
            education: [
                {
                    school: 'Đại học Kinh tế Quốc dân',
                    major: 'Hệ thống thông tin quản lý',
                    time: '2015 - 2019',
                    description: 'Tốt nghiệp loại Khá.',
                },
            ],
            experience: [
                {
                    company: 'StartUp ABC',
                    position: 'Frontend Developer',
                    time: '03/2020 - Hiện tại', description: [
                        'Phát triển giao diện người dùng cho hệ thống quản lý bán hàng.',
                        'Tối ưu trải nghiệm người dùng trên mobile.',
                    ],
                },
            ],
        },
    },
    {
        id: 'template_split_01',
        name: 'CV Chuyên Nghiệp',
        category: 'Chuyên nghiệp',
        layout_key: 'split',
        thumbnail:
            'https://via.placeholder.com/300x420.png?text=Split+Template',
        is_new: true,
        description: 'Mẫu CV chia cột rõ ràng, phù hợp ứng tuyển công ty lớn.',
        template_config: SPLIT_TEMPLATE_CONFIG,
        sample_data: {
            avatar_url: '',
            headline: 'Senior Frontend Developer',
            full_name: 'Nguyễn Văn A',
            email: 'anv@example.com',
            phone: '0901234567',
            address: 'Quận 1, TP. Hồ Chí Minh',
            website: 'nguyenvana.dev',
            summary:
                'Với hơn 5 năm kinh nghiệm phát triển ứng dụng web, tôi mong muốn xây dựng các sản phẩm có hiệu năng tốt và trải nghiệm người dùng mượt mà.',
            skills: ['ReactJS', 'TypeScript', 'NodeJS', 'Sass'],
            education: [{
                school: 'Đại học Bách Khoa',
                major: 'Kỹ thuật Phần mềm',
                time: '2014 - 2018',
                description: 'Tốt nghiệp loại Giỏi.',
            },
            ],
            experience: [
                {
                    company: 'Công ty Công nghệ XYZ',
                    position: 'Senior Frontend Developer',
                    time: '01/2021 - Hiện tại',
                    description: [
                        'Dẫn dắt đội ngũ 5 người phát triển nền tảng E-commerce.',
                        'Cải thiện hiệu năng tải trang 40%.',
                    ],
                },
            ],
        },
    },
    {
        id: 'template_banner_split_01',
        name: 'CV Hiện Đại',
        category: 'Hiện đại',
        layout_key: 'banner_split',
        thumbnail:
            'https://via.placeholder.com/300x420.png?text=Banner+Split+Template',
        is_new: true,
        description: 'Mẫu CV nổi bật với phần banner hiện đại và nhận diện cá nhân mạnh.',
        template_config: BANNER_SPLIT_TEMPLATE_CONFIG,
        sample_data: {
            avatar_url: '',
            headline: 'UI/UX Designer',
            full_name: 'Lê Minh C',
            email: 'lmc@example.com',
            phone: '0987654321',
            address: 'Đà Nẵng',
            website: 'behance.net/leminhc',
            summary:
                'UI/UX Designer tập trung vào trải nghiệm người dùng và thiết kế sản phẩm số hiện đại.',
            skills: ['Figma', 'Adobe XD', 'UI Design', 'UX Research'],
            education: [
                {
                    school: 'Đại học Duy Tân',
                    major: 'Thiết kế Đồ họa',
                    time: '2016 - 2020',
                    description: 'Tốt nghiệp loại Giỏi.',
                },
            ],
            experience: [
                {
                    company: 'Creative Studio',
                    position: 'UI/UX Designer',
                    time: '07/2020 - Hiện tại',
                    description: [
                        'Thiết kế giao diện mobile app và website cho khách hàng quốc tế.',
                        'Phối hợp với team dev để đảm bảo tính khả thi khi triển khai UI.',
                    ],
                },
            ],
        },
    },
];

export const CV_TEMPLATE_LIST_MOCK = {
    success: true,
    message: 'Lấy danh sách mẫu CV thành công',
    data: TEMPLATE_DATA.map((item) => ({
        id: item.id,
        name: item.name,
        category: item.category,
        layout_key: item.layout_key,
        thumbnail: item.thumbnail,
        is_new: item.is_new,
        description: item.description,
    })),
};

export const CV_TEMPLATE_DETAIL_MOCK = {
    success: true, message: 'Lấy chi tiết mẫu CV thành công',
    data: TEMPLATE_DATA,
};