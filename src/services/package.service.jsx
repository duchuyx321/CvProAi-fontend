import * as Response from '~/utils/HttpsRequest';

export const getMyPackage = async () => {
    try {
        const result = await Response.GET('package');
        return result
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const cancelPackageSubscription = async () => {
    try {
        const result = await Response.POST('package/cancel');
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
};