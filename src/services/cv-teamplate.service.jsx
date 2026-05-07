import * as Response from '~/utils/HttpsRequest';

const getErrorResponse = (error, fallbackMessage = 'Có lỗi xảy ra') => {
    const status = error?.status || error?.response?.status;
    const data = error?.response?.data || {};

    return {
        success: false,
        ...data,
        message: data?.message || error?.message || fallbackMessage,
        status,
    };
};

const appendContent = (formData, content) => {
    // eslint-disable-next-line no-unused-vars
    const { avatar_url, ...nest } = content || {};

    if (nest && Object.keys(nest).length > 0) {
        formData.append('content', JSON.stringify(nest));
    }
};

const appendCustomConfig = (formData, customConfig) => {
    if (customConfig && Object.keys(customConfig).length > 0) {
        formData.append('custom_config', JSON.stringify(customConfig));
    }
};

const appendCvFiles = (formData, { avatarFile, previewFile }) => {
    if (avatarFile instanceof File) {
        formData.append('avatar', avatarFile);
    }

    if (previewFile instanceof File) {
        formData.append('thumbnail', previewFile);
    }
};

export const buildCreateCvFormData = ({ payload, avatarFile, previewFile }) => {
    const formData = new FormData();

    formData.append('template_id', payload.template_id || '');
    formData.append('title', payload.title || '');
    formData.append('language', payload.language || 'vi');
    formData.append('status', payload.status || 'DRAFT');
    formData.append('visibility', payload.visibility || 'PRIVATE');

    appendContent(formData, payload.content);
    appendCustomConfig(formData, payload.custom_config);
    appendCvFiles(formData, { avatarFile, previewFile });

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

    appendContent(formData, payload.content);
    appendCustomConfig(formData, payload.custom_config);
    appendCvFiles(formData, { avatarFile, previewFile });

    return formData;
};

export const getCvTemplates = async (limit = 8, page = 1) => {
    try {
        const res = await Response.GET(`cv-templates?limit=${limit}&page=${page}`);
        return res;
    } catch (error) {
        return getErrorResponse(error, 'Không thể tải danh sách mẫu CV');
    }
};

export const getCvTemplateDetail = async (code) => {
    try {
        if (!code) {
            throw new Error('Thiếu code template');
        }

        const res = await Response.GET(`cv-templates/code/${code}`);

        if (!res?.success) {
            return {
                success: false,
                message: 'Không tìm thấy mẫu CV',
                data: null,
            };
        }

        return res;
    } catch (error) {
        return getErrorResponse(error, 'Không thể tải chi tiết mẫu CV');
    }
};

export const getCvTemplateById = async (id) => {
    try {
        if (!id) {
            throw new Error('Thiếu id template');
        }

        const res = await Response.GET(`cv-templates/${id}`);

        if (!res?.success) {
            return {
                success: false,
                message: 'Không tìm thấy mẫu CV',
                data: null,
            };
        }

        return res;
    } catch (error) {
        return getErrorResponse(error, 'Không thể tải chi tiết mẫu CV');
    }
};

export const getCvDetailBySlug = async (slug) => {
    try {
        if (!slug) {
            throw new Error('Thiếu slug CV');
        }

        const res = await Response.GET(`cvs/me/${slug}`);
        return res;
    } catch (error) {
        return getErrorResponse(error, 'Không thể tải CV');
    }
};

export const createCv = async (data) => {
    try {
        const res = await Response.POST('cvs/add', data);
        return res;
    } catch (error) {
        return getErrorResponse(error, 'Tạo CV thất bại');
    }
};

export const updateCvBySlug = async (id, data) => {
    try {
        if (!id) {
            throw new Error('Thiếu slug CV');
        }

        const res = await Response.PUT(`cvs/edit/${id}`, data);
        return res;
    } catch (error) {
        return getErrorResponse(error, 'Cập nhật CV thất bại');
    }
};

export const downloadCvPdfBySlug = async (cvId, htmlText, cssText) => {
    try {
        if (!cvId || !htmlText || !cssText) {
            throw new Error('Thiếu dữ liệu xuất PDF');
        }

        const res = await Response.POST(`cvs/export/${cvId}`, {
            htmlText,
            cssText,
        });
        return res;
    } catch (error) {
        return getErrorResponse(error, 'Xuất PDF thất bại');
    }
};

export const createCvTemplate = async (data) => {
    try {
        const res = await Response.POST('cv-templates', data);
        return res;
    } catch (error) {
        return getErrorResponse(error, 'Tạo mẫu CV thất bại');
    }
};

export const updateCvTemplate = async (id, data) => {
    try {
        if (!id) {
            throw new Error('Thiếu id template');
        }

        const res = await Response.PUT(`cv-templates/${id}`, data);
        return res;
    } catch (error) {
        return getErrorResponse(error, 'Cập nhật mẫu CV thất bại');
    }
};

export const deleteCvTemplate = async (id) => {
    try {
        if (!id) {
            throw new Error('Thiếu id template');
        }

        const res = await Response.DELETE(`cv-templates/${id}`);
        return res;
    } catch (error) {
        return getErrorResponse(error, 'Xóa mẫu CV thất bại');
    }
};
