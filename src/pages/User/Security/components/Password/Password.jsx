import { useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import Input from '~/components/Input';
import Button from '~/components/Button';
import { changePassword } from '~/services/security.service';
import styles from './Password.module.scss';

const cx = classNames.bind(styles);

const validatePasswordForm = ({
    currentPassword,
    newPassword,
    confirmPassword,
}) => {
    if (!currentPassword.trim()) {
        return 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!newPassword.trim()) {
        return 'Vui lòng nhập mật khẩu mới';
    }

    if (newPassword.trim().length < 6) {
        return 'Mật khẩu mới phải có ít nhất 6 ký tự';
    }

    if (!confirmPassword.trim()) {
        return 'Vui lòng nhập xác nhận mật khẩu';
    }

    if (newPassword !== confirmPassword) {
        return 'Xác nhận mật khẩu không khớp';
    }

    if (currentPassword === newPassword) {
        return 'Mật khẩu mới không được trùng mật khẩu hiện tại';
    }

    return '';
};

function Password({ onClose }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isDisabled = useMemo(() => {
        return (
            submitting ||
            !currentPassword.trim() ||
            !newPassword.trim() ||
            !confirmPassword.trim()
        );
    }, [currentPassword, newPassword, confirmPassword, submitting]);

    const handleSubmit = async () => {
        if (submitting) return;

        const errorMessage = validatePasswordForm({
            currentPassword,
            newPassword,
            confirmPassword,
        });

        setFormError(errorMessage);

        if (errorMessage) return;

        try {
            setSubmitting(true);

            const changePasswordPromise = changePassword({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            }).then((result) => {
                if (!result?.success) {
                    throw new Error(
                        result?.message || 'Đổi mật khẩu thất bại',
                    );
                }

                return result;
            });

            await toast.promise(changePasswordPromise, {
                pending: 'Đang cập nhật mật khẩu...',
                success: {
                    render({ data }) {
                        return data?.message || 'Đổi mật khẩu thành công';
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

            onClose();
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('form')}>
                <Input
                    id="currentPassword"
                    type="password"
                    label="Mật khẩu hiện tại"
                    value={currentPassword}
                    placeholder="Nhập mật khẩu hiện tại"
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={submitting}
                    fullWidth
                />

                <Input
                    id="newPassword"
                    type="password"
                    label="Mật khẩu mới"
                    value={newPassword}
                    placeholder="Nhập mật khẩu mới"
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={submitting}
                    fullWidth
                />

                <Input
                    id="confirmPassword"
                    type="password"
                    label="Xác nhận mật khẩu"
                    value={confirmPassword}
                    placeholder="Nhập lại mật khẩu mới"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    error={formError}
                    disabled={submitting}
                    fullWidth
                />
            </div>

            <div className={cx('actions')}>
                <Button
                    primary
                    type="button"
                    onClick={handleSubmit}
                    disabled={isDisabled}
                >
                    Lưu
                </Button>
            </div>
        </div>
    );
}

export default Password;