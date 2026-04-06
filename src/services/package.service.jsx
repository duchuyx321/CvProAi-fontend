import * as Response from '~/utils/HttpsRequest';

export const getCurrentPackage = async () => {
    try {
        const res = await Response.GET('package/current');
        return res;
    } catch (error) {
        const data = error?.response?.data;
        return data;
    }
};

export const cancelPackageRenew = async () => {
    try {
        const res = await Response.POST('package/cancel-renew');
        return res;
    } catch (error) {
        const data = error?.response?.data;
        return data;
    }
};