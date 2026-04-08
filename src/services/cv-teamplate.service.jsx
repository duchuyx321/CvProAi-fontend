import {
    CV_TEMPLATE_LIST_MOCK,
    CV_TEMPLATE_DETAIL_MOCK,
} from '~/data/cv-teamplate.mock';

const fakeDelay = (time = 400) =>
    new Promise((resolve) => setTimeout(resolve, time));

export const getCvTemplates = async () => {
    await fakeDelay();
    return CV_TEMPLATE_LIST_MOCK;
};

export const getCvTemplateDetail = async (templateId) => {
    await fakeDelay();

    const template = CV_TEMPLATE_DETAIL_MOCK.data.find(
        (item) => item.id === templateId,
    );

    if (!template) {
        return {
            success: false,
            message: 'Không tìm thấy mẫu CV',
            data: null,
        };
    }

    return {
        success: true,
        message: 'Lấy chi tiết mẫu CV thành công',
        data: template,
    };
};