import * as Response from '~/utils/HttpsRequest';

const buildQueryString = (params = {}) => {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            query.append(key, value);
        }
    });

    return query.toString();
};

export const getAdminOrders = async (params = {}) => {
    try {
        const queryString = buildQueryString(params);
        const endpoint = queryString
            ? `admin/orders?${queryString}`
            : 'admin/orders';

        const res = await Response.GET(endpoint);
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};

export const exportAdminOrdersReport = async (params = {}) => {
    try {
        const queryString = buildQueryString(params);
        const token = localStorage.getItem('accessToken');
        const baseUrl = import.meta.env.VITE_HTTPS_BACKEND?.replace(/\/$/, '');

        const url = queryString
            ? `${baseUrl}/admin/orders/export?${queryString}`
            : `${baseUrl}/admin/orders/export`;

        const response = await fetch(url, {
            method: 'GET',
            headers: token
                ? {
                      Authorization: `Bearer ${token}`,
                  }
                : {},
            credentials: 'include',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Xuất danh sách đơn hàng thất bại');
        }

        const blob = await response.blob();
        const contentDisposition = response.headers.get('content-disposition');

        let fileName = 'danh-sach-don-hang.xlsx';

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match?.[1]) {
                fileName = match[1];
            }
        }

        return {
            success: true,
            blob,
            fileName,
        };
    } catch (error) {
        return {
            success: false,
            message: error?.message || 'Xuất danh sách đơn hàng thất bại',
        };
    }
};