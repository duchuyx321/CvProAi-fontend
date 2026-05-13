import * as Response from '~/utils/HttpsRequest';

const CV_EXPORT_ENDPOINT = 'cv-export';

const buildErrorResponse = (error) => {
    const status = error?.status || error?.response?.status;
    const data = error?.response?.data;

    return {
        success: false,
        message:
            data?.message ||
            error?.message ||
            'Có lỗi xảy ra, vui lòng thử lại sau',
        data: data?.data,
        status,
    };
};

const removeEmptyParams = (params = {}) => {
    return Object.entries(params).reduce((accumulator, [key, value]) => {
        if (value === undefined || value === null || value === '') {
            return accumulator;
        }

        accumulator[key] = value;
        return accumulator;
    }, {});
};

export const getExportHistory = async (params = {}) => {
    try {
        return await Response.GET(CV_EXPORT_ENDPOINT, {
            params: removeEmptyParams({
                limit: params.limit,
                page: params.page,
                search: params.search,
                sort_order: params.sort_order,
                from: params.from,
                to: params.to,
                range: params.range,
                sort_by: params.sort_by,
            }),
        });
    } catch (error) {
        return buildErrorResponse(error);
    }
};

export const downloadExportFile = async (exportId) => {
    try {
        return await Response.POST(
            `${CV_EXPORT_ENDPOINT}/download/${exportId}`,
            {},
            {
                responseType: 'blob',
            },
        );
    } catch (error) {
        return buildErrorResponse(error);
    }
};