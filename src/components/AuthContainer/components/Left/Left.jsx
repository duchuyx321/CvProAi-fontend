import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';

import images from '~/assets';
import styles from './Left.module.scss';
import MenuOther from '../MenuOther';

const cx = classNames.bind(styles);

const MENU_LINK = {
    login: {
        title: 'Chưa có tài khoản?',
        titleLink: 'Đăng ký ngay',
        to: '/register',
    },
    register: {
        title: 'Đã có tài khoản?',
        titleLink: 'Đăng nhập ngay',
        to: '/login',
    },
};

function Left({ id, title, desc, className, children, textMenuAuth }) {
    return (
        <div className={cx('left', className)}>
            <div className={cx('inner')}>
                <h1 className={cx('logo')}>
                    <Link to="/" className={cx('logo-link')}>
                        <img
                            src={images.logo}
                            alt="CvProAI"
                            className={cx('logo-img')}
                        />
                        <span className={cx('logo-text')}>CVPROAI</span>
                    </Link>
                </h1>
                <div className={cx('heading')}>
                    {title && <h1 className={cx('title')}>{title}</h1>}
                    {desc && <p className={cx('desc')}>{desc}</p>}
                </div>

                <div className={cx('content')}>{children}</div>

                {textMenuAuth && <MenuOther text={textMenuAuth} />}

                {(id === 'login' || id === 'register') && (
                    <p className={cx('bottomText')}>
                        {MENU_LINK[id].title}{' '}
                        <Link to={MENU_LINK[id].to} className={cx('link')}>
                            {MENU_LINK[id].titleLink}
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}

export default Left;