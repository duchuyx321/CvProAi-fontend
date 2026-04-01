import * as Response from '~/utils/HttpsRequest';

export const login = async (email, password) => {
    try {
        const res = await Response.POST('auth/login', { email, password });

        return {
            success: true,
            code: res?.code || 200,
            message: res?.message || 'Đăng nhập thành công',
            data: {
                ...res?.data,
                meta: res?.meta || null,
            },
        };
    } catch (error) {
        const message = error?.response?.data?.message;
        const code = error?.response?.status || error?.response?.data?.code || 500;

        if (message === 'Incorrect password') {
            return { success: false, code, error: 'Pass', message: 'Mật khẩu không chính xác' };
        }

        if (message === 'User not found') {
            return { success: false, code, error: 'Email', message: 'Email không tồn tại' };
        }

        console.error(error);
        return {
            success: false,
            code,
            error: 'Login',
            message: message || error?.message || 'Đăng nhập thất bại',
        };
    }
};

export const register = async ({ fullName, email, password, confirmPassword }) => {
    try {
        const res = await Response.POST('auth/register', { fullName, email, password, confirmPassword });

        return {
            success: true,
            code: res?.code || 200,
            message: res?.message || 'Đăng ký thành công',
            data: {
                ...res?.data,
                meta: res?.meta || null,
            },
        };
    } catch (error) {
        const message = error?.response?.data?.message;
        const code = error?.response?.status || error?.response?.data?.code || 500;

        if (message === 'Full name is invalid') {
            return { success: false, code, error: 'FullName', message: 'Họ tên không hợp lệ' };
        }

        if (message === 'Email already exists' || message === 'Email is invalid') {
            return { success: false, code, error: 'Email', message: 'Email không hợp lệ hoặc đã tồn tại' };
        }

        if (message === 'Password is invalid') {
            return { success: false, code, error: 'Pass', message: 'Mật khẩu không hợp lệ' };
        }

        if (message === 'Confirm password does not match') {
            return { success: false, code, error: 'ConfirmPass', message: 'Mật khẩu xác nhận không khớp' };
        }

        console.error(error);
        return {
            success: false,
            code,
            error: 'Register',
            message: message || error?.message || 'Đăng ký thất bại',
        };
    }
};

export const refresh = async () => {
    try {
        const res = await Response.POST('auth/refresh');

        return {
            success: true,
            code: res?.code || 200,
            message: res?.message || 'Refresh token thành công',
            data: {
                ...res?.data,
                meta: res?.meta || null,
                accessToken: res?.meta?.newAccessToken || res?.accessToken || res?.token || null,
            },
        };
    } catch (error) {
        const message = error?.response?.data?.message;
        const code = error?.response?.status || error?.response?.data?.code || 500;

        console.error(error);
        return {
            success: false,
            code,
            error: 'Refresh',
            message: message || error?.message || 'Refresh token thất bại',
        };
    }
};

export const logout = async () => {
    try {
        const res = await Response.POST('auth/logout');

        return {
            success: true,
            code: res?.code || 200,
            message: res?.message || 'Đăng xuất thành công',
            data: {
                ...res?.data,
                meta: res?.meta || null,
            },
        };
    } catch (error) {
        const message = error?.response?.data?.message;
        const code = error?.response?.status || error?.response?.data?.code || 500;

        console.error(error);
        return {
            success: false,
            code,
            error: 'Logout',
            message: message || error?.message || 'Đăng xuất thất bại',
        };
    }
};