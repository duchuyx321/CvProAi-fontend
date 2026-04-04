import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import styles from './Header.module.scss';
import { useAuth } from '~/context/AuthContext';


import { FiBell, FiLogOut, FiCheck } from 'react-icons/fi';
import { CgProfile } from 'react-icons/cg';

const cx = classNames.bind(styles);

// Dữ liệu giả lập cho Thông báo
const DUMMY_NOTIFICATIONS = [
    { id: 1, title: 'Phân tích CV hoàn tất', desc: 'AI đã chấm điểm 88/100 cho CV "Backend Engineer" của bạn.', time: '15 phút trước', isRead: false },
    { id: 2, title: 'Cập nhật hệ thống', desc: 'Chúng tôi vừa thêm 5 mẫu CV mới vào thư viện.', time: '2 giờ trước', isRead: false },
    { id: 3, title: 'Đăng nhập thành công', desc: 'Bạn đã đăng nhập từ thiết bị Windows.', time: '1 ngày trước', isRead: true },
];

function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);

    // Refs để bắt sự kiện click ra ngoài
    const profileRef = useRef(null);
    const notifRef = useRef(null);


    const isAdmin = user?.role === 'ADMIN';


    const today = new Date();
    const dateString = new Intl.DateTimeFormat('vi-VN', { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    }).format(today);
    const unreadCount = notifications.filter(n => !n.isRead).length;


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    return (
        <header className={cx('header')}>

            <div className={cx('greeting-wrapper')}>
                <h2 className={cx('greeting-title')}>
                    Xin chào , {user?.fullName || user?.name || 'Nhân'} 👋
                </h2>
                <p className={cx('greeting-date')}>{dateString}</p>
            </div>


            <div className={cx('actions')}>
                
                <div className={cx('notif-section')} ref={notifRef}>
                    <button 
                        className={cx('action-btn', { active: isNotifOpen })}
                        onClick={() => {
                            setIsNotifOpen(!isNotifOpen);
                            setIsProfileOpen(false);
                        }}
                    >
                        <FiBell className={cx('icon')} />
                        {unreadCount > 0 && <span className={cx('badge')}>{unreadCount}</span>}
                    </button>

                    {isNotifOpen && (
                        <div className={cx('notif-dropdown')}>
                            <div className={cx('notif-header')}>
                                <h4>Thông báo</h4>
                                {unreadCount > 0 && (
                                    <button className={cx('mark-read-btn')} onClick={markAllAsRead}>
                                        <FiCheck /> Đánh dấu đã đọc
                                    </button>
                                )}
                            </div>
                            
                            <div className={cx('notif-list')}>
                                {notifications.length > 0 ? (
                                    notifications.map(item => (
                                        <div key={item.id} className={cx('notif-item', { unread: !item.isRead })}>
                                            <div className={cx('notif-content')}>
                                                <div className={cx('notif-title')}>{item.title}</div>
                                                <div className={cx('notif-desc')}>{item.desc}</div>
                                                <div className={cx('notif-time')}>{item.time}</div>
                                            </div>
                                            {!item.isRead && <div className={cx('unread-dot')}></div>}
                                        </div>
                                    ))
                                ) : (
                                    <div className={cx('notif-empty')}>Bạn không có thông báo nào.</div>
                                )}
                            </div>
                            <div className={cx('notif-footer')}>
                                Xem tất cả thông báo
                            </div>
                        </div>
                    )}
                </div>


                <div className={cx('profile-section')} ref={profileRef}>
                    <div 
                        className={cx('profile-trigger')} 
                        onClick={() => {
                            setIsProfileOpen(!isProfileOpen);
                            setIsNotifOpen(false);
                        }}
                    >
                        <div className={cx('profile-info')}>
                            <span className={cx('name')}>
                                {user?.fullName || user?.name || (isAdmin ? 'Quản trị viên' : 'Người dùng')}
                            </span>
                            <span className={cx('sub-text', { 'is-online': isAdmin })}>
                                {isAdmin ? 'Trực tuyến' : (user?.tier || 'Thành viên Pro')}
                            </span>
                        </div>
                        {user?.avatar ? (
                            <img src={user.avatar} alt="Avatar" className={cx('avatar')} />
                        ) : (
                            <div className={cx('text-avatar')}>
                                {isAdmin ? 'QT' : (user?.fullName?.charAt(0) || 'N')}
                            </div>
                        )}
                    </div>

                    
                    {isProfileOpen && (
                        <div className={cx('profile-dropdown')}>
                            <div className={cx('dropdown-item')} onClick={() => navigate('/user/profile')}>
                                <CgProfile className={cx('dropdown-icon')} />
                                Hồ sơ cá nhân
                            </div>
                            
                            <div className={cx('dropdown-divider')}></div>
                            
                            <div className={cx('dropdown-item', 'logout-item')} onClick={handleLogout}>
                                <FiLogOut className={cx('dropdown-icon')} />
                                Đăng xuất
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}

export default Header;