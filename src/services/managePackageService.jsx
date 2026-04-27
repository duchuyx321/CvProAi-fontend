import * as Response from '~/utils/HttpsRequest';

export const getPackages = async (params = {}) => {
    try {
        const res = await Response.GET('plans/all', params);
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};

export const getPackageDetail = async (packageId) => {
    try {
        const res = await Response.GET(`plans/one/${packageId}`);
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};

export const createPackage = async (payload) => {
    try {
        const res = await Response.POST('plans/create', payload);
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};

export const updatePackage = async (packageId, payload) => {
    try {
        const res = await Response.PATCH(`plans/update/${packageId}`, payload);
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};

export const togglePackageStatus = async (packageId, enabled) => {
    try {
        const res = await Response.PATCH(`plans/update/${packageId}/status`, {
            enabled,
        });
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};

export const deletePackage = async (packageId) => {
    try {
        const res = await Response.DELETE(`plans/destroy/${packageId}`);
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};