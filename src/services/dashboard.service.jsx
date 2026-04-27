import * as Response from '~/utils/HttpsRequest';

export const getDashboardOverview = async () => {
    try {
        const res = await Response.GET('users/dashboard');
        // const res = result;
        return res;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};
