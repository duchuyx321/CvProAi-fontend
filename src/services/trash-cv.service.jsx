import * as Response from '~/utils/HttpsRequest';

export const getTrashCvs = async (params = {}) => {
    try {
        const query = new URLSearchParams({
            ...params,
            is_trash: true,
        }).toString();

        const endpoint = `cvs/me?${query}`;
        const res = await Response.GET(endpoint);
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};

export const restoreMyCv = async (cvId) => {
    try {
        const res = await Response.PATCH(`cvs/${cvId}/restore`, {});
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};

export const forceDeleteMyCv = async (cvId) => {
    try {
        const res = await Response.DELETE(`cvs/${cvId}/force`);
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};