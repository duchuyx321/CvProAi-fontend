import * as Response from '~/utils/HttpsRequest';

export const getProfile = async () => {
    try {
        const res = await Response.GET('profile/me');
        return res;
    } catch (error) {
        const data = error?.response?.data;
        return data;
    }
};

export const updateProfile = async (payload = {
    full_name: '',
    phone: '',
    email: '',
    username: '',
    bio: '',
    avatar: '',
    cover: '',
}) => {
    try {
        const checkValuePayload = ["", null, undefined]
        const rest = Object.keys(payload).reduce((acc, key) => {
            if (!checkValuePayload.includes(payload[key])) {
                acc[key] = payload[key];
            }
            return acc;
        }, {});
        const res = await Response.PATCH('profile/update', rest);
        return res;
    } catch (error) {
        const data = error?.response?.data;
        return data;
    }
};

export const updateAvatar = async (avatar) => {
    try {
        const res = await Response.PATCH('profile/avatar', {
            avatar,
        });
        return res;
    } catch (error) {
        const data = error?.response?.data;
        return data;
    }
};

export const updateCover = async (cover) => {
    try {
        const res = await Response.PATCH('profile/cover', {
            cover,
        });
        return res;
    } catch (error) {
        const data = error?.response?.data;
        return data;
    }
};