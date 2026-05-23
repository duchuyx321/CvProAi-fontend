import * as Response from '~/utils/HttpsRequest';

const removeEmptyParams = (params = {}) => {
    return Object.entries(params).reduce((accumulator, [key, value]) => {
        if (value === undefined || value === null || value === '') {
            return accumulator;
        }

        accumulator[key] = value;
        return accumulator;
    }, {});
};

const buildErrorResponse = (error) => {
    return (
        error?.response?.data || {
            success: false,
            message: error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
        }
    );
};

export const getMyCvs = async (params = {}) => {
    try {
        const query = new URLSearchParams(
            removeEmptyParams({
                ...params,
                is_trash: false,
            }),
        ).toString();

        const endpoint = `cvs/me?${query}`;
        return await Response.GET(endpoint);
    } catch (error) {
        return buildErrorResponse(error);
    }
};

export const softDeleteMyCv = async (cvId) => {
    try {
        return await Response.DELETE(`cvs/delete/${cvId}`);
    } catch (error) {
        return buildErrorResponse(error);
    }
};