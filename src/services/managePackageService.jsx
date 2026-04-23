import * as Response from '~/utils/HttpsRequest';

export const getPackages = async (params = {}) => {
    try {
        const res = await Response.GET('admin/packages', params);
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};

export const getPackageDetail = async (packageId) => {
    try {
        const res = await Response.GET(`admin/packages/${packageId}`);
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};

export const createPackage = async (payload) => {
    try {
        const res = await Response.POST('admin/packages', payload);
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};

export const updatePackage = async (packageId, payload) => {
    try {
        const res = await Response.PATCH(`admin/packages/${packageId}`, payload);
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};

export const togglePackageStatus = async (packageId, enabled) => {
    try {
        const res = await Response.PATCH(`admin/packages/${packageId}/status`, {
            enabled,
        });
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};

export const deletePackage = async (packageId) => {
    try {
        const res = await Response.DELETE(`admin/packages/${packageId}`);
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};