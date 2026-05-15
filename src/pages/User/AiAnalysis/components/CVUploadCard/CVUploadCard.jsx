import { useRef } from 'react';
import classNames from 'classnames/bind';
import {
    FiChevronDown,
    FiFilePlus,
    FiFileText,
    FiFolder,
    FiX,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

import styles from './CVUploadCard.module.scss';

const cx = classNames.bind(styles);

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_FILE_EXTENSIONS = ['pdf', 'doc', 'docx'];

const getFileExtension = (fileName = '') => {
    const fileNameParts = fileName.split('.');

    if (fileNameParts.length < 2) return '';

    return fileNameParts.pop().toLowerCase();
};

function CVUploadCard({
    selectedCV,
    loadingSavedCVs,
    showSavedCVSection,
    onToggleSavedCVSection,
    onUploadLocalCV,
    onRemoveCV,
}) {
    const fileInputRef = useRef(null);

    const validateFile = (file) => {
        if (!file) {
            return 'Không tìm thấy file hợp lệ';
        }

        const fileExtension = getFileExtension(file.name);
        const isValidType =
            ALLOWED_FILE_TYPES.includes(file.type) ||
            ALLOWED_FILE_EXTENSIONS.includes(fileExtension);

        if (!isValidType) {
            return 'Chỉ hỗ trợ file PDF, DOC hoặc DOCX';
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return `Dung lượng file không được vượt quá ${MAX_FILE_SIZE_MB}MB`;
        }

        return '';
    };

    const handleChooseLocalFile = () => {
        fileInputRef.current?.click();
    };

    const handleChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        const errorMessage = validateFile(file);

        if (errorMessage) {
            toast.warning(errorMessage);
            e.target.value = '';
            return;
        }

        onUploadLocalCV(file);
        e.target.value = '';
    };

    const selectedSourceLabel =
        selectedCV?.source === 'saved'
            ? 'CV nội bộ từ hệ thống'
            : selectedCV?.source === 'local'
              ? 'CV import từ máy tính'
              : loadingSavedCVs
                ? 'Đang tải danh sách CV...'
                : 'Chọn CV để bắt đầu phân tích';

    const selectedStatusLabel =
        selectedCV?.source === 'saved'
            ? 'CV nội bộ'
            : selectedCV?.source === 'local'
              ? 'File bên ngoài'
              : 'Chưa có CV';

    return (
        <div className={cx('card')}>
            <div className={cx('header')}>
                <div>
                    <h2 className={cx('title')}>Chọn CV của bạn</h2>
                    <p className={cx('subtitle')}>
                        Chọn một nguồn CV để bắt đầu phân tích cùng AI.
                    </p>
                </div>
            </div>

            <div className={cx('actions')}>
                <button
                    type="button"
                    className={cx('actionButton')}
                    onClick={handleChooseLocalFile}
                >
                    <span className={cx('actionIcon')}>
                        <FiFilePlus />
                    </span>

                    <span className={cx('actionText')}>Import CV</span>
                </button>

                <button
                    type="button"
                    className={cx('actionButton', {
                        active: showSavedCVSection,
                    })}
                    onClick={onToggleSavedCVSection}
                    aria-expanded={showSavedCVSection}
                >
                    <span className={cx('actionIcon')}>
                        <FiFolder />
                    </span>

                    <span className={cx('actionText')}>CV của tôi</span>

                    <FiChevronDown
                        className={cx('arrowIcon', {
                            rotate: showSavedCVSection,
                        })}
                    />
                </button>
            </div>

            <input
                ref={fileInputRef}
                className={cx('hiddenInput')}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleChange}
            />

            <div className={cx('selectedFile', { empty: !selectedCV })}>
                <span className={cx('fileIcon')}>
                    <FiFileText />
                </span>

                <div className={cx('selectedInfo')}>
                    <div className={cx('selectedTop')}>
                        <span className={cx('fileName')}>
                            {selectedCV?.name || 'Chưa chọn CV'}
                        </span>

                        <span className={cx('sourceBadge')}>
                            {selectedStatusLabel}
                        </span>
                    </div>

                    <span className={cx('fileSource')}>
                        {selectedSourceLabel}
                    </span>
                </div>

                {selectedCV && (
                    <button
                        type="button"
                        className={cx('removeFileButton')}
                        onClick={onRemoveCV}
                        aria-label="Bỏ chọn CV"
                    >
                        <FiX />
                    </button>
                )}
            </div>

            <p className={cx('uploadHint')}>
                Hỗ trợ PDF, DOC, DOCX. Tối đa {MAX_FILE_SIZE_MB}MB
            </p>
        </div>
    );
}

export default CVUploadCard;