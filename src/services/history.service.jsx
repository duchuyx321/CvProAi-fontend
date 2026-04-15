import * as Response from '~/utils/HttpsRequest';

export const getExportHistory = async () => {
    try {
        const res = await Response.GET('export/history');
        return res;
    } catch (error) {
        const data = error?.response?.data;
        return data;
    }
};