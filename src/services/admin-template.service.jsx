import * as Response from '~/utils/HttpsRequest';

export const getAllTemplate = async ({
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
    if (search.trim()) {
        queryUrl += `&search=${encodeURIComponent(search.trim())}`;
    }
    if (!from && !to && !range) {
        queryUrl += `&range=7d`;
    } else if (from && to && !range) {
        queryUrl += `&from=${from}&to=${to}`;
    } else if (range && !from && !to) {
        queryUrl += `&range=${range}`;
    }
    try {
        const res = await Response.GET(`admin/cv-templates?${queryUrl}`);
        return res.data;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};
