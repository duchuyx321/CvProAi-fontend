import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { CgProfile } from 'react-icons/cg';
import { FiLogOut } from 'react-icons/fi';

import { logout } from '~/services/auth.service';
import { config } from '~/config';
import styles from './UserActions.module.scss';
import { MdOutlineHome } from 'react-icons/md';
import { useAuth } from '~/context/AuthContext';

const cx = classNames.bind(styles);

function getInitial(name = '') {
    const words = name.trim().split(' ').filter(Boolean);

    if (!words.length) return 'U';

    if (words.length === 1) {
        return words[0].charAt(0).toUpperCase();
    }

    return (
        words[0].charAt(0) + words[words.length - 1].charAt(0)
    ).toUpperCase();
}

function UserActions({ user = {} }) {
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const { clearAuthState } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const displayName =
        user?.full_name || user?.fullName || user?.name || 'Nguyễn Văn A';

    const membership = user?.membership || user?.role || 'Thành viên';
    const avatar = user?.profile?.avatar_url || '';
    const hasAvatar = Boolean(avatar);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleToggleDropdown = () => {
        setIsOpen((prev) => !prev);
    };

    const handleNavigateProfile = () => {
        setIsOpen(false);
        navigate(config.router.profile);
    };

    const handleNavigateDashboard = () => {
        setIsOpen(false);
        navigate(config.router.dashboard);
    };

    const handleLogout = async () => {
        if (submitting) return;

        try {
            setSubmitting(true);
            clearAuthState();
            await logout();
        } finally {
            setIsOpen(false);
            navigate(config.router.login);
            setSubmitting(false);
        }
    };

    return (
        <div className={cx('wrapper')} ref={dropdownRef}>
            <button
                type="button"
                className={cx('userInfo')}
                onClick={handleToggleDropdown}
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

            {isOpen ? (
                <div className={cx('dropdown')}>
                    <button
                        type="button"
                        className={cx('dropdownItem')}
                        onClick={handleNavigateDashboard}
                    >
                        <MdOutlineHome className={cx('dropdownIcon')} />
                        Dashboard
                    </button>

                    <span className={cx('dropdownLine')}></span>

                    <button
                        type="button"
                        className={cx('dropdownItem')}
                        onClick={handleNavigateProfile}
                    >
                        <CgProfile className={cx('dropdownIcon')} />
                        Hồ sơ cá nhân
                    </button>

                    <span className={cx('dropdownLine')}></span>

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
            ) : null}
        </div>
    );
}

export default UserActions;
