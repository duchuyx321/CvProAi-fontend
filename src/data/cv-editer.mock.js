import { TEMPLATE_DATA } from './cv-teamplate.mock';

export const CV_EDITOR_DETAIL_DATA = [
    {
        id: 'cv_001',
        name: 'CV Frontend Nguyễn Văn A',
        template_id: 'template_split_01',
        layout_key: 'split',
        template_config: TEMPLATE_DATA.find(
            (item) => item.id === 'template_split_01',
        )?.template_config,
        resume_data: {
            ...TEMPLATE_DATA.find((item) => item.id === 'template_split_01')
                ?.sample_data,
        },
    },
    {
        id: 'cv_002',
        name: 'CV Trần Thị B',
        template_id: 'template_stack_01',
        layout_key: 'stack',
        template_config: TEMPLATE_DATA.find(
            (item) => item.id === 'template_stack_01',
        )?.template_config,
        resume_data: {
            ...TEMPLATE_DATA.find((item) => item.id === 'template_stack_01')
                ?.sample_data,
        },
    },
    {
        id: 'cv_003',
        name: 'CV UIUX Lê Minh C',
        template_id: 'template_banner_split_01',
        layout_key: 'banner_split',
        template_config: TEMPLATE_DATA.find(
            (item) => item.id === 'template_banner_split_01',
        )?.template_config,
        resume_data: {
            ...TEMPLATE_DATA.find(
                (item) => item.id === 'template_banner_split_01',
            )?.sample_data,
        },
    },
];

export const CREATE_CV_FROM_TEMPLATE_MOCK = {
    success: true,
    message: 'Tạo CV thành công',
    data: {
        cv_id: 'cv_001',
    },
};

export const SAVE_CV_MOCK = {
    success: true,
    message: 'Lưu CV thành công',
    data: {},
};