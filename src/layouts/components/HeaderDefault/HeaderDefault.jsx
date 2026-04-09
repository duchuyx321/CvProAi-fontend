import { useMemo } from 'react';
import classNames from 'classnames/bind';

import { useAuth } from '~/context/AuthContext';
import UserActions from '../UserActions';
import styles from './HeaderDefault.module.scss';

const cx = classNames.bind(styles);

function HeaderDefault() {
    const { user } = useAuth();

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
            <div className={cx('greetingWrapper')}>
                <h2 className={cx('greetingTitle')}>
                    Xin chào, {displayName} 👋
                </h2>
                <p className={cx('greetingDate')}>{dateString}</p>
            </div>

            <div className={cx('actions')}>
                <UserActions user={user} />
            </div>
        </header>
    );
}

export default HeaderDefault;
