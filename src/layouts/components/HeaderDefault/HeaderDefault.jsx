import { Link, NavLink } from 'react-router-dom';
import classNames from 'classnames/bind';
import { useAuth } from '~/context/AuthContext';
import images from '~/assets';
import { config } from '~/config';
import styles from './HeaderDefault.module.scss';
import Button from '~/components/Button';
import UserActions from './components/UserActions';

const cx = classNames.bind(styles);

const LIST_NAVBAR = [
    { title: 'Trang chủ', to: config.router.home },
    { title: 'Tính năng', to: config.router.features },
    { title: 'Bảng giá', to: config.router.pricing },
];

function HeaderDefault() {
    const { isAuthenticated, user, isInitialized } = useAuth();

    return (
        <header className={cx('wrapper')}>
            <div className={cx('inner')}>
                <h1 className={cx('logo')}>
                    <Link to={config.router.home} className={cx('logo-link')}>
                        <img
                            src={images.logo}
                            alt="CvProAI Logo"
                            className={cx('logo-img')}
                        />
                        <div className={cx('logo-texts')}>
                            <span className={cx('logo-name')}>CvProAI</span>
                            <span className={cx('logo-sub')}>
                                Hệ thống tạo CV bằng AI
                            </span>
                        </div>
                    </Link>
                </h1>

                <nav className={cx('nav')}>
                    {LIST_NAVBAR.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end
                            className={({ isActive }) =>
                                cx('nav-link', { active: isActive })
                            }
                        >
                            {link.title}
                        </NavLink>
                    ))}
                </nav>

                <div className={cx('right')}>
                    {!isInitialized ? null : isAuthenticated ? (
                        <div className={cx('user-area')}>
                            <UserActions user={user} />
                        </div>
                    ) : (
                        <div className={cx('actions')}>
                            <div className={cx('btnLogin')}>
                                <Button outline to={config.router.login}>
                                    Đăng nhập
                                </Button>
                            </div>
                            <div className={cx('btnRegister')}>
                                <Button primary to={config.router.register}>
                                    Đăng ký
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default HeaderDefault;
