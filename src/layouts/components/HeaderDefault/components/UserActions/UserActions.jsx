import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import { Bell } from 'lucide-react';
import styles from './UserActions.module.scss';

const cx = classNames.bind(styles);
// author vanmanhdeveloper
// demo UserActions để backend test dữ liệu sau khi login hoặc register, 
// sẽ chỉnh lại sau khi backend hoàn thiện và trả về dữ liệu user thực tế
function UserActions({ user }) {
    const displayName = user?.fullName || user?.name || 'Nguyễn Văn A';
    const membership = user?.membership || 'Thành viên Pro';
    const avatar =
        user?.avatar ||
        'https://i.pravatar.cc/100?img=12';
    const unreadCount = user?.unreadNotifications ?? 1;
    return (
        <div className={cx('wrapper')}>
            <button className={cx('notifyBtn')} type="button" aria-label="Thông báo">
                <Bell size={20} strokeWidth={2.2} className={cx('bellIcon')} />
                {unreadCount > 0 && <span className={cx('badge')} />}
            </button>
            <span className={cx('divider')} />
            <Link to="/profile" className={cx('userInfo')}>
                <div className={cx('textBlock')}>
                    <h3 className={cx('name')}>{displayName}</h3>
                    <span className={cx('membership')}>{membership}</span>
                </div>
                <img src={avatar} alt={displayName} className={cx('avatar')} />
            </Link>
        </div>
    );
}

export default UserActions;