import * as Response from '~/utils/HttpsRequest';

export const getPricing = async () => {
    try {
        const result = await Response.GET(`plans/all?sort_order=ASC`);
        return result;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
