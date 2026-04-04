import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import { MdOutlineEmail } from 'react-icons/md';

import { config } from '~/config';
import Button from '~/components/Button';
import Input from '~/components/Input';
import { resendOTP } from '~/services/auth.service';
import { validateForgotPasswordForm } from '~/utils/auth.validator';
import styles from './ForgotPasswordLeft.module.scss';

const cx = classNames.bind(styles);

function ForgotPasswordLeft() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const isDisabled = submitting || !email.trim();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (submitting) return;

        const emailValue = email.trim();
        const errorMessage = validateForgotPasswordForm({ email: emailValue });

        if (errorMessage) {
            toast.warning(errorMessage);
            return;
        }

        try {
            setSubmitting(true);

            const resultFetchAPi = fetchAPI(email);

            await toast.promise(resultFetchAPi, {
                pending: 'Đang gửi mã OTP...',
                success: {
                    // eslint-disable-next-line no-unused-vars
                    render({ data }) {
                        return 'Đã gửi mã OTP cập nhật mật khẩu thành công';
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

            setTimeout(() => {
                navigate(config.router.otp_verify, {
                    state: {
                        email: emailValue,
                        autoStartCountdown: true,
                        from: 'RESET_PASSWORD',
                    },
                });
            }, 800);
        } catch (error) {
            console.error('Forgot password error:', error);
        } finally {
            setSubmitting(false);
        }
    };
    const fetchAPI = async (email) => {
        const result = await resendOTP(email);
        if (!result.success) {
            throw new Error(result.message);
        }
    };
    return (
        <form className={cx('form')} onSubmit={handleSubmit}>
            <Input
                id="email"
                label="Email"
                type="text"
                name="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                leftIcon={<MdOutlineEmail />}
                disabled={submitting}
            />

            <p className={cx('note')}>
                Bằng việc thực hiện đổi mật khẩu, bạn đã đồng ý với{' '}
                <Button to="/terms" text className={cx('link')}>
                    Điều khoản sử dụng
                </Button>{' '}
                và{' '}
                <Button to="/privacy" text className={cx('link')}>
                    Chính sách bảo mật
                </Button>{' '}
                của chúng tôi.
            </p>

            <Button
                primary
                className={cx('submit')}
                disabled={isDisabled}
                type="submit"
            >
                Gửi mã OTP
            </Button>

            <div className={cx('actions')}>
                <Button to={config.router.login} text className={cx('link')}>
                    Quay lại đăng nhập
                </Button>

                <Button to={config.router.register} text className={cx('link')}>
                    Đăng ký tài khoản mới
                </Button>
            </div>
        </form>
    );
}

export default ForgotPasswordLeft;
