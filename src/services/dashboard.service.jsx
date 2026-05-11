import * as Response from '~/utils/HttpsRequest';

export const getDashboardOverview = async () => {
    try {
        const res = await Response.GET('users/dashboard');
        // const res = result;
        return res;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};
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
export const EXPORT_CONFIG = {
    excel: {
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        extension: 'xlsx',
    },
    pdf: {
        mime: 'application/pdf',
        extension: 'pdf',
    },
    json: {
        mime: 'application/json',
        extension: 'json',
    },
};
export const getFileNameFromHeaders = (headers, fallback) => {
    const contentDisposition =
        headers?.['content-disposition'] ||
        headers?.get?.('content-disposition');

    if (!contentDisposition) return fallback;

    const match = contentDisposition.match(/filename="?([^"]+)"?/);

    return match?.[1] || fallback;
};
export const downloadBlob = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
};

export const exportAdminDashboardReport = async (
    { from, to, range },
    format = 'excel',
) => {
    try {
        const result = await Response.POST(
            `admin/dashboard/export/${format}`,
            {},
            {
                params: {
                    from,
                    to,
                    range,
                },
                responseType: 'blob',
            },
        );

        return result;
    } catch (error) {
        console.log({ error });

        const errorBlob = error?.response?.data;

        if (errorBlob instanceof Blob) {
            const text = await errorBlob.text();

            try {
                const json = JSON.parse(text);
                throw new Error(
                    json?.message ||
                        'Không thể xuất báo cáo. Vui lòng thử lại sau.',
                );
            } catch {
                throw new Error(
                    text || 'Không thể xuất báo cáo. Vui lòng thử lại sau.',
                );
            }
        }

        throw new Error(
            error?.response?.data?.message ||
                error?.message ||
                'Không thể xuất báo cáo. Vui lòng thử lại sau.',
        );
    }
};
