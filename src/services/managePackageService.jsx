import * as Response from '~/utils/HttpsRequest';

const ADMIN_PLANS_ENDPOINT = 'admin/plans';
const DEFAULT_ERROR_MESSAGE = 'Có lỗi xảy ra';

const removeEmptyParams = (params = {}) => {
    return Object.entries(params).reduce((accumulator, [key, value]) => {
        if (value === undefined || value === null || value === '') {
            return accumulator;
        }

        accumulator[key] = value;
        return accumulator;
    }, {});
};

const getErrorResponse = (error, fallback = DEFAULT_ERROR_MESSAGE) => {
    const data = error?.response?.data || {};

    return {
        ...data,
        success: false,
        message:
            data?.error?.[0] ||
            data?.message ||
            error?.message ||
            fallback,
        status: error?.response?.status || error?.status,
    };
};

export const getPackages = async (params = {}) => {
    try {
        return await Response.GET(ADMIN_PLANS_ENDPOINT, {
            params: removeEmptyParams(params),
        });
    } catch (error) {
        return getErrorResponse(error, 'Không thể tải danh sách gói dịch vụ');
    }
};

export const getPackageDetail = async (slug) => {
    try {
        return await Response.GET(`${ADMIN_PLANS_ENDPOINT}/one/${slug}`);
    } catch (error) {
        return getErrorResponse(error, 'Không thể tải chi tiết gói dịch vụ');
    }
};

export const createPackage = async (payload) => {
    try {
        return await Response.POST(`${ADMIN_PLANS_ENDPOINT}/create`, payload);
    } catch (error) {
        return getErrorResponse(error, 'Tạo gói dịch vụ thất bại');
    }
};

export const updatePackage = async (id, payload) => {
    try {
        return await Response.PATCH(`${ADMIN_PLANS_ENDPOINT}/update/${id}`, payload);
    } catch (error) {
        return getErrorResponse(error, 'Cập nhật gói dịch vụ thất bại');
    }
};

export const disablePackage = async (id) => {
    if (!id) {
        return {
            success: false,
            message: 'Không tìm thấy ID gói dịch vụ để khóa',
        };
    }

    try {
        return await Response.PATCH(`${ADMIN_PLANS_ENDPOINT}/disable/${id}`);
    } catch (error) {
        return getErrorResponse(error, 'Khóa gói dịch vụ thất bại');
    }
};

export const restorePackage = async (id) => {
    if (!id) {
        return {
            success: false,
            message: 'Không tìm thấy ID gói dịch vụ để mở khóa',
        };
    }

    try {
        return await Response.PATCH(`${ADMIN_PLANS_ENDPOINT}/restore/${id}`);
    } catch (error) {
        return getErrorResponse(error, 'Mở khóa gói dịch vụ thất bại');
    }
};

export const updatePackageStatus = async (
    id,
    payload = { action: 'disable' },
) => {
    return payload.action === 'restore' ? restorePackage(id) : disablePackage(id);
};
