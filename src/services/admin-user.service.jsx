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
        return await Response.GET(`${ADMIN_USERS_ENDPOINT}/${userId}`);
    } catch (error) {
        return buildErrorResponse(error);
    }
};

export const updateAdminUserStatus = async (
    userId,
    payload = { action: 'lock' },
) => {
    try {
        const isLockAction = payload.action === 'lock';

        const endpoint = isLockAction
            ? `${ADMIN_USERS_ENDPOINT}/banned/${userId}`
            : `${ADMIN_USERS_ENDPOINT}/disbanned/${userId}`;

        return await Response.PATCH(endpoint, payload);
    } catch (error) {
        return buildErrorResponse(error);
    }
};

export const updateAdminUserRole = async (userId, role) => {
    try {
        return await Response.PATCH(`${ADMIN_USERS_ENDPOINT}/role/${userId}`, {
            role,
        });
    } catch (error) {
        return buildErrorResponse(error);
    }
};

export const updateAdminUserSubscription = async (userId, payload = {}) => {
    try {
        return await Response.PATCH(
            `${ADMIN_USERS_ENDPOINT}/subscription/${userId}`,
            removeEmptyParams(payload),
        );
    } catch (error) {
        return buildErrorResponse(error);
    }
};

export const getAdminPlans = async () => {
    try {
        return await Response.GET('plans/all');
    } catch (error) {
        return buildErrorResponse(error);
    }
};

export const getAdminAddonPackages = async (params = {}) => {
    try {
        return await Response.GET('ai-addon-packages', {
            params: removeEmptyParams(params),
        });
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
