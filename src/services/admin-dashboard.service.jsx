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

export const getAdminDashboard = async (params = {}) => {
    try {
        const queryString = buildQueryString(params);
        const endpoint = queryString
            ? `admin/dashboard?${queryString}`
            : 'admin/dashboard';

        const res = await Response.GET(endpoint);
        return res;
    } catch (error) {
        return error?.response?.data;
    }
};

export const exportAdminDashboardReport = async (
    {from,
    to, 
    range,},
    format = 'excel',
) => {
    
        try {
            const result = await Response.POST(`admin/dashboard/export/${format}`, {},{
                params: {
                    from,
                    to, 
                    range,
                },
                responseType: 'blob',

            });
            
            return result;
        } catch (error) {
            console.log({ error });
            const status = error?.status || error?.response?.status;
            const data = error?.response?.data;
            return { ...data, status };
        }
 

};