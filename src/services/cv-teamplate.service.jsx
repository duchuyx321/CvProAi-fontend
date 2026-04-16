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
        const result = await Response.GET(`cv-templates/code/${code}`);

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
        const result = await Response.GET(`cvs/slug/${slug}`);
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