import * as Response from '~/utils/HttpsRequest';

export const getProfile = async () => {
    try {
        const res = await Response.GET('profile');
        return res;
    } catch (error) {
        const data = error?.response?.data;
        return data;
    }
};

export const updateProfile = async ({
    full_name,
    phone,
    email,
    username,
    bio,
    avatar,
    cover,
}) => {
    try {
        const payload = {
            full_name,
            phone,
            email,
            username,
            bio,
            avatar,
            cover,
        };

        const res = await Response.PATCH('profile/update', payload);
        return res;
    } catch (error) {
        const data = error?.response?.data;
        return data;
    }
};

export const updateAvatar = async (avatar) => {
    try {
        const res = await Response.PATCH('profile/update', {
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
