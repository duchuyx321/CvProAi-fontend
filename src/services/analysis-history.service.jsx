import * as Response from '~/utils/HttpsRequest';

export const getAnalysisHistory = async ({
    page = 1,
    limit = 8,
    to,
    from,
    range,
    search = '',
    sort_by = 'createdAt',
    sort_order = 'DESC',
} = {}) => {
    let queryUrl = `limit=${limit}&page=${page}&sort_by=${sort_by}&sort_order=${sort_order}`;

    if (search.trim()) {
        queryUrl += `&search=${encodeURIComponent(search.trim())}`;
    }

    if (!from && !to && !range) {
        queryUrl += `&range=7d`;
    } else if (from && to && !range) {
        queryUrl += `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    } else if (range && !from && !to) {
        queryUrl += `&range=${encodeURIComponent(range)}`;
    }

    try {
        const res = await Response.GET(`ai-analysis?${queryUrl}`);

        return res.data;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data || {};

        return {
            ...data,
            status,
            success: false,
        };
    }
};
