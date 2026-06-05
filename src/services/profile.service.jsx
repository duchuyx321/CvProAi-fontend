import * as Response from '~/utils/HttpsRequest';

const buildErrorResponse = (error) => {
    const status = error?.status || error?.response?.status;
    const data = error?.response?.data || {};

    return {
        ...data,
        success: false,
        message:
            data?.message ||
            data?.messsage ||
            error?.message ||
            'Có lỗi xảy ra, vui lòng thử lại sau',
        status,
    };
};

export const getProfile = async () => {
    try {
        return await Response.GET('profile');
    } catch (error) {
        return buildErrorResponse(error);
    }
};

export const buildUpdateProfileFormData = ({
    full_name,
    phone,
    avatar_url,
    avatarFile,
    dob,
    location,
    headline,
    summary,
    links,
} = {}) => {
    const formData = new FormData();

    if (full_name !== undefined) {
        formData.append('full_name', full_name || '');
    }

    if (phone !== undefined) {
        formData.append('phone', phone || '');
    }

    if (avatarFile instanceof File) {
        formData.append('avatar', avatarFile);
    } else if (avatar_url !== undefined) {
        formData.append('avatar_url', avatar_url || '');
    }

    if (dob !== undefined) {
        formData.append('dob', dob || '');
    }

    if (location !== undefined) {
        formData.append('location', location || '');
    }

    if (headline !== undefined) {
        formData.append('headline', headline || '');
    }

    if (summary !== undefined) {
        formData.append('summary', summary || '');
    }

    if (links !== undefined) {
        formData.append(
            'links',
            typeof links === 'string' ? links : JSON.stringify(links || {}),
        );
    }

    return formData;
};

export const updateProfile = async (payload = {}) => {
    try {
        const formData = buildUpdateProfileFormData(payload);

        return await Response.POST('profile/update', formData);
    } catch (error) {
        return buildErrorResponse(error);
    }
};