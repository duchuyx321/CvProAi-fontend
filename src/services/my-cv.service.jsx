import * as Response from '~/utils/HttpsRequest';

export const getMyCvs = async (params = {}) => {
    try {
        const query = new URLSearchParams({
            ...params,
            is_trash: false,
        }).toString();

        const endpoint = `cvs/me?${query}`;
        const res = await Response.GET(endpoint);
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};

export const softDeleteMyCv = async (cvId) => {
    try {
        const res = await Response.DELETE(`cvs/delete/${cvId}`);
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};