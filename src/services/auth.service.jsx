import * as Response from '~/utils/HttpsRequest';

export const login = async (email, password) => {
    try {
        const res = await Response.POST('auth/login', { email, password });
        return res;
    } catch (error) {
        const data = error?.response?.data;
        return data;
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
        const data = error?.response?.data;
        return data;
    }
};

export const refresh = async () => {
    try {
        const res = await Response.POST('auth/refresh');
        return res;
    } catch (error) {
        const data = error?.response?.data;
        return data;
    }
};

export const logout = async () => {
    try {
        const res = await Response.POST('auth/logout');
        return res;
    } catch (error) {
        const data = error?.response?.data;
        return data;
    }
};