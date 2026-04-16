import * as Response from '~/utils/HttpsRequest';

export const buildAnalyzeCVFormData = ({ cvInput, jdInput }) => {
    const formData = new FormData();

    if (
        cvInput?.type === 'ID' &&
        cvInput?.cv_id != null &&
        cvInput.cv_id !== ''
    ) {
        formData.append('cv_id', String(cvInput.cv_id));
    } else if (cvInput?.type === 'FILE' && cvInput?.cv_file) {
        formData.append('cv_file', cvInput.cv_file);
    }

    if (jdInput?.type === 'TEXT' && jdInput?.jd_text?.trim()) {
        formData.append('jd_text', jdInput.jd_text.trim());
    } else if (jdInput?.type === 'FILE' && jdInput?.jd_file) {
        formData.append('jd_file', jdInput.jd_file);
    }

    return formData;
};

export const analyzeCV = async (formData) => {
    try {
        const res = await Response.POST('ai-analysis/analyze', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, success: false, status };
    }
};
export const getAiAnalysisResultByRunId = async (aiRunId) => {
    try {
        const res = await Response.GET(`ai-analysis/result/${aiRunId}`);
        return res;
    } catch (error) {
        const status = error?.status || error?.response?.status;
        const data = error?.response?.data;
        return { ...data, status };
    }
};
