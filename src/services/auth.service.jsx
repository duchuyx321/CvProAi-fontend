import * as Response from '~/utils/HttpsRequest';

const getErrorMessage = (error, fallback = 'Có lỗi xảy ra') => {
    return error?.response?.data?.message || error?.message || fallback;
};

const getErrorCode = (error) => {
    return error?.response?.status || error?.response?.data?.code || 500;
};

const createSuccessResponse = (res, defaultMessage) => {
    return {
        success: true,
        code: res?.code || 200,
        message: res?.message || defaultMessage,
        data: res?.data || null,
        meta: res?.meta || null,
    };
};

const createErrorResponse = (error, defaultError, defaultMessage) => {
    return {
        success: false,
        code: getErrorCode(error),
        error: defaultError,
        message: getErrorMessage(error, defaultMessage),
    };
};

export const login = async (email, password) => {
    try {
        const res = await Response.POST('auth/login', {
            email,
            password,
        });

        return createSuccessResponse(res, 'Đăng nhập thành công');
    } catch (error) {
        const message = error?.response?.data?.message;

        if (message === 'Incorrect password') {
            return {
                success: false,
                code: getErrorCode(error),
                error: 'Pass',
                message: 'Mật khẩu không chính xác',
            };
        }

        if (message === 'User not found') {
            return {
                success: false,
                code: getErrorCode(error),
                error: 'Email',
                message: 'Email không tồn tại',
            };
        }

        console.error(error);

        return createErrorResponse(error, 'Login', 'Đăng nhập thất bại');
    }
};

export const register = async ({
    fullName,
    email,
    password,
    confirmPassword,
}) => {
    try {
        const res = await Response.POST('auth/register', {
            fullName,
            email,
            password,
            confirmPassword,
        });

        return createSuccessResponse(res, 'Đăng ký thành công');
    } catch (error) {
        const message = error?.response?.data?.message;
        const code = getErrorCode(error);

        if (message === 'Full name is invalid') {
            return {
                success: false,
                code,
                error: 'FullName',
                message: 'Họ tên không hợp lệ',
            };
        }

        if (
            message === 'Email already exists' ||
            message === 'Email is invalid'
        ) {
            return {
                success: false,
                code,
                error: 'Email',
                message: 'Email không hợp lệ hoặc đã tồn tại',
            };
        }

        if (message === 'Password is invalid') {
            return {
                success: false,
                code,
                error: 'Pass',
                message: 'Mật khẩu không hợp lệ',
            };
        }

        if (message === 'Confirm password does not match') {
            return {
                success: false,
                code,
                error: 'ConfirmPass',
                message: 'Mật khẩu xác nhận không khớp',
            };
        }

        console.error(error);

        return createErrorResponse(error, 'Register', 'Đăng ký thất bại');
    }
};

export const refresh = async () => {
    try {
        const res = await Response.POST('auth/refresh');
        const response = createSuccessResponse(res, 'Refresh token thành công');

        return {
            ...response,
            accessToken:
                res?.meta?.newAccessToken ||
                res?.accessToken ||
                res?.token ||
                null,
        };
    } catch (error) {
        console.error(error);

        return createErrorResponse(error, 'Refresh', 'Refresh token thất bại');
    }
};

export const logout = async () => {
    try {
        const res = await Response.POST('auth/logout');
        return createSuccessResponse(res, 'Đăng xuất thành công');
    } catch (error) {
        console.error(error);

        return createErrorResponse(error, 'Logout', 'Đăng xuất thất bại');
    }
};