import * as Response from '~/utils/HttpsRequest';

const DEFAULT_ERROR_MESSAGE = 'Có lỗi xảy ra';

const getErrorResponse = (error, fallback = DEFAULT_ERROR_MESSAGE) => ({
    success: false,
    message: error?.response?.data?.message || error?.message || fallback,
    status: error?.response?.status,
    ...(error?.response?.data),
});

export const getPackages = async () => {
    try {
        const res = await Response.GET('admin/plans');
        return res;
    } catch (error) {
        return getErrorResponse(error, 'Không thể tải danh sách gói dịch vụ');
    }
};

export const getPackageDetail = async (slug) => {
    try {
        const res = await Response.GET(`admin/plans/one/${slug}`);
        return res;
    } catch (error) {
        return getErrorResponse(error, 'Không thể tải chi tiết gói dịch vụ');
    }
};

export const createPackage = async (payload) => {
    try {
        const res = await Response.POST('admin/plans/create', payload);
        return res;
    } catch (error) {
        return getErrorResponse(error, 'Tạo gói dịch vụ thất bại');
    }
};

export const updatePackage = async (id, payload) => {
    try {
        const res = await Response.PATCH(`admin/plans/update/${id}`, payload);
        return res;
    } catch (error) {
        return getErrorResponse(error, 'Cập nhật gói dịch vụ thất bại');
    }
};

export const disablePackage = async (id) => {
    try {
        const res = await Response.PATCH(`admin/plans/disable/${id}`, {});
        return res;
    } catch (error) {
        return getErrorResponse(error, 'Tạm ngưng gói dịch vụ thất bại');
    }
};

export const restorePackage = async (id) => {
    try {
        const res = await Response.PATCH(`admin/plans/restore/${id}`, {});
        return res;
    } catch (error) {
        return getErrorResponse(error, 'Khôi phục gói dịch vụ thất bại');
    }
};

export const togglePackageStatus = async (id, enable) => {
    return enable ? restorePackage(id) : disablePackage(id);
};

export const deletePackage = async (id) => {
    try {
        const res = await Response.DELETE(`admin/plans/destroy/${id}`);
        return res;
    } catch (error) {
        return getErrorResponse(error, 'Xóa gói dịch vụ thất bại');
    }
};
