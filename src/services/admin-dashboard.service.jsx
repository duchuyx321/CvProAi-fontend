import * as Response from '~/utils/HttpsRequest';

export const getAdminDashboard = async (params = {}) => {
    try {
        const query = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, value);
            }
        });

        const endpoint = `admin/dashboard?${query.toString()}`;
        const res = await Response.GET(endpoint);
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};