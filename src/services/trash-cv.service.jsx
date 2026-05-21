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

export const getTrashCvs = async (params = {}) => {
    try {
        const query = new URLSearchParams(
            removeEmptyParams({
                ...params,
                is_trash: true,
            }),
        ).toString();

        return await Response.GET(`cvs/me?${query}`);
    } catch (error) {
        return buildErrorResponse(error);
    }
};

export const restoreMyCv = async (cvId) => {
    try {
        return await Response.PATCH(`cvs/restore/${cvId}`);
    } catch (error) {
        return buildErrorResponse(error);
    }
};

export const forceDeleteMyCv = async (cvId) => {
    try {
        return await Response.DELETE(`cvs/destroy/${cvId}`);
    } catch (error) {
        return buildErrorResponse(error);
    }
};