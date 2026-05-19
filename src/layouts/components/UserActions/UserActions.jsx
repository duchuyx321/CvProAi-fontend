import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import { CgProfile } from 'react-icons/cg';
import { FiLogOut } from 'react-icons/fi';
import { MdOutlineHome, MdOutlineHistory, MdOutlineLocalOffer } from 'react-icons/md';

import { logout } from '~/services/auth.service';
import { config } from '~/config';
import { useAuth } from '~/context/AuthContext';
import styles from './UserActions.module.scss'; 

const cx = classNames.bind(styles);

const MENU_ITEMS = [
    {
        title: 'Dashboard',
        icon: MdOutlineHome,
        to: config.router.dashboard,
    },
    {
        title: 'Hồ sơ cá nhân',
        icon: CgProfile,
        to: config.router.profile,
    },
    {
        title: 'Gói dịch vụ',
        icon: MdOutlineLocalOffer,
        to: config.router.package,
    },
    {
        title: 'Lịch sử giao dịch',
        icon: MdOutlineHistory,
        to: config.router.history,
    },
];

function getInitial(name = '') {
    const words = name.trim().split(' ').filter(Boolean);
    if (!words.length) return 'U';
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

function UserActions({ user = {} }) {
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);
    const { clearAuthState } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const displayName = user?.full_name || user?.fullName || user?.name || 'Người dùng';
    const membership = user?.membership || user?.role || 'Thành viên';
    const avatar = user?.profile?.avatar_url || '';
    const hasAvatar = Boolean(avatar);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        if (submitting) return;
        try {
            setSubmitting(true);
            clearAuthState();
            await logout();
        } finally {
            setIsOpen(false);
            setSubmitting(false);
            navigate(config.router.login);
        }
    };

    return (
        <div className={cx('wrapper')} ref={dropdownRef}>
            <button
                type="button"
                className={cx('userInfo')}
                onClick={() => {
                    if (!location.pathname.startsWith('/admin')) {
                        setIsOpen((prev) => !prev);
                    }
                }}
                style={{ cursor: location.pathname.startsWith('/admin') ? 'default' : 'pointer' }}
                aria-label="Mở menu người dùng"
            >
                <div className={cx('textBlock')}>
                    <h3 className={cx('name')}>{displayName}</h3>
                    <span className={cx('membership')}>{membership}</span>
                </div>

                <div className={cx('avatar')}>
                    {hasAvatar ? (
                        <img
                            src={avatar}
                            alt={displayName}
                            className={cx('avatarImg')}
                        />
                    ) : (
                        <span className={cx('avatarText')}>
                            {getInitial(displayName)}
                        </span>
                    )}
                </div>
            </button>

            {isOpen && (
                <div className={cx('dropdown')}>
                    {MENU_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.to}
                                type="button"
                                className={cx('dropdownItem')}
                                onClick={() => {
                                    setIsOpen(false);
                                    navigate(item.to);
                                }}
                            >
                                <Icon className={cx('dropdownIcon')} />
                                {item.title}
                            </button>
                        );
                    })}

                    <span className={cx('dropdownLine')} />

                    <button
                        type="button"
                        className={cx('dropdownItem', 'logoutItem')}
                        onClick={handleLogout}
                        disabled={submitting}
                    >
                        <FiLogOut className={cx('dropdownIcon')} />
                        {submitting ? 'Đang đăng xuất...' : 'Đăng xuất'}
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserActions;