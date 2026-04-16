import * as Response from '~/utils/HttpsRequest';

const buildErrorResponse = (error) => {
    const status = error?.status || error?.response?.status;
    const data = error?.response?.data;

    return { ...data, status };
};

export const getProfile = async () => {
    try {
        const res = await Response.GET('profile');
        return res;
    } catch (error) {
        return buildErrorResponse(error);
    }
};

export const updateProfile = async (
    payload = {
        full_name: '',
        phone: '',
        email: '',
        username: '',
        bio: '',
        avatar: '',
        cover: '',
    },
) => {
    try {
        const checkValuePayload = ['', null, undefined];
        const rest = Object.keys(payload).reduce((acc, key) => {
            if (!checkValuePayload.includes(payload[key])) {
                acc[key] = payload[key];
            }
            return acc;
        }, {});
        const res = await Response.PATCH('profile/update', rest);
        return res;
    } catch (error) {
        return buildErrorResponse(error);
    }
};

export const updateAvatar = async (avatar) => {
    try {
        const res = await Response.PATCH('profile/update', {
            avatar,
        });
        return res;
    } catch (error) {
        return buildErrorResponse(error);
    }
};

export const updateCover = async (cover) => {
    try {
        const res = await Response.PATCH('profile/cover', {
            cover,
        });
        return res;
    } catch (error) {
        return buildErrorResponse(error);
    }
};
