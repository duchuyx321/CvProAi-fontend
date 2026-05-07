import * as Response from '~/utils/HttpsRequest';

const ADMIN_USERS_ENDPOINT = 'admin/users';

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

export const getAdminUsers = async (params = {}) => {
    try {
        return await Response.GET(ADMIN_USERS_ENDPOINT, {
            params: removeEmptyParams(params),
        });
    } catch (error) {
        return buildErrorResponse(error);
    }
};


export const getAdminUserDetail = async (userId) => {
    try {
        return await Response.GET(`${ADMIN_USERS_ENDPOINT}?id=${userId}`);
    } catch (error) {
        return buildErrorResponse(error);
    }
};

export const updateAdminUserStatus = async (
    userId,
    payload = { action: 'lock' },
) => {
    try {
        const endpointAction = payload.action === 'lock' ? 'banned' : 'disbanned';
        
        // Vừa để id trong path, vừa chèn thêm ?id=... vào query
        // Đồng thời không truyền thêm tham số thứ 2 (body) vào hàm PATCH
        return await Response.PATCH(
            `${ADMIN_USERS_ENDPOINT}/${endpointAction}/${userId}?id=${userId}`
        );
    } catch (error) {
        return buildErrorResponse(error);
    }
};

export const createAdminUser = async (payload = {}) => {
    try {
        return await Response.POST(ADMIN_USERS_ENDPOINT, payload);
    } catch (error) {
        return buildErrorResponse(error);
    }
};
