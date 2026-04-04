import React, { useState } from 'react';
import classNames from 'classnames/bind';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './SidebarAdmin.module.scss';

// Import Icons
import { FiUsers, FiFileText, FiPackage, FiShoppingCart, FiSettings, FiLogOut } from "react-icons/fi";
import images from '~/assets';
import { TbLayoutDashboard } from 'react-icons/tb';
import { RiFileList2Line } from 'react-icons/ri';
import { FaBoxArchive } from 'react-icons/fa6';
import { LiaBoxSolid } from 'react-icons/lia';

const cx = classNames.bind(styles);

function SidebarAdmin() {
    const navigate = useNavigate();
    const [isLoggingOut, setIsLoggingOut] = useState(false);


    const handleLogout = async () => {
        if (isLoggingOut) return; 

        try {
            setIsLoggingOut(true);
            
            // Thay đổi URL này thành endpoint thực tế của bạn sau này
            /*
            await fetch('https://api.yourdomain.com/v1/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            */
            
            // Giả lập delay mạng 500ms (Xóa dòng này khi có API thật)
            await new Promise(resolve => setTimeout(resolve, 500));

            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');

            navigate('/login');

        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
            alert('Có lỗi xảy ra khi đăng xuất!');
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <aside className={cx('sidebar')}>
            <div className={cx('logo-section')}>
                <div className={cx('logo-icon')}>
                    <img src={images.logo} alt="CvProAI" className={cx("logo-img")} />
                </div>
                <div className={cx('brand-info')}>
                    <h1 className={cx('brand-name')}>CVProAI</h1>
                    <span className={cx('brand-slogan')}>Hệ thống quản trị</span>
                </div>
            </div>


            <div className={cx('menu-section')}>
                <nav className={cx('nav-menu')}>
                    <NavLink to="/admin/dashboard" className={({ isActive }) => cx('nav-item', { active: isActive })}>
                        <TbLayoutDashboard className={cx('icon')} />
                        <span className={cx('label')}>Trang tổng quan</span>
                    </NavLink>

                    <NavLink to="/admin/manage-users" className={({ isActive }) => cx('nav-item', { active: isActive })}>
                        <FiUsers className={cx('icon')} />
                        <span className={cx('label')}>Quản lý tài khoản</span>
                    </NavLink>

                    <NavLink to="/admin/templates" className={({ isActive }) => cx('nav-item', { active: isActive })}>
                        <RiFileList2Line className={cx('icon')} />
                        <span className={cx('label')}>Quản lý mẫu CV</span>
                    </NavLink>

                    <NavLink to="/admin/packages" className={({ isActive }) => cx('nav-item', { active: isActive })}>
                        <LiaBoxSolid className={cx('icon')} />
                        <span className={cx('label')}>Quản lý gói dịch vụ</span>
                    </NavLink>

                    <NavLink to="/admin/orders" className={({ isActive }) => cx('nav-item', { active: isActive })}>
                        <FiShoppingCart className={cx('icon')} />
                        <span className={cx('label')}>Quản lý đơn hàng</span>
                    </NavLink>

                    <NavLink to="/admin/settings" className={({ isActive }) => cx('nav-item', { active: isActive })}>
                        <FiSettings className={cx('icon')} />
                        <span className={cx('label')}>Cài đặt</span>
                    </NavLink>
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