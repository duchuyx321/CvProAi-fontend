import * as Response from '~/utils/HttpsRequest';

const MAU_01 = {
    success: true,
    messsage: 'Lấy dữ liệu CV thành công.',
    data: {
        id: '17cc03f6-fa48-4b14-b582-d58eefa8dd50',
        code: 'CV_MODERN_02',
        name: 'Mẫu CV chuyên nghiệp 02',
        is_premium: false,
        preview_url: '',
        config: {
            version: 2,
            rendererVersion: 1,
            layout: {
                key: 'stack_classic_audit',
                page: {
                    size: 'A4',
                    margin: {
                        top: 4,
                        right: 4,
                        bottom: 4,
                        left: 4,
                    },
                },
                body: {
                    layout: 'STACK',
                    columns: [
                        {
                            id: 'main',
                            width: 100,
                            style: {
                                background: '#FFFFFF',
                            },
                        },
                    ],
                },
            },
            zones: {
                main: [
                    'profile',
                    'summary',
                    'education',
                    'activities',
                    'experience',
                    'skills',
                ],
            },
            sections: {
                profile: {
                    type: 'profile_header',
                    title: '',
                    variant: 'profile_top_avatar_left_contact_inline',
                    fields: [
                        {
                            type: 'GROUP',
                            layout: 'SPLIT',
                            ratio: [22, 78],
                            gap: 28,
                            items: [
                                {
                                    type: 'FIELD',
                                    key: 'avatar_url',
                                },
                                {
                                    type: 'GROUP',
                                    layout: 'STACK',
                                    gap: 8,
                                    items: [
                                        {
                                            type: 'FIELD',
                                            key: 'full_name',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'headline',
                                        },
                                        {
                                            type: 'GROUP',
                                            layout: 'GRID',
                                            columns: 3,
                                            gap: 24,
                                            items: [
                                                {
                                                    type: 'FIELD',
                                                    key: 'birth_date',
                                                    icon: 'calendar',
                                                    format: 'date',
                                                    hideWhenEmpty: true,
                                                },
                                                {
                                                    type: 'FIELD',
                                                    key: 'phone',
                                                    icon: 'phone',
                                                    format: 'phone',
                                                    hideWhenEmpty: true,
                                                },
                                                {
                                                    type: 'FIELD',
                                                    key: 'email',
                                                    icon: 'mail',
                                                    format: 'email',
                                                    hideWhenEmpty: true,
                                                },
                                            ],
                                        },
                                        {
                                            type: 'GROUP',
                                            layout: 'GRID',
                                            columns: 3,
                                            gap: 24,
                                            items: [
                                                {
                                                    type: 'FIELD',
                                                    key: 'gender',
                                                    icon: 'user',
                                                    hideWhenEmpty: true,
                                                },
                                                {
                                                    type: 'FIELD',
                                                    key: 'address',
                                                    icon: 'location',
                                                    hideWhenEmpty: true,
                                                },
                                                {
                                                    type: 'FIELD',
                                                    key: 'website',
                                                    icon: 'link',
                                                    format: 'url',
                                                    hideWhenEmpty: true,
                                                },
                                            ],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    options: {
                        avatar: {
                            width: 148,
                            height: 148,
                            shape: 'circle',
                            position: 'left',
                            objectFit: 'cover',
                        },
                        grid: {
                            columns: 3,
                            columnGap: 34,
                            rowGap: 12,
                        },
                    },
                    style: {
                        container: {
                            padding: '42px 58px 36px 58px',
                        },
                        title: {
                            fontSize: 38,
                            fontWeight: 800,
                            lineHeight: 1.1,
                            color: '#24384D',
                        },
                        content: {
                            color: '#24384D',
                        },
                    },
                    visible: true,
                },
                summary: {
                    type: 'SUMMARY',
                    title: 'MỤC TIÊU NGHỀ NGHIỆP',
                    variant: 'fullwidth_title_bar_richtext',
                    fields: [
                        {
                            type: 'FIELD',
                            key: 'summary',
                        },
                    ],
                    options: {
                        titleBar: {
                            visible: true,
                            background: '#F2F2F2',
                            height: 52,
                            align: 'center',
                            uppercase: true,
                            letterSpacing: 1.2,
                        },
                    },
                    style: {
                        title: {
                            fontSize: 25,
                            fontWeight: 800,
                            color: '#24384D',
                            textAlign: 'center',
                        },
                        content: {
                            padding: '22px 58px 28px 58px',
                            fontSize: 17,
                            lineHeight: 1.45,
                            color: '#24384D',
                        },
                    },
                    visible: true,
                },
                education: {
                    type: 'EDUCATION',
                    title: 'HỌC VẤN',
                    variant: 'left_date_right_content',
                    fields: [
                        {
                            type: 'GROUP',
                            layout: 'SPLIT',
                            ratio: [22, 78],
                            gap: 28,
                            items: [
                                {
                                    type: 'GROUP',
                                    layout: 'INLINE',
                                    separator: ' - ',
                                    items: [
                                        {
                                            type: 'FIELD',
                                            key: 'start_date',
                                            format: 'year',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'end_date',
                                            format: 'year',
                                        },
                                    ],
                                },
                                {
                                    type: 'GROUP',
                                    layout: 'STACK',
                                    gap: 6,
                                    items: [
                                        {
                                            type: 'FIELD',
                                            key: 'school',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'degree',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'description',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    options: {
                        titleBar: {
                            visible: true,
                            background: '#F2F2F2',
                            height: 52,
                            align: 'center',
                            uppercase: true,
                            letterSpacing: 1.2,
                        },
                        date: {
                            position: 'left',
                            format: 'year',
                            separator: ' - ',
                        },
                    },
                    style: {
                        title: {
                            fontSize: 25,
                            fontWeight: 800,
                            color: '#24384D',
                            textAlign: 'center',
                        },
                        content: {
                            padding: '24px 58px 28px 58px',
                            fontSize: 17,
                            lineHeight: 1.45,
                            color: '#24384D',
                        },
                    },
                    visible: true,
                },
                activities: {
                    type: 'ACTIVITIES',
                    title: 'HOẠT ĐỘNG',
                    variant: 'left_date_right_content',
                    fields: [
                        {
                            type: 'GROUP',
                            layout: 'SPLIT',
                            ratio: [22, 78],
                            gap: 28,
                            items: [
                                {
                                    type: 'GROUP',
                                    layout: 'INLINE',
                                    separator: ' - ',
                                    items: [
                                        {
                                            type: 'FIELD',
                                            key: 'start_date',
                                            format: 'year',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'end_date',
                                            format: 'year',
                                        },
                                    ],
                                },
                                {
                                    type: 'GROUP',
                                    layout: 'STACK',
                                    gap: 6,
                                    items: [
                                        {
                                            type: 'GROUP',
                                            layout: 'INLINE',
                                            separator: ' | ',
                                            items: [
                                                {
                                                    type: 'FIELD',
                                                    key: 'organization',
                                                },
                                                {
                                                    type: 'FIELD',
                                                    key: 'role',
                                                },
                                            ],
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'description',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    options: {
                        titleBar: {
                            visible: true,
                            background: '#F2F2F2',
                            height: 52,
                            align: 'center',
                            uppercase: true,
                            letterSpacing: 1.2,
                        },
                        date: {
                            position: 'left',
                            format: 'year',
                            separator: ' - ',
                        },
                    },
                    style: {
                        title: {
                            fontSize: 25,
                            fontWeight: 800,
                            color: '#24384D',
                            textAlign: 'center',
                        },
                        content: {
                            padding: '24px 58px 28px 58px',
                            fontSize: 17,
                            lineHeight: 1.45,
                            color: '#24384D',
                        },
                    },
                    visible: true,
                },
                experience: {
                    type: 'EXPERIENCE',
                    title: 'KINH NGHIỆM LÀM VIỆC',
                    variant: 'left_date_right_content',
                    fields: [
                        {
                            type: 'GROUP',
                            layout: 'SPLIT',
                            ratio: [22, 78],
                            gap: 28,
                            items: [
                                {
                                    type: 'GROUP',
                                    layout: 'INLINE',
                                    separator: ' - ',
                                    items: [
                                        {
                                            type: 'FIELD',
                                            key: 'start_date',
                                            format: 'year',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'end_date',
                                            format: 'year',
                                        },
                                    ],
                                },
                                {
                                    type: 'GROUP',
                                    layout: 'STACK',
                                    gap: 6,
                                    items: [
                                        {
                                            type: 'GROUP',
                                            layout: 'INLINE',
                                            separator: ' | ',
                                            items: [
                                                {
                                                    type: 'FIELD',
                                                    key: 'company',
                                                },
                                                {
                                                    type: 'FIELD',
                                                    key: 'role',
                                                },
                                            ],
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'description',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    options: {
                        titleBar: {
                            visible: true,
                            background: '#F2F2F2',
                            height: 52,
                            align: 'center',
                            uppercase: true,
                            letterSpacing: 1.2,
                        },
                        date: {
                            position: 'left',
                            format: 'year',
                            separator: ' - ',
                            currentText: 'Nay',
                        },
                    },
                    style: {
                        title: {
                            fontSize: 25,
                            fontWeight: 800,
                            color: '#24384D',
                            textAlign: 'center',
                        },
                        content: {
                            padding: '24px 58px 28px 58px',
                            fontSize: 17,
                            lineHeight: 1.45,
                            color: '#24384D',
                        },
                    },
                    visible: true,
                },
                skills: {
                    type: 'SKILLS',
                    title: 'KỸ NĂNG',
                    variant: 'skills_two_column_bullets',
                    fields: [
                        {
                            type: 'FIELD',
                            key: 'name',
                        },
                    ],
                    options: {
                        titleBar: {
                            visible: true,
                            background: '#F2F2F2',
                            height: 52,
                            align: 'center',
                            uppercase: true,
                            letterSpacing: 1.2,
                        },
                        grid: {
                            columns: 2,
                            columnGap: 70,
                            rowGap: 10,
                        },
                        skill: {
                            display: 'TWO_COLUMN_BULLET',
                            showLevel: false,
                            showDescription: false,
                        },
                    },
                    style: {
                        title: {
                            fontSize: 25,
                            fontWeight: 800,
                            color: '#24384D',
                            textAlign: 'center',
                        },
                        content: {
                            padding: '22px 58px 24px 58px',
                            fontSize: 17,
                            lineHeight: 1.45,
                            color: '#24384D',
                        },
                    },
                    visible: true,
                },
            },
            theme: {
                fontFamily: 'Inter',
                colors: {
                    primary: '#24384D',
                    accent: '#F2F2F2',
                    text: '#24384D',
                    muted: '#3F4A56',
                    background: '#FFFFFF',
                    surface: '#F2F2F2',
                    border: '#E5E5E5',
                    icon: '#000000',
                },
                prefix: '',
                spacing: {
                    sectionGap: 0,
                    itemGap: 14,
                    pagePaddingX: 58,
                    pagePaddingY: 0,
                    headerPaddingTop: 42,
                    headerPaddingBottom: 36,
                    sectionTitlePaddingY: 14,
                    sectionContentPaddingTop: 22,
                    sectionContentPaddingBottom: 28,
                    bulletGap: 6,
                },
                fontSize: {
                    name: 38,
                    headline: 21,
                    sectionTitle: 25,
                    body: 17,
                    small: 16,
                },
            },
        },
        date: '13:40:45 23/4/2026',
        path: '/api/v1/cvs/me/cv-backend-developer-intern-le-duc-huy',
    },
};
const MAU_02 = {
    success: true,
    messsage: 'Lấy dữ liệu CV thành công.',
    data: {
        id: 'ed744150-dbeb-43cc-bbfc-aa16e4725687',
        code: 'CV_TRANSLATOR_BANNER_01',
        name: 'Mẫu CV phiên dịch viên chuyên nghiệp',
        is_premium: false,
        preview_url: '',
        config: {
            version: 2,
            rendererVersion: 1,
            layout: {
                key: 'banner_split_translator',
                page: {
                    size: 'A4',
                    margin: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    },
                },
                body: {
                    layout: 'BANNER_SPLIT',
                    columns: [
                        {
                            id: 'left',
                            width: 40,
                            style: {
                                padding: '34px 32px 36px 32px',
                                background: '#FFFFFF',
                            },
                        },
                        {
                            id: 'main',
                            width: 60,
                            style: {
                                padding: '34px 32px 36px 24px',
                                background: '#FFFFFF',
                            },
                        },
                    ],
                },
            },
            zones: {
                banner: ['profile'],
                left: [
                    'contact',
                    'summary',
                    'skills',
                    'awards',
                    'certificates',
                ],
                main: ['experience', 'education'],
            },
            sections: {
                profile: {
                    type: 'profile_header',
                    title: '',
                    variant: 'profile_banner_avatar_right',
                    fields: [
                        {
                            type: 'GROUP',
                            layout: 'SPLIT',
                            ratio: [68, 32],
                            items: [
                                {
                                    type: 'GROUP',
                                    layout: 'STACK',
                                    gap: 8,
                                    items: [
                                        {
                                            type: 'FIELD',
                                            key: 'full_name',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'headline',
                                        },
                                    ],
                                },
                                {
                                    type: 'FIELD',
                                    key: 'avatar_url',
                                },
                            ],
                        },
                    ],
                    options: {
                        avatar: {
                            width: 150,
                            height: 150,
                            shape: 'circle',
                            position: 'right',
                            objectFit: 'cover',
                        },
                    },
                    style: {
                        container: {
                            height: 245,
                            padding: '60px 52px 48px 52px',
                            background: '#7B5C53',
                            color: '#FFFFFF',
                        },
                        title: {
                            fontSize: 34,
                            fontWeight: 800,
                            lineHeight: 1.15,
                            color: '#000000',
                        },
                        content: {
                            fontSize: 22,
                            lineHeight: 1.35,
                            color: '#FFFFFF',
                        },
                    },
                    visible: true,
                },
                contact: {
                    type: 'CONTACT',
                    title: 'Thông tin cá nhân',
                    variant: 'contact_label_value',
                    fields: [
                        {
                            type: 'FIELD',
                            key: 'birth_date',
                            label: 'Ngày sinh',
                            format: 'date',
                            hideWhenEmpty: true,
                        },
                        {
                            type: 'FIELD',
                            key: 'gender',
                            label: 'Giới tính',
                            hideWhenEmpty: true,
                        },
                        {
                            type: 'FIELD',
                            key: 'phone',
                            label: 'Số điện thoại',
                            format: 'phone',
                            hideWhenEmpty: true,
                        },
                        {
                            type: 'FIELD',
                            key: 'email',
                            label: 'Email',
                            format: 'email',
                            hideWhenEmpty: true,
                        },
                        {
                            type: 'FIELD',
                            key: 'address',
                            label: 'Địa chỉ',
                            hideWhenEmpty: true,
                        },
                        {
                            type: 'FIELD',
                            key: 'website',
                            label: 'Website',
                            format: 'url',
                            hideWhenEmpty: true,
                        },
                    ],
                    style: {
                        container: {
                            margin: '0 0 34px 0',
                        },
                        title: {
                            fontSize: 22,
                            fontWeight: 800,
                            color: '#7B5C53',
                            margin: '0 0 14px 0',
                        },
                        content: {
                            fontSize: 17,
                            lineHeight: 1.35,
                            color: '#111111',
                        },
                    },
                    visible: true,
                },
                summary: {
                    type: 'SUMMARY',
                    title: 'Mục tiêu nghề nghiệp',
                    variant: 'text_block',
                    fields: [
                        {
                            type: 'FIELD',
                            key: 'summary',
                        },
                    ],
                    style: {
                        container: {
                            margin: '0 0 34px 0',
                        },
                        title: {
                            fontSize: 22,
                            fontWeight: 800,
                            color: '#7B5C53',
                            margin: '0 0 14px 0',
                        },
                        content: {
                            fontSize: 17,
                            lineHeight: 1.45,
                            color: '#111111',
                        },
                    },
                    visible: true,
                },
                skills: {
                    type: 'SKILLS',
                    title: 'Kỹ năng',
                    variant: 'skills_progress_bar',
                    fields: [
                        {
                            type: 'FIELD',
                            key: 'name',
                        },
                        {
                            type: 'FIELD',
                            key: 'level',
                            format: 'percent',
                        },
                    ],
                    options: {
                        skill: {
                            display: 'PROGRESS_BAR',
                            maxLevel: 100,
                            showLevel: false,
                            showDescription: false,
                        },
                    },
                    style: {
                        container: {
                            margin: '0 0 34px 0',
                        },
                        title: {
                            fontSize: 22,
                            fontWeight: 800,
                            color: '#7B5C53',
                            margin: '0 0 14px 0',
                        },
                        content: {
                            fontSize: 17,
                            lineHeight: 1.35,
                            color: '#111111',
                        },
                        item: {
                            margin: '0 0 12px 0',
                        },
                    },
                    visible: true,
                },
                awards: {
                    type: 'AWARDS',
                    title: 'Danh hiệu và giải thưởng',
                    variant: 'awards_simple',
                    fields: [
                        {
                            type: 'GROUP',
                            layout: 'SPLIT',
                            ratio: [82, 18],
                            items: [
                                {
                                    type: 'FIELD',
                                    key: 'name',
                                },
                                {
                                    type: 'FIELD',
                                    key: 'date',
                                    format: 'year',
                                },
                            ],
                        },
                        {
                            type: 'FIELD',
                            key: 'description',
                        },
                    ],
                    options: {
                        divider: {
                            visible: true,
                            color: '#D8D3D0',
                            thickness: 1,
                            margin: '12px 0 12px 0',
                        },
                    },
                    style: {
                        container: {
                            margin: '0 0 34px 0',
                        },
                        title: {
                            fontSize: 22,
                            fontWeight: 800,
                            color: '#7B5C53',
                            margin: '0 0 14px 0',
                        },
                        content: {
                            fontSize: 17,
                            lineHeight: 1.4,
                            color: '#111111',
                        },
                    },
                    visible: true,
                },
                certificates: {
                    type: 'CERTIFICATES',
                    title: 'Chứng chỉ',
                    variant: 'certificates_simple',
                    fields: [
                        {
                            type: 'FIELD',
                            key: 'name',
                        },
                        {
                            type: 'FIELD',
                            key: 'date',
                            format: 'year',
                        },
                        {
                            type: 'FIELD',
                            key: 'organization',
                        },
                    ],
                    style: {
                        container: {
                            margin: '0 0 34px 0',
                        },
                        title: {
                            fontSize: 22,
                            fontWeight: 800,
                            color: '#7B5C53',
                            margin: '0 0 14px 0',
                        },
                        content: {
                            fontSize: 17,
                            lineHeight: 1.4,
                            color: '#111111',
                        },
                    },
                    visible: true,
                },
                experience: {
                    type: 'EXPERIENCE',
                    title: 'Kinh nghiệm làm việc',
                    variant: 'right_date_timeline',
                    fields: [
                        {
                            type: 'GROUP',
                            layout: 'SPLIT',
                            ratio: [72, 28],
                            gap: 16,
                            items: [
                                {
                                    type: 'GROUP',
                                    layout: 'STACK',
                                    gap: 6,
                                    items: [
                                        {
                                            type: 'FIELD',
                                            key: 'company',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'role',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'description',
                                        },
                                    ],
                                },
                                {
                                    type: 'GROUP',
                                    layout: 'INLINE',
                                    separator: ' - ',
                                    items: [
                                        {
                                            type: 'FIELD',
                                            key: 'start_date',
                                            format: 'month_year',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'end_date',
                                            format: 'month_year',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    options: {
                        date: {
                            position: 'right',
                            format: 'month_year',
                            separator: ' - ',
                            currentText: 'Nay',
                        },
                        divider: {
                            visible: true,
                            color: '#D8D3D0',
                            thickness: 1,
                            margin: '16px 0 12px 0',
                        },
                    },
                    style: {
                        container: {
                            margin: '0 0 34px 0',
                        },
                        title: {
                            fontSize: 22,
                            fontWeight: 800,
                            color: '#7B5C53',
                            margin: '0 0 16px 0',
                        },
                        content: {
                            fontSize: 17,
                            lineHeight: 1.45,
                            color: '#111111',
                        },
                    },
                    visible: true,
                },
                education: {
                    type: 'EDUCATION',
                    title: 'Học vấn',
                    variant: 'right_date_timeline',
                    fields: [
                        {
                            type: 'GROUP',
                            layout: 'SPLIT',
                            ratio: [72, 28],
                            gap: 16,
                            items: [
                                {
                                    type: 'GROUP',
                                    layout: 'STACK',
                                    gap: 6,
                                    items: [
                                        {
                                            type: 'FIELD',
                                            key: 'school',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'degree',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'description',
                                        },
                                    ],
                                },
                                {
                                    type: 'GROUP',
                                    layout: 'INLINE',
                                    separator: ' - ',
                                    items: [
                                        {
                                            type: 'FIELD',
                                            key: 'start_date',
                                            format: 'month_year',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'end_date',
                                            format: 'month_year',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    options: {
                        date: {
                            position: 'right',
                            format: 'month_year',
                            separator: ' - ',
                        },
                        divider: {
                            visible: true,
                            color: '#D8D3D0',
                            thickness: 1,
                            margin: '16px 0 12px 0',
                        },
                    },
                    style: {
                        container: {
                            margin: '0 0 34px 0',
                        },
                        title: {
                            fontSize: 22,
                            fontWeight: 800,
                            color: '#7B5C53',
                            margin: '0 0 16px 0',
                        },
                        content: {
                            fontSize: 17,
                            lineHeight: 1.45,
                            color: '#111111',
                        },
                    },
                    visible: true,
                },
            },
            theme: {
                fontFamily: 'Inter',
                colors: {
                    primary: '#7B5C53',
                    accent: '#DCD3D0',
                    secondary: '#A07B70',
                    text: '#111111',
                    muted: '#7B5C53',
                    background: '#FFFFFF',
                    surface: '#F4F0EE',
                    border: '#D8D3D0',
                    icon: '#7B5C53',
                },
                prefix: '',
                spacing: {
                    sectionGap: 30,
                    itemGap: 12,
                    pagePaddingX: 32,
                    pagePaddingY: 0,
                    bulletGap: 6,
                },
                fontSize: {
                    name: 34,
                    headline: 22,
                    sectionTitle: 22,
                    body: 17,
                    small: 15,
                },
            },
        },
    },
};
const MAU_03 = {
    success: true,
    messsage: 'Lấy dữ liệu CV thành công.',
    data: {
        id: '29713ded-64c6-4af0-b11a-1323f3a51eb3',
        code: 'CV_DEVELOPER_SIDEBAR_BLUE_01',
        name: 'Mẫu CV Developer Sidebar Blue',
        is_premium: false,
        preview_url: '',
        config: {
            version: 2,
            rendererVersion: 1,
            layout: {
                key: 'sidebar_blue_developer',
                page: {
                    size: 'A4',
                    margin: {
                        top: 0,
                        right: 0,
                        bottom: 0,
                        left: 0,
                    },
                },
                body: {
                    layout: 'SPLIT',
                    columns: [
                        {
                            id: 'left',
                            width: 34,
                            style: {
                                background: '#F4FAFF',
                                padding: '22px 20px 32px 20px',
                            },
                        },
                        {
                            id: 'main',
                            width: 66,
                            style: {
                                background: '#FFFFFF',
                                padding: '28px 28px 36px 28px',
                            },
                        },
                    ],
                },
            },
            zones: {
                left: ['profile', 'contact', 'skills', 'additional'],
                main: ['summary', 'education', 'experience'],
            },
            sections: {
                profile: {
                    type: 'profile_header',
                    title: '',
                    variant: 'profile_sidebar_avatar_top',
                    fields: [
                        {
                            type: 'GROUP',
                            layout: 'STACK',
                            gap: 16,
                            items: [
                                {
                                    type: 'FIELD',
                                    key: 'avatar_url',
                                },
                                {
                                    type: 'FIELD',
                                    key: 'headline',
                                },
                                {
                                    type: 'FIELD',
                                    key: 'full_name',
                                },
                            ],
                        },
                    ],
                    options: {
                        avatar: {
                            width: 170,
                            height: 170,
                            shape: 'rounded',
                            position: 'top',
                            objectFit: 'cover',
                        },
                        card: {
                            enabled: false,
                        },
                    },
                    style: {
                        container: {
                            margin: '0 0 34px 0',
                        },
                        title: {
                            fontSize: 24,
                            fontWeight: 800,
                            color: '#2E70B8',
                        },
                        content: {
                            fontSize: 14,
                            lineHeight: 1.4,
                            color: '#2E70B8',
                        },
                    },
                    visible: true,
                },
                contact: {
                    type: 'CONTACT',
                    title: 'Thông Tin Liên Hệ',
                    variant: 'contact_icon_list',
                    fields: [
                        {
                            type: 'FIELD',
                            key: 'birth_date',
                            icon: 'calendar',
                            format: 'date',
                            hideWhenEmpty: true,
                        },
                        {
                            type: 'FIELD',
                            key: 'email',
                            icon: 'mail',
                            format: 'email',
                            hideWhenEmpty: true,
                        },
                        {
                            type: 'FIELD',
                            key: 'website',
                            icon: 'globe',
                            format: 'url',
                            hideWhenEmpty: true,
                        },
                        {
                            type: 'FIELD',
                            key: 'phone',
                            icon: 'phone',
                            format: 'phone',
                            hideWhenEmpty: true,
                        },
                        {
                            type: 'FIELD',
                            key: 'address',
                            icon: 'home',
                            hideWhenEmpty: true,
                        },
                    ],
                    style: {
                        container: {
                            margin: '0 0 34px 0',
                        },
                        title: {
                            fontSize: 18,
                            fontWeight: 800,
                            color: '#2E70B8',
                            margin: '0 0 14px 0',
                        },
                        content: {
                            fontSize: 13,
                            lineHeight: 1.8,
                            color: '#2E70B8',
                        },
                    },
                    visible: true,
                },
                skills: {
                    type: 'SKILLS',
                    title: 'Các Kỹ Năng',
                    variant: 'skills_card_text',
                    fields: [
                        {
                            type: 'FIELD',
                            key: 'name',
                        },
                        {
                            type: 'FIELD',
                            key: 'description',
                        },
                    ],
                    options: {
                        skill: {
                            display: 'CARD_TEXT',
                            showLevel: false,
                            showDescription: true,
                        },
                        card: {
                            enabled: true,
                            background: '#FFFFFF',
                            borderRadius: 12,
                            padding: '18px 20px',
                            shadow: 'none',
                        },
                    },
                    style: {
                        container: {
                            margin: '0 0 28px 0',
                        },
                        title: {
                            fontSize: 18,
                            fontWeight: 800,
                            color: '#2E70B8',
                            margin: '0 0 14px 0',
                        },
                        content: {
                            fontSize: 13,
                            lineHeight: 1.8,
                            color: '#2E70B8',
                        },
                    },
                    visible: true,
                },
                additional: {
                    type: 'ADDITIONAL',
                    title: 'Thông Tin Thêm',
                    variant: 'card_content',
                    fields: [
                        {
                            type: 'FIELD',
                            key: 'description',
                        },
                    ],
                    options: {
                        card: {
                            enabled: true,
                            background: '#FFFFFF',
                            borderRadius: 12,
                            padding: '18px 20px',
                            shadow: 'none',
                        },
                    },
                    style: {
                        container: {
                            margin: '0 0 28px 0',
                        },
                        title: {
                            fontSize: 18,
                            fontWeight: 800,
                            color: '#2E70B8',
                            margin: '0 0 14px 0',
                        },
                        content: {
                            fontSize: 13,
                            lineHeight: 1.8,
                            color: '#2E70B8',
                        },
                    },
                    visible: true,
                },
                summary: {
                    type: 'SUMMARY',
                    title: 'Mục Tiêu Nghề Nghiệp',
                    variant: 'card_content',
                    fields: [
                        {
                            type: 'FIELD',
                            key: 'summary',
                        },
                    ],
                    options: {
                        card: {
                            enabled: true,
                            background: '#FAFAFA',
                            borderRadius: 12,
                            padding: '18px 22px',
                            shadow: 'none',
                        },
                    },
                    style: {
                        container: {
                            margin: '0 0 18px 0',
                        },
                        title: {
                            fontSize: 20,
                            fontWeight: 800,
                            color: '#2E70B8',
                            margin: '0 0 14px 0',
                        },
                        content: {
                            fontSize: 14,
                            lineHeight: 1.8,
                            color: '#2E70B8',
                        },
                    },
                    visible: true,
                },
                education: {
                    type: 'EDUCATION',
                    title: 'Học Vấn',
                    variant: 'date_badge_card',
                    fields: [
                        {
                            type: 'GROUP',
                            layout: 'SPLIT',
                            ratio: [70, 30],
                            gap: 14,
                            items: [
                                {
                                    type: 'GROUP',
                                    layout: 'STACK',
                                    gap: 12,
                                    items: [
                                        {
                                            type: 'FIELD',
                                            key: 'degree',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'school',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'description',
                                        },
                                    ],
                                },
                                {
                                    type: 'GROUP',
                                    layout: 'INLINE',
                                    separator: ' - ',
                                    items: [
                                        {
                                            type: 'FIELD',
                                            key: 'start_date',
                                            format: 'date',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'end_date',
                                            format: 'date',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    options: {
                        date: {
                            position: 'badge',
                            format: 'date',
                            separator: ' - ',
                            currentText: 'Hiện Tại',
                        },
                        card: {
                            enabled: true,
                            background: '#FAFAFA',
                            borderRadius: 12,
                            padding: '22px 20px',
                            shadow: 'none',
                        },
                    },
                    style: {
                        container: {
                            margin: '0 0 18px 0',
                        },
                        title: {
                            fontSize: 20,
                            fontWeight: 800,
                            color: '#2E70B8',
                            margin: '0 0 14px 0',
                        },
                        content: {
                            fontSize: 14,
                            lineHeight: 1.8,
                            color: '#2E70B8',
                        },
                    },
                    visible: true,
                },
                experience: {
                    type: 'EXPERIENCE',
                    title: 'Kinh Nghiệm Làm Việc',
                    variant: 'date_badge_card',
                    fields: [
                        {
                            type: 'GROUP',
                            layout: 'SPLIT',
                            ratio: [70, 30],
                            gap: 14,
                            items: [
                                {
                                    type: 'GROUP',
                                    layout: 'STACK',
                                    gap: 12,
                                    items: [
                                        {
                                            type: 'FIELD',
                                            key: 'company',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'role',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'description',
                                        },
                                    ],
                                },
                                {
                                    type: 'GROUP',
                                    layout: 'INLINE',
                                    separator: ' - ',
                                    items: [
                                        {
                                            type: 'FIELD',
                                            key: 'start_date',
                                            format: 'date',
                                        },
                                        {
                                            type: 'FIELD',
                                            key: 'end_date',
                                            format: 'date',
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    options: {
                        date: {
                            position: 'badge',
                            format: 'date',
                            separator: ' - ',
                            currentText: 'Hiện Tại',
                        },
                        card: {
                            enabled: true,
                            background: '#FAFAFA',
                            borderRadius: 12,
                            padding: '22px 20px',
                            shadow: 'none',
                        },
                    },
                    style: {
                        container: {
                            margin: '0 0 18px 0',
                        },
                        title: {
                            fontSize: 20,
                            fontWeight: 800,
                            color: '#2E70B8',
                            margin: '0 0 14px 0',
                        },
                        content: {
                            fontSize: 14,
                            lineHeight: 1.8,
                            color: '#2E70B8',
                        },
                    },
                    visible: true,
                },
            },
            theme: {
                fontFamily: 'Inter',
                colors: {
                    primary: '#2E70B8',
                    accent: '#DDEEFF',
                    secondary: '#EAF5FF',
                    text: '#2E70B8',
                    muted: '#6B9BCD',
                    background: '#FFFFFF',
                    surface: '#FAFAFA',
                    border: '#EAF0F6',
                    icon: '#2E70B8',
                },
                prefix: '//',
                spacing: {
                    sectionGap: 18,
                    itemGap: 12,
                    pagePaddingX: 0,
                    pagePaddingY: 0,
                    bulletGap: 6,
                },
                fontSize: {
                    name: 24,
                    headline: 13,
                    sectionTitle: 20,
                    body: 14,
                    small: 13,
                },
            },
        },
    },
};

export const buildCreateCvFormData = ({ payload, avatarFile, previewFile }) => {
    const formData = new FormData();

    formData.append('template_id', payload.template_id || '');
    formData.append('title', payload.title || '');
    formData.append('language', payload.language || 'vi');
    formData.append('status', payload.status || 'DRAFT');
    formData.append('visibility', payload.visibility || 'PRIVATE');

    // eslint-disable-next-line no-unused-vars
    const { avatar_url, ...nest } = payload.content || {};
    if (nest && Object.keys(nest).length > 0) {
        formData.append('content', JSON.stringify(nest || {}));
    }
    if (
        payload?.custom_config &&
        Object.keys(payload?.custom_config).length > 0
    ) {
        formData.append(
            'custom_config',
            JSON.stringify(payload.custom_config || {}),
        );
    }

    if (avatarFile instanceof File) {
        formData.append('avatar', avatarFile);
    }

    if (previewFile instanceof File) {
        // Phải là thumbnail vì BE đang check name: 'thumbnail'
        formData.append('thumbnail', previewFile);
    }

    return formData;
};

export const buildUpdateCvFormData = ({ payload, avatarFile, previewFile }) => {
    const formData = new FormData();

    if (payload.title !== undefined) {
        formData.append('title', payload.title || '');
    }
    if (payload.language !== undefined) {
        formData.append('language', payload.language || 'vi');
    }
    if (payload.status !== undefined) {
        formData.append('status', payload.status || 'DRAFT');
    }
    if (payload.visibility !== undefined) {
        formData.append('visibility', payload.visibility || 'PRIVATE');
    }

    if (payload.content && Object.keys(payload.content).length > 0) {
        // eslint-disable-next-line no-unused-vars
        const { avatar_url, ...nest } = payload.content || {};
        if (nest && Object.keys(nest).length > 0) {
            formData.append('content', JSON.stringify(nest || {}));
        }
    }
    if (
        payload?.custom_config &&
        Object.keys(payload?.custom_config).length > 0
    ) {
        formData.append(
            'custom_config',
            JSON.stringify(payload.custom_config || {}),
        );
    }

    if (avatarFile instanceof File) {
        formData.append('avatar', avatarFile);
    }

    if (previewFile instanceof File) {
        formData.append('thumbnail', previewFile);
    }

    return formData;
};
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
        const result = await Response.GET(`cv-templates/code/${code}`);
        // const result = MAU_01;
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
        const result = await Response.GET(`cvs/me/${slug}`);
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const createCv = async (data) => {
    try {
        const result = await Response.POST('cvs/add', data);
        return result;
    } catch (error) {
        console.log({ error });
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};

export const updateCvBySlug = async (id, data) => {
    if (!id) {
        throw new Error('Thiếu slug CV');
    }

    try {
        const result = await Response.PATCH(`cvs/edit/${id}`, data);
        return result;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};
export const downloadCvPdfBySlug = async (cvId, htmlText, cssText) => {
    if (!cvId || !htmlText || !cssText) {
        throw new Error('Thiếu slug CV');
    }

    try {
        const result = await Response.POST(`cvs/export/${cvId}`, {
            htmlText,
            cssText,
        });
        return result;
    } catch (error) {
        console.log({ error });
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};
