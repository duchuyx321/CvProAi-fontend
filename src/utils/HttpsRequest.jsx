import axios from 'axios';

const httpsRequests = axios.create({
    baseURL: import.meta.env.VITE_HTTPS_BACKEND,
    withCredentials: true, // đẩy cookie
});

httpsRequests.interceptors.request.use(
    (config) => {
        // check token accesstoken & refeshToken
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        throw new Error(error);
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
}
export const DELETE = async (path, option = {}) => {
    const response = await httpsRequests.delete(path, option);
    return response.data;
};