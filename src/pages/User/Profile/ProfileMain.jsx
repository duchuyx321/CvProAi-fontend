import { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import Modal from '~/components/Modal';
import Input from '~/components/Input';
import Button from '~/components/Button';
import HeaderMedia from './components/HeaderMedia';
import SectionItem from './components/SectionItem';
import { validateRegex } from '~/utils/auth.validator';
import { getProfile, updateProfile } from '~/services/profile.service';

import styles from './ProfileMain.module.scss';

const cx = classNames.bind(styles);

const getValidateKey = (fieldKey) => {
    if (fieldKey === 'full_name') return 'fullName';

    return fieldKey;
};

const validateFieldValue = (fieldKey, value, fieldConfig) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
        if (fieldConfig?.required) {
            return 'Trường này không được để trống';
        }

        return '';
    }

    const validateKey = getValidateKey(fieldKey);
    const rule = validateRegex[validateKey];

    if (rule && !rule.regex.test(trimmedValue)) {
        return rule.message;
    }

    return '';
};


const mapProfileResponse = (data = {}) => {
    const profile = data.profile || {};

    return {
        ...data,

        phone: profile.phone ?? '',
        summary: profile.summary ?? '',
        avatar_url: profile.avatar_url ?? '',
        cover: profile.cover ?? data.cover ?? '',

        profile,
    };
};


const getUpdatePayload = (fieldKey, value) => {
    const payloadMap = {
        full_name: 'name', 
        phone: 'phone',
        email: 'email',
        summary: 'summary',
    };

    const payloadKey = payloadMap[fieldKey];

    if (!payloadKey) {
        return {};
    }

    return {
        [payloadKey]: value,
    };
};

function ProfileMain({ LIST_CONTENT = [] }) {
    const [user, setUser] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [fieldValue, setFieldValue] = useState('');
    const [fieldError, setFieldError] = useState('');

    const fieldList = useMemo(() => {
        return LIST_CONTENT.map((item) => {
            const rawValue = user?.[item.key];

            const value =
                typeof rawValue === 'string'
                    ? rawValue.trim()
                    : rawValue
                      ? String(rawValue)
                      : '';

            return {
                ...item,
                value,
                displayValue: value || 'Chưa cập nhật',
            };
        });
    }, [LIST_CONTENT, user]);

    const initialValue = useMemo(() => {
        if (!editingField?.key) return '';

        return (user?.[editingField.key] || '').trim();
    }, [editingField, user]);

    const currentValue = fieldValue.trim();
    const isUnchanged = currentValue === initialValue;
    const isSaveDisabled = submitting || !!fieldError || isUnchanged;

    useEffect(() => {
        let cancelled = false;

        const fetchProfile = async () => {
            try {
                const result = await getProfile();

                if (!result?.success) {
                    throw new Error(
                        result?.message || 'Không thể tải thông tin cá nhân',
                    );
                }

                if (!cancelled) {
                    setUser(mapProfileResponse(result?.data || {}));
                }
            } catch (error) {
                if (!cancelled) {
                    toast.error(
                        error?.response?.data?.message ||
                            error?.message ||
                            'Có lỗi xảy ra, vui lòng thử lại sau',
                    );
                }
            }
        };

        fetchProfile();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!editingField?.key) {
            setFieldValue('');
            setFieldError('');
            return;
        }

        setFieldValue(user?.[editingField.key] || '');
        setFieldError('');
    }, [editingField, user]);

    const handleOpenModal = (field) => {
        if (submitting || field.readonly) return;

        setEditingField(field);
    };

    const handleCloseModal = () => {
        if (submitting) return;

        setEditingField(null);
    };

    const handleChangeValue = (value) => {
        setFieldValue(value);

        if (!editingField?.key) return;

        const nextError = validateFieldValue(
            editingField.key,
            value,
            editingField,
        );

        setFieldError(nextError);
    };

    const handleSave = async () => {
        if (!editingField?.key || submitting) return;

        const currentField = editingField;

        const nextError = validateFieldValue(
            currentField.key,
            fieldValue,
            currentField,
        );

        setFieldError(nextError);

        if (nextError || isUnchanged) return;

        const payload = getUpdatePayload(currentField.key, currentValue);

        console.log('Update field:', currentField.key);
        console.log('Update payload:', payload);

        if (Object.keys(payload).length === 0) {
            toast.error('Trường cập nhật không hợp lệ');
            return;
        }

        try {
            setSubmitting(true);

            const updatePromise = updateProfile(payload).then((result) => {
                console.log('Update profile result:', result);

                if (!result?.success) {
                    throw new Error(
                        result?.message || 'Cập nhật thông tin thất bại',
                    );
                }

                return result;
            });

            await toast.promise(updatePromise, {
                pending: 'Đang cập nhật...',
                success: {
                    render({ data }) {
                        return data?.message || 'Cập nhật thông tin thành công';
                    },
                },
                error: {
                    render({ data }) {
                        return (
                            data?.message ||
                            'Có lỗi xảy ra, vui lòng thử lại sau'
                        );
                    },
                },
            });

            const profileResult = await getProfile();

            if (profileResult?.success) {
                setUser(mapProfileResponse(profileResult?.data || {}));
            } else {
                setUser((prev) => ({
                    ...prev,
                    [currentField.key]: currentValue,
                }));
            }

            setEditingField(null);
        } catch {
            // toast.promise đã hiển thị lỗi rồi, không cần xử lý thêm
        } finally {
            setSubmitting(false);
        }
    };

    const renderFieldInput = () => {
        if (!editingField) return null;

        if (editingField.type === 'textarea') {
            return (
                <div className={cx('field')}>
                    <label className={cx('label')} htmlFor={editingField.key}>
                        {editingField.label}
                    </label>

                    <textarea
                        id={editingField.key}
                        className={cx('textarea', { error: !!fieldError })}
                        value={fieldValue}
                        placeholder={editingField.placeholder}
                        onChange={(e) => handleChangeValue(e.target.value)}
                        rows={editingField.rows || 5}
                        disabled={submitting}
                    />

                    {fieldError ? (
                        <p className={cx('error')}>{fieldError}</p>
                    ) : null}
                </div>
            );
        }

        return (
            <div className={cx('field')}>
                <Input
                    id={editingField.key}
                    type={editingField.type || 'text'}
                    label={editingField.label}
                    value={fieldValue}
                    placeholder={editingField.placeholder}
                    onChange={(e) => handleChangeValue(e.target.value)}
                    error={fieldError}
                    inputClassName={cx('input')}
                    disabled={submitting}
                    fullWidth
                />
            </div>
        );
    };

    return (
        <div className={cx('wrapper')}>
            <HeaderMedia
                fullName={user?.full_name || ''}
                summary={user?.summary || ''}
                avatarUrl={user?.avatar_url || ''}
                cover={user?.cover || ''}
                onAvatarUrlChange={(nextAvatarUrl) =>
                    setUser((prev) => ({
                        ...prev,
                        avatar_url: nextAvatarUrl,
                    }))
                }
                onCoverChange={(nextCover) =>
                    setUser((prev) => ({
                        ...prev,
                        cover: nextCover,
                    }))
                }
            />

            <section className={cx('section')}>
                <div className={cx('header')}>
                    <h2 className={cx('title')}>Thông tin cơ bản</h2>
                    <p className={cx('desc')}>
                        Quản lý tên hiển thị, thông tin liên lạc và tiểu sử của
                        bạn.
                    </p>
                </div>

                <div className={cx('list')}>
                    {fieldList.map((item) => (
                        <SectionItem
                            key={item.key}
                            label={item.label}
                            value={item.displayValue}
                            onClick={() => handleOpenModal(item)}
                        />
                    ))}
                </div>
            </section>

            <Modal
                isOpen={Boolean(editingField)}
                onClose={handleCloseModal}
                title={editingField ? `Cập nhật ${editingField.label}` : ''}
                description={editingField?.description || ''}
                size="md"
                footer={
                    <div className={cx('actions')}>
                        <Button
                            primary
                            type="button"
                            disabled={isSaveDisabled}
                            onClick={handleSave}
                        >
                            Lưu
                        </Button>
                    </div>
                }
            >
                <div className={cx('body')}>{renderFieldInput()}</div>
            </Modal>
        </div>
    );
}

export default ProfileMain;