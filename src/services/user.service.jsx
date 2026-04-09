import * as Response from '~/utils/HttpsRequest';
export const getMe = async () => {
    try {
        const res = Response.POST('user/me');
        return res;
    } catch (e) {
        console.log(e);
    }
};
