import { useRef, useState } from 'react';
import classNames from 'classnames/bind';
import {
    FiCpu,
    FiEdit3,
    FiFileText,
    FiUploadCloud,
    FiX,
} from 'react-icons/fi';

import { MAX_JOB_DESCRIPTION_FILE_SIZE_MB } from '~/utils/jobDescriptionFile.validator';
import styles from './JobDescriptionCard.module.scss';

const cx = classNames.bind(styles);

function JobDescriptionCard({
    jobDescriptionInputMode,
    jobDescriptionText,
    selectedJobDescriptionFile,
    onChangeJobDescriptionInputMode,
    onJobDescriptionTextChange,
    onUploadJobDescriptionFile,
    onRemoveJobDescriptionFile,
    onAnalyze,
    analyzing,
}) {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        onAnalyze();
    };

    const handleChooseFile = () => {
        if (analyzing) return;
        fileInputRef.current?.click();
    };

    const handleChangeFile = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        onUploadJobDescriptionFile(file);
        e.target.value = '';
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (analyzing) return;

        setIsDragging(true);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (analyzing) return;

        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const currentTarget = e.currentTarget;
        const relatedTarget = e.relatedTarget;

        if (currentTarget.contains(relatedTarget)) return;

        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (analyzing) return;

        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];

        if (!file) return;

        onUploadJobDescriptionFile(file);
    };

    const formatFileSize = (fileSize = 0) => {
        if (fileSize < 1024) {
            return `${fileSize} B`;
        }

        if (fileSize < 1024 * 1024) {
            return `${(fileSize / 1024).toFixed(1)} KB`;
        }

        return `${(fileSize / (1024 * 1024)).toFixed(2)} MB`;
    };

    return (
        <form className={cx('card')} onSubmit={handleSubmit}>
            <div className={cx('header')}>
                <span className={cx('titleIcon')}>
                    <FiFileText />
                </span>

                <h2 className={cx('title')}>Mô tả công việc (Job Description)</h2>
            </div>

            <div className={cx('modeTabs')}>
                <button
                    type="button"
                    className={cx('modeButton', {
                        active: jobDescriptionInputMode === 'TEXT',
                    })}
                    onClick={() => onChangeJobDescriptionInputMode('TEXT')}
                    disabled={analyzing}
                >
                    <span className={cx('modeButtonIcon')}>
                        <FiEdit3 />
                    </span>

                    <span className={cx('modeButtonText')}>Văn bản</span>
                </button>

                <button
                    type="button"
                    className={cx('modeButton', {
                        active: jobDescriptionInputMode === 'FILE',
                    })}
                    onClick={() => onChangeJobDescriptionInputMode('FILE')}
                    disabled={analyzing}
                >
                    <span className={cx('modeButtonIcon')}>
                        <FiFileText />
                    </span>

                    <span className={cx('modeButtonText')}>Tài liệu</span>
                </button>
            </div>

            <p className={cx('modeHint')}>
                Chọn 1 cách để cung cấp mô tả công việc.
            </p>

            {jobDescriptionInputMode === 'TEXT' ? (
                <textarea
                    className={cx('textarea')}
                    placeholder="Dán nội dung mô tả công việc tại đây để AI bắt đầu phân tích độ tương thích..."
                    value={jobDescriptionText}
                    onChange={(e) => onJobDescriptionTextChange(e.target.value)}
                    disabled={analyzing}
                />
            ) : (
                <div
                    className={cx('filePanel', {
                        dragging: isDragging,
                        hasFile: selectedJobDescriptionFile,
                    })}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {!selectedJobDescriptionFile ? (
                        <button
                            type="button"
                            className={cx('dropzoneButton')}
                            onClick={handleChooseFile}
                            disabled={analyzing}
                        >
                            <span className={cx('dropzoneIcon')}>
                                <FiUploadCloud />
                            </span>

                            <span className={cx('dropzoneText')}>
                                Kéo và thả file JD vào đây
                            </span>

                            <span className={cx('dropzoneSubText')}>
                                hoặc bấm để chọn file từ máy tính
                            </span>
                        </button>
                    ) : (
                        <div className={cx('selectedFile')}>
                            <div className={cx('selectedFileMain')}>
                                <span className={cx('selectedFileIcon')}>
                                    <FiFileText />
                                </span>

                                <div className={cx('selectedFileInfo')}>
                                    <span className={cx('selectedFileName')}>
                                        {selectedJobDescriptionFile.name}
                                    </span>

                                    <span className={cx('selectedFileMeta')}>
                                        {formatFileSize(
                                            selectedJobDescriptionFile.size,
                                        )}
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                className={cx('removeFileButton')}
                                onClick={onRemoveJobDescriptionFile}
                                disabled={analyzing}
                                aria-label="Xóa file mô tả công việc"
                            >
                                <FiX />
                            </button>
                        </div>
                    )}

                    <p className={cx('uploadHint')}>
                        Hỗ trợ PDF, DOC, DOCX, TXT. Tối đa{' '}
                        {MAX_JOB_DESCRIPTION_FILE_SIZE_MB}MB
                    </p>

                    <input
                        ref={fileInputRef}
                        className={cx('hiddenInput')}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleChangeFile}
                        disabled={analyzing}
                    />
                </div>
            )}

            <div className={cx('actions')}>
                <button
                    type="submit"
                    className={cx('submitButton', { disabled: analyzing })}
                    disabled={analyzing}
                >
                    <FiCpu />
                    <span>
                        {analyzing ? 'Đang phân tích...' : 'Bắt đầu phân tích CV'}
                    </span>
                </button>
            </div>
        </form>
    );
}

export default JobDescriptionCard;