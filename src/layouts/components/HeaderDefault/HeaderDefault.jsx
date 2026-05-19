import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { FiPlus } from 'react-icons/fi';

import { useAuth } from '~/context/AuthContext';
import { config } from '~/config';
import UserActions from '../UserActions';
import styles from './HeaderDefault.module.scss';

const cx = classNames.bind(styles);

function HeaderDefault() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const displayName = user?.full_name || user?.fullName || user?.name || '';

    const dateString = useMemo(() => {
        const today = new Date();

        return new Intl.DateTimeFormat('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(today);
    }, []);

    return (
        <header className={cx('header')}>
            <div className={cx('leftSection')}>
                <div className={cx('greetingWrapper')}>
                    <h2 className={cx('greetingTitle')}>
                        Xin chào, <span className={cx('highlight')}>{displayName}</span> 👋
                    </h2>
                    <p className={cx('greetingDate')}>{dateString}</p>
                </div>
            </div>

            <div className={cx('rightSection')}>
                <button 
                    className={cx('createBtn')}
                    onClick={() => navigate(config.router.cvTemplates)}
                >
                    <FiPlus className={cx('btnIcon')} />
                    Tạo CV mới
                </button>

                <div className={cx('divider')}></div>
                
                <UserActions user={user} />
            </div>
        </header>
    );
}

export default HeaderDefault;
