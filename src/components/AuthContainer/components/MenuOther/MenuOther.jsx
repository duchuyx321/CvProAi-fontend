import classNames from 'classnames/bind';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';
import { useMemo } from 'react';
import { toast } from 'react-toastify';

import Button from '~/components/Button';
import styles from './MenuOther.module.scss';
import { config } from '~/config';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '~/context/AuthContext';

const cx = classNames.bind(styles);

const SERVER_URL = import.meta.env.VITE_HTTPS_BACKEND || '';

const MENU_OTHER = [
    {
        key: 'google',
        content: 'Google',
        icon: <FcGoogle />,
    },
    {
        key: 'facebook',
        content: 'Facebook',
        icon: <FaFacebook className={cx('fb-icon')} />,
    },
];

function MenuOther({ text = 'Hoặc tiếp tục với' }) {
    const { initializeAuth } = useAuth();
    const navigate = useNavigate();
    const BACKEND_ORIGIN = useMemo(() => {
        try {
            return new URL(SERVER_URL).origin;
        } catch {
            return '';
        }
    }, []);

    const openPopupLogin = (provider) => {
        return new Promise((resolve, reject) => {
            const width = 500;
            const height = 650;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;

            const popupUrl = new URL(`auth/${provider}`, SERVER_URL).toString();

            const popup = window.open(
                popupUrl,
                `${provider}-login`,
                `popup=yes,width=${width},height=${height},left=${left},top=${top}`,
            );

            if (!popup) {
                reject(
                    new Error(
                        'Trình duyệt đang chặn popup. Hãy cho phép popup và thử lại.',
                    ),
                );
                return;
            }

            const timer = setInterval(() => {
                if (popup.closed) {
                    clearInterval(timer);
                    window.removeEventListener('message', handleMessage);
                    reject(new Error('Bạn đã đóng cửa sổ đăng nhập.'));
                }
            }, 500);

            const handleMessage = (event) => {
                if (event.origin !== BACKEND_ORIGIN) return;

                if (event.data?.type === 'GOOGLE_LOGIN_SUCCESS') {
                    clearInterval(timer);
                    window.removeEventListener('message', handleMessage);

                    const accessToken = event.data?.data?.accessToken;

                    if (accessToken) {
                        localStorage.setItem(
                            'accessToken',
                            `Bearer ${accessToken}`,
                        );
                    }

                    popup.close();
                    resolve(
                        event.data?.data || { message: 'Đăng nhập thành công' },
                    );
                    return;
                }

                if (event.data?.type === 'GOOGLE_LOGIN_ERROR') {
                    clearInterval(timer);
                    window.removeEventListener('message', handleMessage);
                    popup.close();
                    reject(
                        new Error(
                            event.data?.message || 'Đăng nhập Google thất bại',
                        ),
                    );
                }
            };

            window.addEventListener('message', handleMessage);
        });
    };

    const handleSocialLogin = async (key) => {
        if (key !== 'google') return;

        try {
            const loginPromise = openPopupLogin('google');

            await toast.promise(loginPromise, {
                pending: 'Đang đăng nhập với Google...',
                success: {
                    render({ data }) {
                        return data?.message || 'Đăng nhập thành công';
                    },
                },
                error: {
                    render({ data }) {
                        return (
                            data?.message ||
                            data?.error?.message ||
                            'Có lỗi xảy ra, vui lòng thử lại sau'
                        );
                    },
                },
            });
            await initializeAuth();
            setTimeout(() => {
                // window.location.replace(config.router.home);
                navigate(config.router.dashboard);
            }, 800);
        } catch (error) {
            console.error('Google login error:', error);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('divider')}>
                <span>{text}</span>
            </div>

            <div className={cx('social')}>
                {MENU_OTHER.map((item) => (
                    <Button
                        key={item.key}
                        className={cx('social-btn')}
                        onClick={() => handleSocialLogin(item.key)}
                    >
                        <span className={cx('inner')}>
                            <span className={cx('icon')}>{item.icon}</span>
                            <span className={cx('text')}>{item.content}</span>
                        </span>
                    </Button>
                ))}
            </div>
        </div>
    );
}

export default MenuOther;
