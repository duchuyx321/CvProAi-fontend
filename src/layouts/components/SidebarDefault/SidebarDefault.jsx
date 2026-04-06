import React from 'react';
import classNames from 'classnames/bind';
import { NavLink } from 'react-router-dom';
import styles from './SidebarDefault.module.scss';
import images from '~/assets';

import { CgProfile } from 'react-icons/cg';
import { FiAward } from 'react-icons/fi';
import { IoDocumentTextOutline } from 'react-icons/io5';
import { GoHome } from 'react-icons/go';
import { RiAiGenerate2, RiFolderUserLine } from 'react-icons/ri';
import { config } from '~/config';

const cx = classNames.bind(styles);

const MAIN_MENU = [
    { title: 'Trang chủ', to: config.router.userDashboard, Icon: GoHome },
    {
        title: 'Mẫu CV',
        to: config.router.cvTemplates,
        Icon: IoDocumentTextOutline,
    },
    {
        title: 'CV của tôi',
        to: config.router.myCvs,
        Icon: RiFolderUserLine,
    },
    {
        title: 'Phân tích CV bằng AI',
        to: config.router.aiAnalysis,
        Icon: RiAiGenerate2,
    },
];

const ACCOUNT_MENU = [
    {
        title: 'Nâng cấp Premium',
        to: config.router.upgradePremium,
        Icon: FiAward,
        isGold: true,
    },
    { 
        title: 'Hồ sơ cá nhân', 
        to: config.router.userProfile, 
        Icon: CgProfile 
    },
];

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
                    {MAIN_MENU.map((item, index) => {
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

                <div className={cx('dividerTitle')}></div>
                <div className={cx('group-title')}>TÀI KHOẢN</div>

                <nav className={cx('nav-menu')}>
                    {ACCOUNT_MENU.map((item, index) => {
                        const Icon = item.Icon;
                        return (
                            <NavLink
                                key={index}
                                to={item.to}
                                className={({ isActive }) =>
                                    cx('nav-item', { active: isActive })
                                }
                            >
                                <Icon
                                    className={cx('icon', {
                                        'icon-gold': item.isGold,
                                    })}
                                />
                                <span className={cx('label')}>
                                    {item.title}
                                </span>
                            </NavLink>
                        );
                    })}
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
