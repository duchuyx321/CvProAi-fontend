import * as Response from '~/utils/HttpsRequest';

export const getAnalysisHistory = async (params) => {
    try {
        const res = await Response.get('/analysis-history', { params });
        return res.data;
    } catch (error) {
        console.error('Error fetching analysis history:', error);
        throw error;
    }
};
export const exportAnalysisHistory = async (params = {}) => {
    try {
        const res = await Response.get('/analysis-history/export', {
            params,
            responseType: 'blob', 
        });
        return res.data;  
    } catch (error) {
        console.error('Error exporting analysis history:', error);
        throw error;
    }   
};
