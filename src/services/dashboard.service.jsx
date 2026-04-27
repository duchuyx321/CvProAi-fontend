import * as Response from '~/utils/HttpsRequest';
const result = {
    success: true,
    messsage: 'Lấy dữ liệu thành công',
    data: {
        totalCvs: 1,
        cvs: [
            {
                id: '8d416d05-abab-4fed-a868-249e994bec4d',
                user_id: 'c0ca274b-2722-4755-99bb-9e249b3d3dce',
                template_id: '29713ded-64c6-4af0-b11a-1323f3a51eb3',
                title: 'CV Backend Developer Intern - Lê Đức Huy',
                language: 'vi',
                preview_url:
                    'http://res.cloudinary.com/djzsbcrk9/image/upload/v1775665562/cvproai/lbglt6pqbmazd9thj3jf.webp',
                status: 'DRAFT',
                visibility: 'PRIVATE',
                slug: 'cv-backend-developer-intern-le-duc-huy',
                createdAt: '2026-04-08T15:40:37.727Z',
                updatedAt: '2026-04-08T17:05:23.219Z',
            },
        ],
        ai_limit: 3,
        ai_use: 2,
        namePlan: 'Premium',
        totalExport: 0,
    },
    date: '12:43:56 23/4/2026',
    path: '/api/v1/users/dashboard',
};
export const getDashboardOverview = async () => {
    try {
        // const res = await Response.POST('users/dashboard');
        const res = result;
        return res;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};
