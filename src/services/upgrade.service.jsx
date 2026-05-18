import * as Response from '~/utils/HttpsRequest';

export const getPackageBySlug = async (slug) => {
    try {
        if (!slug) {
            throw new Error('Không có slug gửi lên.');
        }

        return await Response.GET(`plans/one/${slug}`);
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;

        return { ...data, status };
    }
};

export const createPayment = async (
    paymentable_type,
    plan_id,
    addon_package_id,
) => {
    try {
        if (!paymentable_type) {
            throw new Error('Dữ liệu gửi lên không hợp lệ.');
        }
        if (paymentable_type === 'SUBSCRIPTION' && !plan_id) {
            throw new Error('Vui lòng chọn gói.');
        }
        if (paymentable_type === 'AI_ADDON' && !addon_package_id) {
            throw new Error('Vui lòng chọn gói.');
        }
        if (paymentable_type === 'BOTH' && (!plan_id || !addon_package_id)) {
            throw new Error('Vui lòng chọn gói.');
        }

        return await Response.POST('payments/create', {
            paymentable_type,
            plan_id,
            addon_package_id,
        });
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;

        return {
            ...data,
            status,
            success: false,
            message: data?.message || error?.message,
        };
    }
};
