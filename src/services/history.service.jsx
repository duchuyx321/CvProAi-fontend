import * as Response from '~/utils/HttpsRequest';

export const getPaymentHistory = async () => {
    try {
        const res = await Response.GET('payment/history');
        return res;
    } catch (error) {
        const data = error?.response?.data;
        return data;
    }
};