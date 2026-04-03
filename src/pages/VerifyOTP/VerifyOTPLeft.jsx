import classNames from 'classnames/bind';
import styles from './VerifyOTP.module.scss';
import { Link, useLocation } from 'react-router-dom';
import Button from '~/components/Button';
import { useEffect, useRef, useState } from 'react';
import { validateOtpForm } from '~/utils/auth.validator';
import { toast } from 'react-toastify';
import { config } from '~/config';
import { verifyOTP } from '~/services/auth.service';

const cx = classNames.bind(styles);

const MENU_CONTENT = {
    verify: {
        title: 'Xác Thực email của bạn',
        text1: 'Chúng tôi đã gửi mã xác nhận gồm 6 chữ số đến',
        text2: 'Vui lòng nhập mã vào bên dưới để hoàn tất đăng ký.',
    },
    reset: {
        title: 'Xác thực tài khoản',
        text1: 'Chúng tôi đã gửi mã gồm 6 chữ số đến',
        text2: 'Vui lòng nhập mã đó vào bên dưới để đặt lại mật khẩu.',
    },
};

const OTP_LENGTH = 6;
const DEFAULT_COUNTDOWN = 60;

function VerifyOTPLeft() {
    const { state } = useLocation();

    const formType = state?.form;
    const email = state?.email || 'nguyenvana@gmail.com';
    const content = MENU_CONTENT[formType] || MENU_CONTENT.verify;

    const storageKey = `otp-countdown-started-${formType}-${email}`;

    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const [countdown, setCountdown] = useState(0);
    const [loadingResend, setLoadingResend] = useState(false);
    const inputRefs = useRef([]);

    const isOtpComplete = otp.every((item) => item !== '');

    useEffect(() => {
        const started = sessionStorage.getItem(storageKey);

        if (state?.autoStartCountdown && !started) {
            setCountdown(DEFAULT_COUNTDOWN);
            sessionStorage.setItem(storageKey, 'true');
        }
    }, [state?.autoStartCountdown, storageKey]);

    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown]);

    const handleChange = (value, index) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (otp[index]) {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
                return;
            }

            if (index > 0) {
                inputRefs.current[index - 1]?.focus();

                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
            }
        }

        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();

        const pastedData = e.clipboardData
            .getData('text')
            .replace(/\D/g, '')
            .slice(0, OTP_LENGTH);

        if (!pastedData) return;

        const newOtp = Array(OTP_LENGTH).fill('');
        pastedData.split('').forEach((char, index) => {
            newOtp[index] = char;
        });

        setOtp(newOtp);

        const focusIndex =
            pastedData.length >= OTP_LENGTH
                ? OTP_LENGTH - 1
                : pastedData.length;

        inputRefs.current[focusIndex]?.focus();
    };

    const handleResend = async () => {
        if (countdown > 0 || loadingResend) return;

        try {
            setLoadingResend(true);

            // call api resend here
            // await resendOtp({ email, form: formType });

            toast.success('Gửi lại mã thành công');
            setCountdown(DEFAULT_COUNTDOWN);
        } catch (error) {
            toast.error('Gửi lại mã thất bại');
        } finally {
            setLoadingResend(false);
        }
    };

    const handleSubmit = async () => {
        const otpCode = otp.join('');
        const validate = validateOtpForm({ otp: otpCode });

        if (validate !== '') {
            toast.warning(validate);
            return;
        }

        // call api verify here
        const verifyOTP = await verifyOTP(email, formType, otpCode);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('title')}>
                <h3>{content.title}</h3>
            </div>

            <div className={cx('desc')}>
                <p>{content.text1}</p>
                <h4>{email}</h4>
                <p>{content.text2}</p>
            </div>

            <div className={cx('inputOTP')} onPaste={handlePaste}>
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className={cx('otpInput')}
                    />
                ))}
            </div>

            <div className={cx('action')}>
                <Button
                    disabled={!isOtpComplete}
                    onClick={handleSubmit}
                    primary
                    large
                >
                    Xác nhận
                </Button>

                <div className={cx('resend')}>
                    <p>Bạn chưa nhận được mã?</p>

                    {countdown > 0 ? (
                        <span className={cx('countdown')}>
                            Gửi lại mã sau ({countdown}s)
                        </span>
                    ) : (
                        <button
                            className={cx('btn_resend')}
                            onClick={handleResend}
                            disabled={loadingResend}
                        >
                            {loadingResend ? 'Đang gửi...' : 'Gửi lại mã'}
                        </button>
                    )}
                </div>

                {formType === 'reset' && (
                    <Link
                        to={config.router.forgotPassword}
                        className={cx('btn_setEmail')}
                    >
                        Sai email? Thay đổi
                    </Link>
                )}
            </div>
        </div>
    );
}

export default VerifyOTPLeft;
