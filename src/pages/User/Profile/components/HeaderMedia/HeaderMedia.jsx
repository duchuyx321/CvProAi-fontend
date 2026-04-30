import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import { MdOutlineCameraAlt } from 'react-icons/md';
import { toast } from 'react-toastify';

import Button from '~/components/Button';
import { updateAvatar, updateCover } from '~/services/profile.service';
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

function HeaderMedia({
    fullName = '',
    summary = '',
    avatarUrl = '',
    cover = '',
    onAvatarUrlChange,
    onCoverChange,
}) {
    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const [avatarPreview, setAvatarPreview] = useState(avatarUrl || '');
    const [coverPreview, setCoverPreview] = useState(cover || '');
    const [avatarSubmitting, setAvatarSubmitting] = useState(false);
    const [coverSubmitting, setCoverSubmitting] = useState(false);

    useEffect(() => {
        setAvatarPreview(avatarUrl || '');
    }, [avatarUrl]);

    useEffect(() => {
        setCoverPreview(cover || '');
    }, [cover]);

    const handleOpenAvatarPicker = () => {
        if (avatarSubmitting) return;

        avatarInputRef.current?.click();
    };

    const handleOpenCoverPicker = () => {
        if (coverSubmitting) return;

        coverInputRef.current?.click();
    };

    const handleChangeAvatar = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setAvatarSubmitting(true);

            const previewUrl = await readFileAsDataUrl(file);
            setAvatarPreview(previewUrl);

            const formData = new FormData();

            formData.append('avatar', file);

            const updatePromise = updateAvatar(formData).then((result) => {
                if (!result?.success) {
                    throw new Error(
                        result?.message || 'Cập nhật ảnh đại diện thất bại',
                    );
                }

                return result;
            });

            const result = await toast.promise(updatePromise, {
                pending: 'Đang cập nhật ảnh đại diện...',
                success: {
                    render({ data }) {
                        return (
                            data?.message || 'Cập nhật ảnh đại diện thành công'
                        );
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

            const nextAvatarUrl =
                result?.data?.avatar_url ||
                result?.data?.data?.avatar_url ||
                result?.data?.url ||
                previewUrl;

            setAvatarPreview(nextAvatarUrl);

            onAvatarUrlChange?.(nextAvatarUrl);
        } catch {
            setAvatarPreview(avatarUrl || '');
        } finally {
            setAvatarSubmitting(false);
            event.target.value = '';
        }
    };

    const handleChangeCover = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setCoverSubmitting(true);

            const previewUrl = await readFileAsDataUrl(file);
            setCoverPreview(previewUrl);

            const formData = new FormData();
            formData.append('cover', file);

            const updatePromise = updateCover(formData).then((result) => {
                if (!result?.success) {
                    throw new Error(
                        result?.message || 'Cập nhật ảnh bìa thất bại',
                    );
                }

                return result;
            });

            const result = await toast.promise(updatePromise, {
                pending: 'Đang cập nhật ảnh bìa...',
                success: {
                    render({ data }) {
                        return data?.message || 'Cập nhật ảnh bìa thành công';
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

            const nextCover =
                result?.data?.cover ||
                result?.data?.data?.cover ||
                result?.data?.url ||
                previewUrl;

            setCoverPreview(nextCover);
            onCoverChange?.(nextCover);
        } catch {
            setCoverPreview(cover || '');
        } finally {
            setCoverSubmitting(false);
            event.target.value = '';
        }
    };

    return (
        <section className={cx('wrapper')}>
            <div className={cx('cover')}>
                {coverPreview ? (
                    <img
                        src={coverPreview}
                        alt="Ảnh bìa"
                        className={cx('cover-img')}
                    />
                ) : (
                    <div className={cx('cover-empty')} />
                )}

                <Button
                    type="button"
                    className={cx('cover-btn')}
                    onClick={handleOpenCoverPicker}
                    disabled={coverSubmitting}
                    leftIcon={<MdOutlineCameraAlt />}
                >
                    {coverSubmitting ? 'Đang tải...' : 'Chỉnh sửa ảnh bìa'}
                </Button>

                <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className={cx('hidden')}
                    onChange={handleChangeCover}
                />
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
                        onClick={handleOpenAvatarPicker}
                        disabled={avatarSubmitting}
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