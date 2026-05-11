import * as Response from '~/utils/HttpsRequest';

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
