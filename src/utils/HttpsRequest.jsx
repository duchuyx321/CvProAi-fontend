import axios from 'axios';

const httpsRequests = axios.create({
    baseURL: import.meta.env.VITE_HTTPS_BACKEND,
    withCredentials: true,
});

const refreshClient = axios.create({
    baseURL: import.meta.env.VITE_HTTPS_BACKEND,
    withCredentials: true,
});

let refreshPromise = null;

const extractAccessToken = (payload) =>
    payload?.data?.meta?.accessToken ||
    payload?.data?.accessToken ||
    payload?.meta?.accessToken ||
    payload?.accessToken ||
    null;

const emitAuthExpired = () => {
    window.dispatchEvent(
        new CustomEvent('auth:expired', {
            detail: {
                message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
            },
        }),
    );
};

const refreshToken = async () => {
    const response = await refreshClient.post('auth/refresh');
    const accessToken = extractAccessToken(response?.data);

    if (!accessToken) {
        throw new Error('No access token');
    }

    localStorage.setItem('accessToken', `Bearer ${accessToken}`);
    return accessToken;
};

const getRefreshToken = async () => {
    if (!refreshPromise) {
        refreshPromise = refreshToken().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
};

httpsRequests.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

httpsRequests.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error?.config;
        const status = error?.response?.status;

        if (!originalRequest) {
            return Promise.reject(error);
        }

        const isAuthRoute =
            originalRequest.url?.includes('auth/login') ||
            originalRequest.url?.includes('auth/refresh') ||
            originalRequest.url?.includes('auth/logout');

        if (status !== 401 || isAuthRoute) {
            return Promise.reject(error);
        }

        if (originalRequest._retry) {
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
            const accessToken = await getRefreshToken();
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return httpsRequests(originalRequest);
        } catch (refreshError) {
            emitAuthExpired();
            return Promise.reject(refreshError);
        }
    },
);

//  config method api
export const GET = async (path, option = {}) => {
    const response = await httpsRequests.get(path, option);
    return response.data;
};

export const POST = async (path, option = {}) => {
    const response = await httpsRequests.post(path, option);
    return response.data;
};
export const PATCH = async (path, option = {}) => {
    const response = await httpsRequests.patch(path, option);
    return response.data;
};
export const DELETE = async (path, option = {}) => {
    const response = await httpsRequests.delete(path, option);
    return response.data;
};
