export const validateAIAnalysisForm = ({
    selectedCV,
    jobDescriptionInputMode,
    jobDescriptionText,
    jobDescriptionFile,
}) => {
    if (!selectedCV) {
        return 'Vui lòng chọn CV trước khi phân tích';
    }

    if (jobDescriptionInputMode === 'TEXT' && !jobDescriptionText.trim()) {
        return 'Vui lòng nhập mô tả công việc';
    }

    if (jobDescriptionInputMode === 'FILE' && !jobDescriptionFile) {
        return 'Vui lòng tải lên file mô tả công việc';
    }

    return '';
};