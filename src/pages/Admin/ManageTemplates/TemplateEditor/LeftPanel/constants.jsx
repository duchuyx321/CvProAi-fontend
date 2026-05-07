// src/pages/Admin/ManageTemplates/TemplateEditor/LeftPanel/constants.jsx

export const LAYOUT_OPTIONS = [
    { value: 'oneColumn', label: 'One Column' },
    { value: 'twoColumn', label: 'Two Column' },
    { value: 'modernHeader', label: 'Modern Header' },
];

export const FONT_OPTIONS = ['Inter', 'Roboto', 'Arial', 'Times New Roman'];

export const SPACING_OPTIONS = [
    { value: 'compact', label: 'Compact' },
    { value: 'comfortable', label: 'Comfortable' },
    { value: 'loose', label: 'Loose' },
];

export const SECTION_OPTIONS = [
    { key: 'profile', label: 'Thông tin cá nhân' },
    { key: 'summary', label: 'Tóm tắt chuyên môn' },
    { key: 'experience', label: 'Kinh nghiệm làm việc' },
    { key: 'skills', label: 'Kỹ năng chuyên môn' },
    { key: 'education', label: 'Học vấn' },
    { key: 'languages', label: 'Ngoại ngữ' },
];

export const INDUSTRY_OPTIONS = [
    { value: 'IT & Software', label: 'IT & Software' },
    { value: 'Business', label: 'Business' },
    { value: 'Design', label: 'Design' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Finance', label: 'Tài chính - Ngân hàng' },
    { value: 'Education', label: 'Giáo dục' },
    { value: 'Healthcare', label: 'Y tế' },
    { value: 'Engineering', label: 'Kỹ thuật' },
    { value: 'Management', label: 'Quản lý' },
    { value: 'Corporate', label: 'Corporate' },
    { value: 'General', label: 'Phổ thông' },
];

export const STARTER_PRESETS = [
    {
        key: 'modern',
        label: 'Modern',
        description: 'Trẻ trung, năng động',
        config: {
            layout: 'modernHeader',
            primaryColor: '#635BFF',
            fontFamily: 'Inter',
            spacing: 'comfortable',
        },
    },
    {
        key: 'classic',
        label: 'Classic',
        description: 'Truyền thống, trang trọng',
        config: {
            layout: 'twoColumn',
            primaryColor: '#1E293B',
            fontFamily: 'Times New Roman',
            spacing: 'compact',
        },
    },
    {
        key: 'creative',
        label: 'Creative',
        description: 'Sáng tạo, nổi bật',
        config: {
            layout: 'modernHeader',
            primaryColor: '#EA580C',
            fontFamily: 'Roboto',
            spacing: 'loose',
        },
    },
    {
        key: 'minimal',
        label: 'Minimal',
        description: 'Tối giản, sạch sẽ',
        config: {
            layout: 'oneColumn',
            primaryColor: '#0F172A',
            fontFamily: 'Inter',
            spacing: 'comfortable',
        },
    },
];

export const DEFAULT_EDITOR = {
    name: '',
    code: '',
    description: '',
    category: 'IT & Software',
    is_active: true,
    is_premium: false,
    layout: 'modernHeader',
    primaryColor: '#635BFF',
    fontFamily: 'Inter',
    spacing: 'comfortable',
    sections: {
        profile: true,
        summary: true,
        experience: true,
        skills: true,
        education: true,
        languages: true,
    },
};
