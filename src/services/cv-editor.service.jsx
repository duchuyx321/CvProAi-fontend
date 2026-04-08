import { TEMPLATE_DATA } from '~/data/cv-teamplate.mock';
import {
    CV_EDITOR_DETAIL_DATA,
    CREATE_CV_FROM_TEMPLATE_MOCK,
    SAVE_CV_MOCK,
} from '~/data/cv-editer.mock';

const fakeDelay = (time = 400) =>
    new Promise((resolve) => setTimeout(resolve, time));

export const createCvFromTemplate = async (templateId) => {
    await fakeDelay();

    const template = TEMPLATE_DATA.find((item) => item.id === templateId);

    if (!template) {
        return {
            success: false,
            message: 'Không tìm thấy template để tạo CV',
            data: null,
        };
    }

    const existingCv = CV_EDITOR_DETAIL_DATA.find(
        (item) => item.template_id === templateId,
    );

    if (existingCv) {
        return {
            ...CREATE_CV_FROM_TEMPLATE_MOCK,
            data: {
                cv_id: existingCv.id,
                template_id: templateId,
                layout_key: existingCv.layout_key,
            },
        };
    }

    const nextId = `cv_${String(CV_EDITOR_DETAIL_DATA.length + 1).padStart(
        3,
        '0',
    )}`;

    CV_EDITOR_DETAIL_DATA.push({
        id: nextId,
        name: `CV ${template.name}`,
        template_id: templateId,
        layout_key: template.layout_key,
        template_config: template.template_config,
        resume_data: {
            ...template.sample_data,
        },
    });

    return {
        ...CREATE_CV_FROM_TEMPLATE_MOCK,
        data: {
            cv_id: nextId,
            template_id: templateId,
            layout_key: template.layout_key,
        },
    };
};

export const getCvEditorDetail = async (cvId) => {
    await fakeDelay();

    const cvDetail = CV_EDITOR_DETAIL_DATA.find((item) => item.id === cvId);

    if (!cvDetail) {
        return {
            success: false,
            message: 'Không tìm thấy dữ liệu CV',
            data: null,
        };
    }

    return {
        success: true,
        message: 'Lấy dữ liệu editor thành công',
        data: cvDetail,
    };
};

export const saveCv = async (cvId, payload = {}) => {
    await fakeDelay();

    const cvIndex = CV_EDITOR_DETAIL_DATA.findIndex((item) => item.id === cvId);

    if (cvIndex === -1) {
        return {
            success: false,
            message: 'Không tìm thấy CV để lưu',
            data: null,
        };
    }

    const currentCv = CV_EDITOR_DETAIL_DATA[cvIndex];

    CV_EDITOR_DETAIL_DATA[cvIndex] = {
        ...currentCv,
        name: payload?.name ?? currentCv.name,
        resume_data: payload?.resume_data ?? currentCv.resume_data,
    };

    return {
        ...SAVE_CV_MOCK,
        data: {
            id: cvId,
            name: CV_EDITOR_DETAIL_DATA[cvIndex].name,
            layout_key: CV_EDITOR_DETAIL_DATA[cvIndex].layout_key,
            resume_data: CV_EDITOR_DETAIL_DATA[cvIndex].resume_data,
        },
    };
};