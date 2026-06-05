import * as Response from '~/utils/HttpsRequest';

export const login = async (email, password) => {
    try {
        const res = await Response.POST('auth/login', { email, password });
        return res;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};

export const register = async ({ full_name, email, password }) => {
    try {
        const res = await Response.POST('auth/register', {
            email,
            password,
            full_name,
        });
        return res;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};

export const logout = async () => {
    try {
        const res = await Response.POST('auth/logout');
        return res;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};
export const resendOTP = async (email) => {
    try {
        const res = await Response.POST('auth/otp/resend', {
            email,
        });
        return res;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};
export const verifyOTP = async ({ email, purpose = 'VERIFY_EMAIL', otp }) => {
    try {
        const res = await Response.POST('auth/otp/verify', {
            email,
            purpose,
            otp,
        });
        return res;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};
