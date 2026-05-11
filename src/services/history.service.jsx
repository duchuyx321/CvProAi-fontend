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

export const getAllOrders = async (params = {}) => {
    try {
        const query = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                query.append(key, value);
            }
        });

        const endpoint = query.toString()
            ? `admin/payments?${query.toString()}`
            : 'admin/payments';

        const res = await Response.GET(endpoint);

        return res;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const getOrderDetail = async (code) => {
    try {
        if (!code) {
            throw new Error('Thiếu mã đơn hàng');
        }

        const safeCode = encodeURIComponent(code);
        const res = await Response.GET(`admin/payments/${safeCode}`);

        return res;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

export const editOrder = async (code, id, data) => {
    try {
        if (!code) {
            throw new Error('Thiếu mã đơn hàng');
        }

        if (!id) {
            throw new Error('Thiếu ID đơn hàng');
        }

        const safeCode = encodeURIComponent(code);
        const safeId = encodeURIComponent(id);

        const res = await Response.PATCH(
            `admin/payments/edit/${safeCode}?id=${safeId}`,
            data,
        );

        return res;
    } catch (error) {
        console.log(error);
        throw error;
    }
};