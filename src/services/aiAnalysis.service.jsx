const AI_ANALYSIS_ENDPOINT = '/api/ai-analysis';
// TODO: đổi endpoint này đúng với BE hiện tại của bạn

const parseResponse = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const normalizeJobDescriptionInputMode = (mode) => {
    if (mode === 'FILE') return 'FILE';
    return 'TEXT';
};

export const buildAnalyzeCVFormData = ({
    selectedCV,
    jobDescriptionInputMode,
    jobDescriptionText,
    jobDescriptionFile,
}) => {
    const formData = new FormData();
    const normalizedInputMode =
        normalizeJobDescriptionInputMode(jobDescriptionInputMode);
    const normalizedJobDescriptionText = jobDescriptionText.trim();

    formData.append('jobDescriptionInputType', normalizedInputMode);

    if (normalizedInputMode === 'TEXT') {
        formData.append('jobDescriptionText', normalizedJobDescriptionText);
    }

    if (normalizedInputMode === 'FILE' && jobDescriptionFile?.file) {
        formData.append('jobDescriptionFile', jobDescriptionFile.file);
        formData.append('jobDescriptionFileName', jobDescriptionFile.name);
    }

    if (selectedCV?.source === 'saved' && selectedCV?.id != null) {
        formData.append('cvSource', 'saved');
        formData.append('cvId', String(selectedCV.id));
    }

    if (selectedCV?.source === 'local' && selectedCV?.file) {
        formData.append('cvSource', 'local');
        formData.append('cvFile', selectedCV.file);
        formData.append('cvFileName', selectedCV.name || selectedCV.file.name);
    }

    return formData;
};

export const analyzeCVByAI = async (
    {
        selectedCV,
        jobDescriptionInputMode,
        jobDescriptionText,
        jobDescriptionFile,
    },
    options = {},
) => {
    try {
        const formData = buildAnalyzeCVFormData({
            selectedCV,
            jobDescriptionInputMode,
            jobDescriptionText,
            jobDescriptionFile,
        });

        const response = await fetch(AI_ANALYSIS_ENDPOINT, {
            method: 'POST',
            credentials: 'include',
            body: formData,
            signal: options.signal,
        });

        const result = await parseResponse(response);

        if (!response.ok || result?.success === false) {
            return {
                success: false,
                data: null,
                message: result?.message || 'Không thể phân tích CV',
            };
        }

        return {
            success: true,
            data: result?.data ?? result,
            message: result?.message || '',
        };
    } catch (error) {
        if (error?.name === 'AbortError') {
            return {
                success: false,
                data: null,
                message: 'Yêu cầu phân tích đã bị hủy',
            };
        }

        return {
            success: false,
            data: null,
            message: error?.message || 'Không thể phân tích CV',
        };
    }
};

const buildAIAnalysisResultEndpoint = (aiRunId) =>
    `${AI_ANALYSIS_ENDPOINT}/result/${aiRunId}`;

export const getAiAnalysisResultByRunId = async (aiRunId, options = {}) => {
    if (!aiRunId) {
        return {
            success: false,
            data: null,
            message: 'Thiếu aiRunId để tải kết quả phân tích',
        };
    }

    try {
        const response = await fetch(buildAIAnalysisResultEndpoint(aiRunId), {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: options.signal,
        });

        const result = await parseResponse(response);

        if (!response.ok || result?.success === false) {
            return {
                success: false,
                data: null,
                message:
                    result?.message || 'Không thể tải kết quả phân tích',
            };
        }

        return {
            success: true,
            data: result?.data ?? result,
            message: result?.message || '',
        };
    } catch (error) {
        if (error?.name === 'AbortError') {
            return {
                success: false,
                data: null,
                message: 'Yêu cầu tải kết quả phân tích đã bị hủy',
            };
        }

        return {
            success: false,
            data: null,
            message: error?.message || 'Không thể tải kết quả phân tích',
        };
    }
};
