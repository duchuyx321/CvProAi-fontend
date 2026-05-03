import * as Response from '~/utils/HttpsRequest';

export const getPaymentHistory = async ({ page = 1, limit = 10 } = {}) => {
    try {
        const result = await Response.GET(
            `payments?page=${page}&limit=${limit}`,
        );
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getOrders = async () => {
    try {
        const res = await Response.GET('payments');
        return res;
    } catch (error) {
        console.log(error);
        throw error;
    }
}