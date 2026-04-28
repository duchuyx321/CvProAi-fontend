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
export const checkStatus = async (payment_id) => {
    try {
        const res = await Response.GET(`payments/statuseckout/${payment_id}`);
        return res;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};

export const getPaymentOrderDetails = async (orderId) => {
    try {
        if (!orderId) {
            throw new Error('Không có mã giao dịch.');
        }
        const res = await Response.GET(`payments/checkout/status/${orderId}`);
        return res;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};
