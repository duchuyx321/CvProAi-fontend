export const buildAnalyzeCVFormData = ({
    selectedCV,
    jobDescriptionInputMode,
    jobDescriptionText,
    jobDescriptionFile,
}) => {
    const formData = new FormData();

    formData.append('jobDescriptionInputType', jobDescriptionInputMode);

    if (jobDescriptionInputMode === 'TEXT') {
        formData.append('jobDescriptionText', jobDescriptionText.trim());
    }

    if (jobDescriptionInputMode === 'FILE' && jobDescriptionFile?.file) {
        formData.append('jobDescriptionFile', jobDescriptionFile.file);
        formData.append('jobDescriptionFileName', jobDescriptionFile.name);
    }

    if (selectedCV?.source === 'saved' && selectedCV?.id) {
        formData.append('cvSource', 'saved');
        formData.append('cvId', selectedCV.id);
    }

    if (selectedCV?.source === 'local' && selectedCV?.file) {
        formData.append('cvSource', 'local');
        formData.append('cvFile', selectedCV.file);
    }

    return formData;
};