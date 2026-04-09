import * as Response from '~/utils/HttpsRequest';

export const getCvTemplates = async (limit = 8, page = 1) => {
    try {
        const result = await Response.GET(
            `cv-templates?limit=${limit}&page=${page}`,
        );
        return result;
    } catch (error) {
        console.log(error);
    }
};

export const getCvTemplateDetail = async (code) => {
    const result = await Response.GET(`cv-templates/code/${code}`);

    if (!result.success) {
        return {
            success: false,
            message: 'Không tìm thấy mẫu CV',
            data: null,
        };
    }

    return result;
};
