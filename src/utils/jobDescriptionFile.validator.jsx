export const MAX_JOB_DESCRIPTION_FILE_SIZE_MB = 5;
export const MAX_JOB_DESCRIPTION_FILE_SIZE_BYTES =
    MAX_JOB_DESCRIPTION_FILE_SIZE_MB * 1024 * 1024;

const ALLOWED_JOB_DESCRIPTION_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
];

const ALLOWED_JOB_DESCRIPTION_EXTENSIONS = ['pdf', 'doc', 'docx', 'txt'];

const getFileExtension = (fileName = '') => {
    const fileNameParts = fileName.split('.');

    if (fileNameParts.length < 2) return '';

    return fileNameParts.pop().toLowerCase();
};

export const validateJobDescriptionFile = (file) => {
    if (!file) {
        return 'Không tìm thấy file mô tả công việc hợp lệ';
    }

    const fileExtension = getFileExtension(file.name);
    const isValidFileType =
        ALLOWED_JOB_DESCRIPTION_FILE_TYPES.includes(file.type) ||
        ALLOWED_JOB_DESCRIPTION_EXTENSIONS.includes(fileExtension);

    if (!isValidFileType) {
        return 'File mô tả công việc chỉ hỗ trợ PDF, DOC, DOCX hoặc TXT';
    }

    if (file.size > MAX_JOB_DESCRIPTION_FILE_SIZE_BYTES) {
        return `Dung lượng file mô tả công việc không được vượt quá ${MAX_JOB_DESCRIPTION_FILE_SIZE_MB}MB`;
    }

    return '';
};