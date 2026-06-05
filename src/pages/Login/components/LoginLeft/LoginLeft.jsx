import { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { MdOutlineEmail, MdOutlineLock } from 'react-icons/md';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { config } from '~/config';
import Button from '~/components/Button';
import Input from '~/components/Input';
import { login } from '~/services/auth.service';
import { validateLoginForm } from '~/utils/auth.validator';
import styles from './LoginLeft.module.scss';
import { helper } from '~/utils/helper';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '~/context/AuthContext';

const cx = classNames.bind(styles);
const connective = import.meta.env.VITE_CONNECTIVE;
function LoginLeft() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [isEye, setIsEye] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();
    const { initializeAuth } = useAuth();
    useEffect(() => {
        const rememberLocal = localStorage.getItem('remember');
        if (rememberLocal) {
            const textRemember = helper.decryptValidate(rememberLocal);
            const [emailRemember, passwordRemember] =
                textRemember.split(connective);
            setEmail(emailRemember);
            setPassword(passwordRemember);
            setRemember(true);
            return;
        }
        setRemember(false);
    }, []);

    const isDisabled = useMemo(() => {
        return submitting || !email.trim() || !password.trim();
    }, [email, password, submitting]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (submitting) return;

        const errorMessage = validateLoginForm({ email, password });

        if (errorMessage) {
            toast.warning(errorMessage);
            return;
        }

        try {
            setSubmitting(true);

            const loginPromise = fetchAPI(email, password);
            await toast.promise(loginPromise, {
                pending: 'Đang đăng nhập...',
                success: {
                    render({ data }) {
                        return data?.message || 'Đăng nhập thành công';
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

            setIsEye(false);
            await initializeAuth();
            setTimeout(() => {
                // window.location.replace(config.router.home);
                navigate(config.router.dashboard); //
            }, 800);
        } catch (error) {
            console.log('Login error:', error);
        } finally {
            setSubmitting(false);
        }
    };
    const fetchAPI = async (email, password) => {
        const result = await login(email, password);
        if (!result?.success) {
            if (
                result?.status === 403 &&
                result?.message === 'Tài khoản chưa được xác thực email!'
            ) {
                setTimeout(
                    () =>
                        navigate(config.router.otp_verify, {
                            state: {
                                email,
                                autoStartCountdown: false,
                                from: 'VERIFY_EMAIL',
                            },
                        }),
                    2000,
                );
                throw new Error(result?.message);
            }
            throw new Error(result?.message || 'Đăng nhập thất bại');
        }
        const accessToken =
            result?.data?.meta?.accessToken ||
            result?.data?.accessToken ||
            null;

        if (accessToken) {
            localStorage.setItem('accessToken', `Bearer ${accessToken}`);
        }

        if (remember) {
            const text = `${email}${connective}${password}`;
            const hash_remember = helper.hashValidate(text);
            localStorage.setItem('remember', hash_remember);
        }
        if (!remember && localStorage.getItem('remember')) {
            localStorage.removeItem('remember');
        }
    };
    const navigateForgotPassword = (e) => {
        e.preventDefault();
        navigate(config.router.forgotPassword, {
            email,
            autoStartCountdown: true,
            from: 'RESET_PASSWORD',
        });
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

            <Input
                id="password"
                label="Mật khẩu"
                type={isEye ? 'text' : 'password'}
                name="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                leftIcon={<MdOutlineLock />}
                rightIcon={
                    <button
                        type="button"
                        className={cx('btnEye')}
                        onClick={() => setIsEye((prev) => !prev)}
                        aria-label={isEye ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                        {isEye ? <FaRegEye /> : <FaRegEyeSlash />}
                    </button>
                }
                disabled={submitting}
            />

            <div className={cx('options')}>
                <label htmlFor="remember" className={cx('checkbox')}>
                    <input
                        id="remember"
                        type="checkbox"
                        name="remember"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        className={cx('checkboxInput')}
                        disabled={submitting}
                    />
                    <span className={cx('checkboxText')}>
                        Ghi nhớ đăng nhập
                    </span>
                </label>

                <Button
                    text
                    onClick={(e) => navigateForgotPassword(e)}
                    className={cx('forgot')}
                >
                    Quên mật khẩu?
                </Button>
            </div>

            <Button
                primary
                className={cx('submit')}
                disabled={isDisabled}
                type="submit"
            >
                Đăng nhập
            </Button>
        </form>
    );
}

export default LoginLeft;
