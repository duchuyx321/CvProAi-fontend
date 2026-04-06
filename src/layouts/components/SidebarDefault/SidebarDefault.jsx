import React from 'react';
import classNames from 'classnames/bind';
import { NavLink } from 'react-router-dom';
import styles from './SidebarDefault.module.scss';

import { CgProfile } from 'react-icons/cg';
import { FiAward } from 'react-icons/fi';
import { IoDocumentTextOutline } from 'react-icons/io5';
import images from '~/assets';
import { GoHome } from 'react-icons/go';
import { RiAiGenerate2, RiFolderUserLine } from 'react-icons/ri';

const cx = classNames.bind(styles);

function SidebarDefault() {
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
                    <h1 className={cx('brand-name')}>CvProAI</h1>
                    <span className={cx('brand-slogan')}>
                        Hệ thống tạo CV bằng AI
                    </span>
                </div>
            </div>

            <div className={cx('menu-section')}>
                <nav className={cx('nav-menu')}>
                    <NavLink
                        to="/user/dashboard"
                        className={({ isActive }) =>
                            cx('nav-item', { active: isActive })
                        }
                    >
                        <GoHome className={cx('icon')} />
                        <span className={cx('label')}>Trang chủ</span>
                    </NavLink>

                    <NavLink
                        to="/user/templates"
                        className={({ isActive }) =>
                            cx('nav-item', { active: isActive })
                        }
                    >
                        <IoDocumentTextOutline className={cx('icon')} />
                        <span className={cx('label')}>Mẫu CV</span>
                    </NavLink>

                    <NavLink
                        to="/user/my-cvs"
                        className={({ isActive }) =>
                            cx('nav-item', { active: isActive })
                        }
                    >
                        <RiFolderUserLine className={cx('icon')} />
                        <span className={cx('label')}>CV của tôi</span>
                    </NavLink>

                    <NavLink
                        to="/user/ai-analysis"
                        className={({ isActive }) =>
                            cx('nav-item', { active: isActive })
                        }
                    >
                        <RiAiGenerate2 className={cx('icon')} />
                        <span className={cx('label')}>
                            Phân tích CV bằng AI
                        </span>
                    </NavLink>
                </nav>

                <div className={cx('dividerTitle')}></div>

                <div className={cx('group-title')}>TÀI KHOẢN</div>

                <nav className={cx('nav-menu')}>
                    <NavLink
                        to="/user/upgrade-premium"
                        className={({ isActive }) =>
                            cx('nav-item', { active: isActive })
                        }
                    >
                        <FiAward className={cx('icon', 'icon-gold')} />
                        <span className={cx('label')}>Nâng cấp Premium</span>
                    </NavLink>

                    <NavLink
                        to="/profile"
                        className={({ isActive }) =>
                            cx('nav-item', { active: isActive })
                        }
                    >
                        <CgProfile className={cx('icon')} />
                        <span className={cx('label')}>Hồ sơ cá nhân</span>
                    </NavLink>
                </nav>
            </div>

            <div className={cx('capacity-section')}>
                <div className={cx('capacity-box')}>
                    <div className={cx('capacity-title')}>Dung lượng AI</div>
                    <div className={cx('progress-bar-bg')}>
                        <div
                            className={cx('progress-bar-fill')}
                            style={{ width: '66.6%' }}
                        ></div>
                    </div>
                    <div className={cx('capacity-text')}>
                        8/12 phân tích còn lại trong tháng
                    </div>
                </div>
            </div>
        </aside>
    );
}

export default SidebarDefault;
