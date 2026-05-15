import * as Response from '~/utils/HttpsRequest';

export const getMyPayments = async ({
    limit = 8,
    page = 1,
    from,
    to,
    range,
    search = '',
    sort_by = 'updatedAt',
    sort_order = 'DESC',
} = {}) => {
    let queryUrl = `limit=${limit}&page=${page}&sort_by=${sort_by}&sort_order=${sort_order}`;

    queryUrl += `&search=${encodeURIComponent(search.trim())}`;

    if (!from && !to && !range) {
        queryUrl += `&range=30d`;
    } else if (from && to && !range) {
        queryUrl += `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    } else if (range && !from && !to) {
        queryUrl += `&range=${encodeURIComponent(range)}`;
    }

    try {
        const res = await Response.GET(`payments/me?${queryUrl}`);
        return res;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};

export const getAllOrders = async (params = {}) => {
    try {
        const query = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            const nextValue =
                typeof value === 'string' ? value.trim() : value;

            if (
                nextValue !== undefined &&
                nextValue !== null &&
                nextValue !== ''
            ) {
                query.append(key, nextValue);
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

        const safeId = encodeURIComponent(id);

        const res = await Response.PATCH(`admin/payments/edit/${safeId}`, data);

        return res;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
