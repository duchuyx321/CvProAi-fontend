import * as Response from '~/utils/HttpsRequest';

export const getDetailCheckout = async (payment_id) => {
    try {
        const res = await Response.GET(`payments/checkout/${payment_id}`);
        return res;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};
