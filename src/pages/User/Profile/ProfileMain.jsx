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

const getApiMessage = (response, fallback) => {
    return response?.message || response?.messsage || fallback;
};

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
        id: data.id || '',
        email: data.email || '',
        full_name: data.full_name || '',
        role: data.role || '',

        phone: profile.phone || '',
        avatar_url: profile.avatar_url || '',
        dob: profile.dob || '',
        location: profile.location || '',
        headline: profile.headline || '',
        summary: profile.summary || '',
        links: profile.links || '',
        cover: profile.cover || data.cover || '',

        planCurrent: data.planCurrent || null,
        last_login_at: data.last_login_at || '',
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',

        profile,
    };
};

const getUpdatePayload = (fieldKey, value) => {
    const payloadMap = {
        full_name: 'full_name',
        phone: 'phone',
        summary: 'summary',
        headline: 'headline',
        location: 'location',
        dob: 'dob',
        avatar_url: 'avatar_url',
        links: 'links',
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
    const [loading, setLoading] = useState(true);
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

        return String(user?.[editingField.key] || '').trim();
    }, [editingField, user]);

    const currentValue = fieldValue.trim();
    const isUnchanged = currentValue === initialValue;
    const isSaveDisabled = submitting || !!fieldError || isUnchanged;

    useEffect(() => {
        let cancelled = false;

        const fetchProfile = async () => {
            try {
                setLoading(true);

                const result = await getProfile();

                if (result?.status >= 400 || result?.success === false) {
                    throw new Error(
                        getApiMessage(
                            result,
                            'Không thể tải thông tin cá nhân',
                        ),
                    );
                }

                if (!cancelled) {
                    setUser(mapProfileResponse(result?.data || {}));
                }
            } catch (error) {
                if (!cancelled) {
                    toast.error(
                        error?.response?.data?.message ||
                        error?.response?.data?.messsage ||
                        error?.message ||
                        'Có lỗi xảy ra, vui lòng thử lại sau',
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
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

        setFieldValue(String(user?.[editingField.key] || ''));
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

        if (Object.keys(payload).length === 0) {
            toast.error('Trường cập nhật không hợp lệ');
            return;
        }

        try {
            setSubmitting(true);

            const updatePromise = updateProfile(payload).then((result) => {
                if (result?.status >= 400 || result?.success === false) {
                    throw new Error(
                        getApiMessage(result, 'Cập nhật thông tin thất bại'),
                    );
                }

                return result;
            });

            await toast.promise(updatePromise, {
                pending: 'Đang cập nhật...',
                success: {
                    render({ data }) {
                        return getApiMessage(
                            data,
                            'Cập nhật thông tin thành công',
                        );
                    },
                },
                error: {
                    render({ data }) {
                        return (
                            data?.message ||
                            data?.messsage ||
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
            // toast.promise đã hiển thị lỗi rồi
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

    if (loading) {
        return (
            <div className={cx('wrapper')}>
                <p className={cx('loading')}>Đang tải thông tin cá nhân...</p>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <HeaderMedia
                fullName={user?.full_name || ''}
                summary={user?.summary || ''}
                avatarUrl={user?.avatar_url || ''}
                onAvatarUrlChange={(nextAvatarUrl) =>
                    setUser((prev) => ({
                        ...prev,
                        avatar_url: nextAvatarUrl,
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