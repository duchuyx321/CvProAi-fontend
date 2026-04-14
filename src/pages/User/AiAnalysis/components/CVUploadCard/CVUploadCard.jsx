import { useRef, useState } from 'react';
import classNames from 'classnames/bind';
import {
    FiCheck,
    FiFileText,
    FiPlusCircle,
    FiUploadCloud,
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

function CVUploadCard({
    selectedCV,
    savedCVs,
    loadingSavedCVs,
    onSelectSavedCV,
    onUploadLocalCV,
}) {
    const fileInputRef = useRef(null);
    const [showCollection, setShowCollection] = useState(false);

    const selectedFileName = selectedCV?.name || 'Chưa chọn CV';

    const handleToggleCollection = () => {
        setShowCollection((prev) => !prev);
    };

    const handleChooseLocalFile = () => {
        fileInputRef.current?.click();
    };

    const validateFile = (file) => {
        if (!file) {
            return 'Không tìm thấy file hợp lệ';
        }

        const isValidType = ALLOWED_FILE_TYPES.includes(file.type);

        if (!isValidType) {
            return 'Chỉ hỗ trợ file PDF, DOC hoặc DOCX';
        }

        if (file.size > MAX_FILE_SIZE_BYTES) {
            return `Dung lượng file không được vượt quá ${MAX_FILE_SIZE_MB}MB`;
        }

        return '';
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
        setShowCollection(false);
        e.target.value = '';
    };

    return (
        <div className={cx('card')}>
            <div className={cx('header')}>
                <h2 className={cx('title')}>Chọn CV của bạn</h2>

                <button
                    type="button"
                    className={cx('plusButton')}
                    onClick={handleToggleCollection}
                    aria-label="Mở bộ sưu tập CV"
                >
                    <FiPlusCircle />
                </button>
            </div>

            <div className={cx('selectedFile', { empty: !selectedCV })}>
                <span className={cx('fileIcon')}>
                    <FiFileText />
                </span>

                <span className={cx('fileName')}>{selectedFileName}</span>
            </div>

            <button
                type="button"
                className={cx('uploadButton')}
                onClick={handleChooseLocalFile}
            >
                <FiUploadCloud className={cx('uploadIcon')} />
                <span>Tải lên CV mới</span>
            </button>

            <p className={cx('uploadHint')}>
                Hỗ trợ PDF, DOC, DOCX. Tối đa {MAX_FILE_SIZE_MB}MB
            </p>

            <input
                ref={fileInputRef}
                id="cv-file-input"
                className={cx('hiddenInput')}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleChange}
            />

            {showCollection ? (
                <div className={cx('collectionWrapper')}>
                    <h3 className={cx('collectionTitle')}>
                        CV đã lưu trên CVPro
                    </h3>

                    {loadingSavedCVs ? (
                        <p className={cx('collectionMessage')}>
                            Đang tải danh sách CV...
                        </p>
                    ) : savedCVs.length === 0 ? (
                        <p className={cx('collectionMessage')}>
                            Bạn chưa có CV nào trong bộ sưu tập.
                        </p>
                    ) : (
                        <div className={cx('collectionList')}>
                            {savedCVs.map((cv) => {
                                const cvId = cv?.id ?? cv?.cvId ?? cv?._id;
                                const cvName =
                                    cv?.fileName ||
                                    cv?.title ||
                                    cv?.name ||
                                    cv?.originalFileName ||
                                    'CV chưa đặt tên';

                                const isActive =
                                    selectedCV?.source === 'saved' &&
                                    selectedCV?.id === cvId;

                                return (
                                    <button
                                        key={cvId || cvName}
                                        type="button"
                                        className={cx('collectionItem', {
                                            active: isActive,
                                        })}
                                        onClick={() => {
                                            onSelectSavedCV(cv);
                                            setShowCollection(false);
                                        }}
                                    >
                                        <div className={cx('collectionMain')}>
                                            <span className={cx('itemIcon')}>
                                                <FiFileText />
                                            </span>

                                            <span className={cx('itemName')}>
                                                {cvName}
                                            </span>
                                        </div>

                                        {isActive ? (
                                            <span className={cx('checkIcon')}>
                                                <FiCheck />
                                            </span>
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}

export default CVUploadCard;