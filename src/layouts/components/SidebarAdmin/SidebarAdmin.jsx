import React, { useState } from 'react';
import classNames from 'classnames/bind';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './SidebarAdmin.module.scss';
import { useAuth } from '~/context/AuthContext';
import images from '~/assets';

import { FiUsers, FiShoppingCart, FiSettings, FiLogOut } from 'react-icons/fi';
import { TbLayoutDashboard } from 'react-icons/tb';
import { RiFileList2Line } from 'react-icons/ri';
import { LiaBoxSolid } from 'react-icons/lia';
import { config } from '~/config';

const cx = classNames.bind(styles);

const ADMIN_MENU = [
    {
        title: 'Trang tổng quan',
        to: config.router.adminDashboard,
        Icon: TbLayoutDashboard,
    },
    {
        title: 'Quản lý tài khoản',
        to: config.router.manageUsers,
        Icon: FiUsers,
    },
    {
        title: 'Quản lý mẫu CV',
        to: config.router.manageTemplates,
        Icon: RiFileList2Line,
    },
    {
        title: 'Quản lý đơn hàng',
        to: config.router.adminOrders,
        Icon: FiShoppingCart,
    },
    {
        title: 'Quản lý gói dịch vụ',
        to: config.router.managePackages,
        Icon: LiaBoxSolid,
    },
];

function SidebarAdmin() {
    const navigate = useNavigate();
    const { logout, clearAuthState } = useAuth();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const handleLogout = async () => {
        if (isLoggingOut) return;

        try {
            clearAuthState();
            await logout();
            navigate('/login');
        } finally {
            setIsLoggingOut(false);
            navigate(config.router.login);
        }
    };

    return (
        <aside className={cx('sidebar')}>
            <div className={cx('logo-section')}>
                <div className={cx('logo-icon')}>
                    <img
                        src={images.logo}
                        alt="CvProAI"
                        className={cx('logo-img')}
                    />
                </div>
                <div className={cx('brand-info')}>
                    <h1 className={cx('brand-name')}>CVProAI</h1>
                    <span className={cx('brand-slogan')}>
                        Hệ thống quản trị
                    </span>
                </div>
            </div>

            <div className={cx('menu-section')}>
                <nav className={cx('nav-menu')}>
                    {ADMIN_MENU.map((item, index) => {
                        const Icon = item.Icon;
                        return (
                            <NavLink
                                key={index}
                                to={item.to}
                                className={({ isActive }) =>
                                    cx('nav-item', { active: isActive })
                                }
                            >
                                <Icon className={cx('icon')} />
                                <span className={cx('label')}>
                                    {item.title}
                                </span>
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className={cx('logout-section')}>
                <button
                    className={cx('logout-btn')}
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                >
                    <FiLogOut className={cx('icon')} />
                    <span className={cx('label')}>
                        {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}
                    </span>
                </button>
            </div>
        </aside>
    );
}

export default SidebarAdmin;
