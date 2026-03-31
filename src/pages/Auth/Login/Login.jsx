import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import { MdOutlineEmail, MdOutlineLock } from 'react-icons/md';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { RiLoader2Fill } from 'react-icons/ri';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AuthContainer from '~/components/AuthContainer';
import Button from '~/components/Button';
import images from '~/assets';
import { login } from '~/services/auth.service';
import { validateLoginForm } from '~/utils/auth.validator';
import styles from './Login.module.scss';

const cx = classNames.bind(styles);

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [isEye, setIsEye] = useState(false);
    const [loading, setLoading] = useState(false);

    const isDisabled = useMemo(() => {
        return loading || email.trim().length < 6 || password.trim().length < 8;
    }, [email, password, loading]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (loading) return;

        const emailValue = email.trim();
        const passwordValue = password.trim();

        const errorMessage = validateLoginForm({
            email: emailValue,
            password: passwordValue,
        });

        if (errorMessage) {
            toast.warning(errorMessage);
            return;
        }

        try {
            setLoading(true);

            const result = await login(emailValue, passwordValue);

            if (result?.error === 'Email') {
                toast.error(result?.message || 'Email không hợp lệ');
                return;
            }

            if (result?.error === 'Pass') {
                toast.error(result?.message || 'Mật khẩu không chính xác');
                return;
            }

            if (result?.meta?.newAccessToken) {
                localStorage.setItem('accessToken', result.meta.newAccessToken);

                if (remember) {
                    localStorage.setItem('auth.rememberedIdentifier', emailValue);
                } else {
                    localStorage.removeItem('auth.rememberedIdentifier');
                }

                toast.success('Đăng nhập thành công');

                setIsEye(false);

                setTimeout(() => {
                    window.location.reload();
                }, 800);

                return;
            }

            toast.error('Đăng nhập thất bại, vui lòng thử lại');
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

    const childrenLeft = (
        <form className={cx('form')} onSubmit={handleSubmit}>
            <div className={cx('field')}>
                <label htmlFor="email" className={cx('label')}>
                    Email
                </label>

                <div className={cx('inputWrap')}>
                    <MdOutlineEmail className={cx('inputIcon')} />
                    <input
                        id="email"
                        type="text"
                        name="email"
                        className={cx('input')}
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                    />
                </div>
            </div>

            <div className={cx('field')}>
                <label htmlFor="password" className={cx('label')}>
                    Mật khẩu
                </label>

                <div className={cx('inputWrap')}>
                    <MdOutlineLock className={cx('inputIcon')} />
                    <input
                        id="password"
                        type={isEye ? 'text' : 'password'}
                        name="password"
                        className={cx('input')}
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                    />

                    <button
                        type="button"
                        className={cx('btnEye')}
                        onClick={() => setIsEye(!isEye)}
                        aria-label={isEye ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                        {isEye ? <FaRegEye /> : <FaRegEyeSlash />}
                    </button>
                </div>
            </div>

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

                <Link to="/forgot-password" className={cx('forgot')}>
                    Quên mật khẩu?
                </Link>
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

    const childrenRight = (
        <>
            <img
                src={images.BannerLogin}
                alt="Banner Login"
                className={cx('bannerImg')}
            />

            <div className={cx('bannerContent')}>
                <h2 className={cx('bannerTitle')}>Xây dựng tương lai với AI</h2>
                <p className={cx('bannerDesc')}>
                    Tạo hồ sơ chuyên nghiệp chỉ trong vài phút với công nghệ trí tuệ
                    nhân tạo hàng đầu.
                </p>
            </div>
        </>
    );

    return (
        <AuthContainer
            id="login"
            title="Đăng nhập"
            textMenuAuth="Hoặc đăng nhập với"
            desc="Chào mừng bạn quay lại với trình tạo CV thông minh"
            childrenLeft={childrenLeft}
            childrenRight={childrenRight}
        />
    );
}

export default Login;