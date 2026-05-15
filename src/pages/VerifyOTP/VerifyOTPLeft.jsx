/* eslint-disable no-unused-vars */
import classNames from 'classnames/bind';
import styles from './VerifyOTP.module.scss';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '~/components/Button';
import { useCallback, useEffect, useRef, useState } from 'react';
import { validateOtpForm } from '~/utils/auth.validator';
import { toast } from 'react-toastify';
import { config } from '~/config';
import { resendOTP, verifyOTP } from '~/services/auth.service';
import { useAuth } from '~/context/AuthContext';

const cx = classNames.bind(styles);

const MENU_CONTENT = {
    VERIFY_EMAIL: {
        title: 'Xác Thực email của bạn',
        text1: 'Chúng tôi đã gửi mã xác nhận gồm 6 chữ số đến',
        text2: 'Vui lòng nhập mã vào bên dưới để hoàn tất đăng ký.',
    },
    RESET_PASSWORD: {
        title: 'Xác thực tài khoản',
        text1: 'Chúng tôi đã gửi mã gồm 6 chữ số đến',
        text2: 'Vui lòng nhập mã đó vào bên dưới để đặt lại mật khẩu.',
    },
};

function VerifyOTPLeft() {
    const { state } = useLocation();
    const OTP_LENGTH = Math.max(
        1,
        Number.parseInt(import.meta.env.VITE_OTP_LENGTH, 10) || 6,
    );
    const DEFAULT_COUNTDOWN = Math.max(
        1,
        Number.parseInt(import.meta.env.VITE_DEFAULT_COUNTDOWN, 10) || 60,
    );

    const formType = state?.from;
    const email = state?.email || 'nguyenvana@gmail.com';
    const storageKey = `otp-countdown-started-${formType}-${email}`;
    const content = MENU_CONTENT[formType] || MENU_CONTENT.VERIFY_EMAIL;
    const { initializeAuth } = useAuth();
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const [countdown, setCountdown] = useState(0);
    const [loadingResend, setLoadingResend] = useState(false);

    const inputRefs = useRef([]);
    const navigate = useNavigate();

    const isOtpComplete = otp.every((item) => item !== '');
    const startCountdown = useCallback(() => {
        const expiresAt = Date.now() + DEFAULT_COUNTDOWN * 1000;
        sessionStorage.setItem(storageKey, String(expiresAt));
        setCountdown(DEFAULT_COUNTDOWN);
    }, [DEFAULT_COUNTDOWN, storageKey]);
    useEffect(() => {
        const expiresAt = Number(sessionStorage.getItem(storageKey));

        if (expiresAt) {
            const remain = Math.ceil((expiresAt - Date.now()) / 1000);

            if (remain > 0) {
                setCountdown(remain);
                return;
            }

            sessionStorage.removeItem(storageKey);
            setCountdown(0);
            return;
        }

        if (state?.autoStartCountdown) {
            startCountdown();
        }
    }, [startCountdown, state?.autoStartCountdown, storageKey]);

    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setInterval(() => {
            const expiresAt = Number(sessionStorage.getItem(storageKey));

            if (!expiresAt) {
                setCountdown(0);
                clearInterval(timer);
                return;
            }

            const remain = Math.ceil((expiresAt - Date.now()) / 1000);

            if (remain <= 0) {
                sessionStorage.removeItem(storageKey);
                setCountdown(0);
                clearInterval(timer);
                return;
            }

            setCountdown(remain);
        }, 1000);

        return () => clearInterval(timer);
    }, [countdown, storageKey]);

    const handleChange = (value, index) => {
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

        const pastedData = e.clipboardData.getData('text').slice(0, OTP_LENGTH);

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

            await resendOTP(email);

            toast.success('Gửi lại mã thành công');
            startCountdown();
        } catch {
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
        console.log(formType);
        const verifyPromise = fetchAPISubmid(email, formType, otpCode);
        await toast.promise(verifyPromise, {
            pending: 'Đang xác thực OTP...',
            success: {
                render() {
                    return formType === 'VERIFY_EMAIL'
                        ? 'Xác thực Email thành công.'
                        : formType === 'RESET_PASSWORD'
                          ? 'Cấp lại mật khẩu thành công.'
                          : 'Xác thực OTP thành công';
                },
            },
            error: {
                render({ data }) {
                    return 'Mã OTP không hợp lệ hoặc đã hết hạn.';
                },
            },
        });
        sessionStorage.removeItem(storageKey);
        if (formType === 'VERIFY_EMAIL') {
            await initializeAuth();
            setTimeout(() => {
                // window.location.replace(config.router.home);
                navigate(config.router.dashboard);
            }, 800);
        } else if (formType === 'RESET_PASSWORD') {
            setTimeout(() => {
                // window.location.replace(config.router.home);
                navigate(config.router.verify_success, {
                    state: { from: formType },
                });
            }, 800);
        }
    };
    const fetchAPISubmid = async (email, purpose, otp) => {
        const result = await verifyOTP({
            email,
            purpose,
            otp,
        });
        if (!result.success && result.status !== 200) {
            throw new Error(result.message);
        }
        const accessToken =
            result?.data?.meta?.accessToken ||
            result?.data?.accessToken ||
            null;

        if (accessToken) {
            localStorage.setItem('accessToken', `Bearer ${accessToken}`);
        }
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
                    <Button
                        small
                        to={config.router.forgotPassword}
                        className={cx('btn_setEmail')}
                    >
                        Sai email? Thay đổi
                    </Button>
                )}
            </div>
        </div>
    );
}

export default VerifyOTPLeft;
