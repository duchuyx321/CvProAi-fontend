import classNames from 'classnames/bind';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

import styles from './MenuOther.module.scss';

const cx = classNames.bind(styles);

const SERVER_URL = import.meta.env.VITE_URL_SERVER || '';

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
    return (
        <div className={cx('wrapper')}>
            <div className={cx('divider')}>
                <span>{text}</span>
            </div>

            <div className={cx('social')}>
                {MENU_OTHER.map((item) => (
                    <a
                        key={item.key}
                        href={`${SERVER_URL}/api/auth/${item.key}`}
                        className={cx('social-btn')}
                    >
                        {item.icon}
                        {item.content}
                    </a>
                ))}
            </div>
        </div>
    );
}

export default MenuOther;