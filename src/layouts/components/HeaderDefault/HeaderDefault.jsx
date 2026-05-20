import { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import { FiCalendar, FiClock } from 'react-icons/fi';

import { useAuth } from '~/context/AuthContext';
import UserActions from '../UserActions';
import styles from './HeaderDefault.module.scss';

const cx = classNames.bind(styles);

function HeaderDefault() {
    const { user } = useAuth();

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const displayName = user?.full_name || user?.fullName || user?.name || 'Khách';

    const dateString = new Intl.DateTimeFormat('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(currentTime);

    const timeString = new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).format(currentTime);

    const formatWithOrbitron = (text) => {
        return text.split(/(\d+)/).map((part, index) => {
            if (/\d+/.test(part)) {
                return <span key={index} className={cx('orbitronText')}>{part}</span>;
            }
            return part;
        });
    };

    return (
        <header className={cx('header')}>
            <div className={cx('leftSection')}>
                <div className={cx('greetingWrapper')}>
                    <h2 className={cx('greetingTitle')}>
                        Xin chào, <span className={cx('highlight')}>{displayName}</span>
                    </h2>
                    <div className={cx('greetingDateWrapper')}>
                        <p className={cx('greetingDate')}>
                            <FiCalendar />
                            {formatWithOrbitron(dateString)}
                        </p>
                        <div className={cx('timePill')}>
                            <div className={cx('pulse')}></div>
                            <FiClock style={{ fontSize: '13px', marginLeft: '2px', marginRight: '2px' }} />
                            {formatWithOrbitron(timeString)}
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx('rightSection')}>
                <UserActions user={user} />
            </div>
        </header>
    );
}

export default HeaderDefault;
