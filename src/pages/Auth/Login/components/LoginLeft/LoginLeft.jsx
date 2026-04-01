import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { MdOutlineEmail, MdOutlineLock } from 'react-icons/md';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { RiLoader2Fill } from 'react-icons/ri';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { config } from '~/config';
import Button from '~/components/Button';
import Input from '~/components/Input';
import { login } from '~/services/auth.service';
import { validateLoginForm } from '~/utils/auth.validator';
import styles from './LoginLeft.module.scss';

const cx = classNames.bind(styles);

function LoginLeft() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [isEye, setIsEye] = useState(false);
    const [loading, setLoading] = useState(false);

    const isDisabled = useMemo(() => {
        return loading || !email.trim() || !password.trim();
    }, [email, password, loading]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        const errorMessage = validateLoginForm({ email, password });

        if (errorMessage) {
            toast.warning(errorMessage);
            return;
        }

        try {
            setLoading(true);

            const result = await login(email, password);

            if (!result?.success) {
                toast.error(result?.message || 'Đăng nhập thất bại');
                return;
            }

            const accessToken =
                result?.data?.meta?.newAccessToken ||
                result?.data?.accessToken ||
                null;

            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);
            }

            if (remember) {
                localStorage.setItem('auth.rememberedIdentifier', email.trim());
            } else {
                localStorage.removeItem('auth.rememberedIdentifier');
            }

            toast.success(result?.message || 'Đăng nhập thành công');

            setIsEye(false);

            setTimeout(() => {
                navigate(config.router.dashboard);
            }, 800);
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                'Có lỗi xảy ra, vui lòng thử lại sau',
            );
        } finally {
            setLoading(false);
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
                disabled={loading}
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
                        onClick={() => setIsEye(!isEye)}
                        aria-label={isEye ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                        {isEye ? <FaRegEye /> : <FaRegEyeSlash />}
                    </button>
                }
                disabled={loading}
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
                    />
                    <span className={cx('checkboxText')}>Ghi nhớ đăng nhập</span>
                </label>

                <Button
                    text
                    to={config.router.forgotPassword}
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
                {loading ? (
                    <>
                        <RiLoader2Fill className={cx('spinner')} />
                        Đang đăng nhập...
                    </>
                ) : (
                    'Đăng nhập'
                )}
            </Button>
        </form>
    );
}

export default LoginLeft;