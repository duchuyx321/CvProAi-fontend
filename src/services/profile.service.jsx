import * as Response from '~/utils/HttpsRequest';

const buildErrorResponse = (error) => {
    const status = error?.status || error?.response?.status;
    const data = error?.response?.data;

    return {
        success: false,
        message:
            data?.message ||
            error?.message ||
            'Có lỗi xảy ra, vui lòng thử lại sau',
        data: data?.data,
        status,
    };
};

const removeInvalidPayloadFields = (payload = {}) => {
    return Object.keys(payload).reduce((acc, key) => {
        const value = payload[key];

        if (value !== undefined && value !== null) {
            acc[key] = value;
        }

        return acc;
    }, {});
};

export const getProfile = async () => {
    try {
        return await Response.GET('profile');
    } catch (error) {
        return buildErrorResponse(error);
    }
};

export const updateProfile = async (payload = {}) => {
    try {
        const rest = removeInvalidPayloadFields(payload);

        if (Object.keys(rest).length === 0) {
            return {
                success: false,
                message: 'Không có dữ liệu cần cập nhật',
            };
        }

        return await Response.POST('profile/update', rest);
    } catch (error) {
        return buildErrorResponse(error);
    }
};

export const updateAvatar = async (avatarUrl) => {
    return updateProfile({
        avatar_url: avatarUrl,
    });
};

export const updateCover = async (cover) => {
    return updateProfile({
        cover,
    });
};