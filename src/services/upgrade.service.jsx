import * as Response from '~/utils/HttpsRequest';

export const getPackageBySlug = async (slug) => {
    try {
        if (!slug) {
            throw new Error('Không có slug gửi lên.');
        }
        const result = await Response.GET(`plans/one/${slug}`);
        // const result = FALLBACK_PACKAGES;
        return result;
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
            throw new Error('dữ liệu gửi lên không hợp lệ.');
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
        const result = await Response.POST('payments/create', {
            paymentable_type,
            plan_id,
            addon_package_id,
        });
        
        return result;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};

export const getAiAddonPackages = async ({
    page = 1,
    limit = 20,
    search = '',
    sort_by = 'createdAt',
    sort_order = 'DESC',
} = {}) => {
    let queryUrl = `limit=${limit}&page=${page}&sort_by=${sort_by}&sort_order=${sort_order}`;

    queryUrl += `&search=${encodeURIComponent(search.trim())}`;

    try {
        const result = await Response.GET(`ai-addon-packages?${queryUrl}`);
        console.log(result);
        return result;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;

        return { ...data, status };
    }
};

export const createAiAddonPackage = async ({
    name,
    description,
    price,
    runs,
    is_active = true,
} = {}) => {
    try {
        const result = await Response.POST('ai-addon-packages/create', {
            name,
            description,
            price,
            runs,
            is_active,
        });

        console.log(result);

        return result;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;

        return { ...data, status };
    }
};