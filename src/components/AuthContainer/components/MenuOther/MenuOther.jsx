import classNames from 'classnames/bind';
import { FcGoogle } from 'react-icons/fc';
import { FaFacebook } from 'react-icons/fa';

import Button from '~/components/Button';
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
                    <Button
                        key={item.key}
                        className={cx('social-btn')}
                        to={`${SERVER_URL}/api/auth/${item.key}`}
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