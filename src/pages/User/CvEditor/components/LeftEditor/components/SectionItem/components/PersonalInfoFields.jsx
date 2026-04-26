import { useId, useMemo } from 'react';
import classNames from 'classnames/bind';
import { FiUploadCloud } from 'react-icons/fi';
import { FaRegUserCircle } from 'react-icons/fa';
import styles from '../SectionItem.module.scss';
import { getFieldLabel, uniqueFieldKeys } from './fieldConfig.utils';

const cx = classNames.bind(styles);

function FieldGroup({ label, children, fullWidth = false }) {
    return (
        <div className={cx('fieldGroup', { fullWidth })}>
            {label ? <label className={cx('label')}>{label}</label> : null}
            {children}
        </div>
    );
}

function BaseInput({
    value,
    onChange,
    type = 'text',
    disabled = false,
    placeholder = '',
}) {
    return (
        <input
            className={cx('input')}
            type={type}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
        />
    );
}

function AvatarUploader({ value, onChange }) {
    const inputId = useId();

    const previewSrc = useMemo(() => {
        return value || '';
    }, [value]);

    const handleChooseFile = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        onChange?.(previewUrl, file);
    };

    const handleDropFile = (event) => {
        event.preventDefault();

        const file = event.dataTransfer.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);
        onChange?.(previewUrl, file);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    return (
        <div className={cx('avatarUploadWrapper')}>
            <div
                className={cx('avatarUploadBox')}
                onDrop={handleDropFile}
                onDragOver={handleDragOver}
            >
                {previewSrc ? (
                    <div className={cx('avatarPreview')}>
                        <img
                            src={previewSrc}
                            alt="Avatar preview"
                            className={cx('avatarPreviewImage')}
                        />
                    </div>
                ) : (
                    <div className={cx('avatarPlaceholder')}>
                        <FaRegUserCircle
                            className={cx('avatarPlaceholderIcon')}
                        />
                    </div>
                )}

                <p className={cx('uploadTitle')}>Kéo thả ảnh vào đây hoặc</p>

                <label htmlFor={inputId} className={cx('uploadButton')}>
                    <FiUploadCloud />
                    <span>Chọn file từ máy tính</span>
                </label>

                <input
                    id={inputId}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    className={cx('hiddenFileInput')}
                    onChange={handleChooseFile}
                />

                {/* <p className={cx('uploadHint')}>
                    Định dạng hỗ trợ: JPG, PNG. Kích thước tối đa: 5MB
                </p> */}
            </div>
        </div>
    );
}

const BASE_PROFILE_FIELDS = new Set(['full_name', 'headline', 'avatar_url']);

function PersonalInfoFields({
    data = {},
    onChangeField,
    sectionKey,
    section = {},
}) {
    const handleChangeAvatar = (nextValue) => {
        onChangeField?.(sectionKey, 'avatar_url', nextValue);
    };
    const extraFieldKeys = uniqueFieldKeys(section?.fields).filter(
        (fieldKey) => !BASE_PROFILE_FIELDS.has(fieldKey),
    );

    return (
        <div className={cx('fieldsGrid')}>
            <FieldGroup label="Họ và tên">
                <BaseInput
                    value={data.full_name}
                    placeholder="Nhập họ và tên"
                    onChange={(e) =>
                        onChangeField?.(sectionKey, 'full_name', e.target.value)
                    }
                />
            </FieldGroup>

            <FieldGroup label="Vị trí ứng tuyển">
                <BaseInput
                    value={data.headline}
                    placeholder="Nhập vị trí ứng tuyển"
                    onChange={(e) =>
                        onChangeField?.(sectionKey, 'headline', e.target.value)
                    }
                />
            </FieldGroup>

            <FieldGroup label="Ảnh đại diện" fullWidth>
                <AvatarUploader
                    value={data.avatar_url}
                    onChange={handleChangeAvatar}
                />
            </FieldGroup>

            {extraFieldKeys.map((fieldKey) => (
                <FieldGroup key={fieldKey} label={getFieldLabel(fieldKey)}>
                    <BaseInput
                        value={data?.[fieldKey]}
                        onChange={(e) =>
                            onChangeField?.(
                                sectionKey,
                                fieldKey,
                                e.target.value,
                            )
                        }
                    />
                </FieldGroup>
            ))}
        </div>
    );
}

export default PersonalInfoFields;
