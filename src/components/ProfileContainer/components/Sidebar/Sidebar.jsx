import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { NavLink } from 'react-router-dom';
import { MdOutlineInventory2, MdOutlinePersonOutline, MdOutlineSecurity } from 'react-icons/md';

import { config } from '~/config';
import { getProfile } from '~/services/profile.service';
import styles from './Sidebar.module.scss';
import { RiHistoryLine } from 'react-icons/ri';

const cx = classNames.bind(styles);

const LIST_SIDEBARS = [
    {
        key: 'profile',
        title: 'Thông tin cá nhân',
        icon: <MdOutlinePersonOutline />,
        to: config.router.profile,
    },
    {
        key: 'security',
        title: 'Bảo mật',
        icon: <MdOutlineSecurity />,
        to: config.router.security,
    },
    {
        key: 'package',
        title: 'Gói dịch vụ',
        icon: <MdOutlineInventory2 />,
        to: config.router.package,
    },
    {
        key: 'history',
        title: 'Lịch sử giao dịch',
        icon: <RiHistoryLine />,
        to: config.router.history,
    },
];

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

function Sidebar() {
    const [user, setUser] = useState({
        name: 'Người dùng',
        role: 'Thành viên',
        avatar: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const result = await getProfile();

            if (!result?.success) return;

            const profile = result?.data || {};

            setUser({
                name: profile?.name || profile?.full_name || 'Người dùng',
                role: profile?.role || 'Thành viên',
                avatar: profile?.avatar || '',
            });
        };

        fetchProfile();
    }, []);

    const { name, role, avatar } = user;
    const hasAvatar = Boolean(avatar);

    return (
        <aside className={cx('wrapper')}>
            <div className={cx('card')}>
                <div className={cx('head')}>
                    <div className={cx('avatar')}>
                        {hasAvatar ? (
                            <img
                                src={avatar}
                                alt={name}
                                className={cx('avatarImg')}
                            />
                        ) : (
                            <span className={cx('avatarText')}>
                                {getInitial(name)}
                            </span>
                        )}
                    </div>

                    <h2 className={cx('name')}>{name}</h2>
                    <p className={cx('role')}>{role}</p>
                </div>

                <div className={cx('line')}></div>

                <nav className={cx('menu')}>
                    {LIST_SIDEBARS.map((item) => (
                        <NavLink
                            key={item.key}
                            to={item.to}
                            end
                            className={({ isActive }) =>
                                cx('item', { active: isActive })
                            }
                        >
                            <span className={cx('itemIcon')}>{item.icon}</span>
                            <span className={cx('itemText')}>{item.title}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>
        </aside>
    );
}

export default Sidebar;