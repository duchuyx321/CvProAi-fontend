import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import { MdOutlineCameraAlt } from 'react-icons/md';
import { toast } from 'react-toastify';

import Button from '~/components/Button';
import { updateProfile } from '~/services/profile.service';
import styles from './HeaderMedia.module.scss';

const cx = classNames.bind(styles);

const getInitial = (fullName = '') => {
    const words = fullName.trim().split(' ').filter(Boolean);

    if (!words.length) return 'U';

    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    return (
        words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
};

const readFileAsDataUrl = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Không thể đọc file'));

        reader.readAsDataURL(file);
    });
};

const getApiMessage = (response, fallback) => {
    return response?.message || response?.messsage || fallback;
};

function HeaderMedia({
    fullName = '',
    summary = '',
    avatarUrl = '',
    onAvatarUrlChange,
}) {
    const avatarInputRef = useRef(null);

    const [avatarPreview, setAvatarPreview] = useState(avatarUrl || '');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setAvatarPreview(avatarUrl || '');
    }, [avatarUrl]);

    const handleOpenImagePicker = () => {
        if (submitting) return;

        avatarInputRef.current?.click();
    };

    const handleChangeAvatar = async (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        try {
            setSubmitting(true);

            const previewUrl = await readFileAsDataUrl(file);
            setAvatarPreview(previewUrl);

            const updatePromise = updateProfile({
                avatarFile: file,
            }).then((result) => {
                if (result?.status >= 400 || result?.success === false) {
                    throw new Error(
                        getApiMessage(
                            result,
                            'Cập nhật ảnh đại diện thất bại',
                        ),
                    );
                }

                return result;
            });

            const result = await toast.promise(updatePromise, {
                pending: 'Đang cập nhật ảnh đại diện...',
                success: {
                    render({ data }) {
                        return getApiMessage(
                            data,
                            'Cập nhật ảnh đại diện thành công',
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

            const nextAvatarUrl =
                result?.data?.profile?.avatar_url ||
                result?.data?.avatar_url ||
                result?.data?.data?.profile?.avatar_url ||
                result?.data?.data?.avatar_url ||
                previewUrl;

            setAvatarPreview(nextAvatarUrl);
            onAvatarUrlChange?.(nextAvatarUrl);
        } catch {
            setAvatarPreview(avatarUrl || '');
        } finally {
            setSubmitting(false);
            event.target.value = '';
        }
    };

    return (
        <section className={cx('wrapper')}>
            <div className={cx('cover')}>
                <div className={cx('cover-empty')} />

                {/* <Button
                    type="button"
                    className={cx('cover-btn')}
                    onClick={handleOpenImagePicker}
                    disabled={submitting}
                    leftIcon={<MdOutlineCameraAlt />}
                >
                    {submitting ? 'Đang tải...' : 'Chỉnh sửa ảnh bìa'}
                </Button> */}
            </div>

            <div className={cx('inner')}>
                <div className={cx('avatar-box')}>
                    <div className={cx('avatar')}>
                        {avatarPreview ? (
                            <img
                                src={avatarPreview}
                                alt={fullName || 'Avatar'}
                                className={cx('avatar-img')}
                            />
                        ) : (
                            <span className={cx('avatar-text')}>
                                {getInitial(fullName)}
                            </span>
                        )}
                    </div>

                    <button
                        type="button"
                        className={cx('avatar-btn')}
                        onClick={handleOpenImagePicker}
                        disabled={submitting}
                        aria-label="Cập nhật ảnh đại diện"
                    >
                        <MdOutlineCameraAlt />
                    </button>

                    <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className={cx('hidden')}
                        onChange={handleChangeAvatar}
                    />
                </div>

                <div className={cx('info')}>
                    <h1 className={cx('name')}>
                        {fullName || 'Người dùng'}
                    </h1>

                    <p className={cx('bio')}>
                        {summary || 'Chưa cập nhật'}
                    </p>
                </div>
            </div>
        </section>
    );
}

export default HeaderMedia;