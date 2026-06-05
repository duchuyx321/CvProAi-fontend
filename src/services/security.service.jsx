import * as Response from '~/utils/HttpsRequest';

export const changePassword = async ({
    current_password,
    new_password,
    confirm_password,
}) => {
    try {
        const res = await Response.PATCH('security/change-password', {
            current_password,
            new_password,
            confirm_password,
        });

        return res;
    } catch (error) {
        const data = error?.response?.data;
        return data;
    }
};

export const getDevices = async () => {
    try {
        const res = await Response.GET('security/devices');
        return res;
    } catch (error) {
        const data = error?.response?.data;
        return data;
    }
};

export const logoutDevice = async (device_id) => {
    try {
        const res = await Response.POST('security/devices/logout', {
            device_id,
        });
        return res;
    } catch (error) {
        const data = error?.response?.data;
        return data;
    }
};

export const toggleTwoFactor = async (enabled) => {
    try {
        const res = await Response.PATCH('security/two-factor', {
            enabled,
        });
        return res;
    } catch (error) {
        const data = error?.response?.data;
        return data;
    }
};