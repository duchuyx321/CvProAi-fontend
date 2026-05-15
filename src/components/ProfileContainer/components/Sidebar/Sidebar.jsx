import classNames from 'classnames/bind';
import { NavLink } from 'react-router-dom';
import {
    MdOutlineInventory2,
    MdOutlinePersonOutline,
    MdOutlineSecurity,
} from 'react-icons/md';
import { RiHistoryLine } from 'react-icons/ri';

import { config } from '~/config';
import { useAuth } from '~/context/AuthContext';
import styles from './Sidebar.module.scss';

const cx = classNames.bind(styles);

const LIST_SIDEBARS = [
    {
        title: 'Thông tin cá nhân',
        icon: <MdOutlinePersonOutline />,
        to: config.router.profile,
    },
    {
        title: 'Bảo mật',
        icon: <MdOutlineSecurity />,
        to: config.router.security,
    },
    {
        title: 'Gói dịch vụ',
        icon: <MdOutlineInventory2 />,
        to: config.router.package,
    },
    {
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
    const { user } = useAuth();

    const fullName = user?.full_name;
    const role = user?.role;
    const avatarUrl = user?.profile?.avatar_url || '';
    const hasAvatar = Boolean(avatarUrl);

    return (
        <aside className={cx('wrapper')}>
            <div className={cx('card')}>
                <div className={cx('head')}>
                    <div className={cx('avatar')}>
                        {hasAvatar ? (
                            <img
                                src={avatarUrl}
                                alt={fullName}
                                className={cx('avatarImg')}
                            />
                        ) : (
                            <span className={cx('avatarText')}>
                                {getInitial(fullName)}
                            </span>
                        )}
                    </div>

                    <h2 className={cx('name')}>{fullName}</h2>
                    <p className={cx('role')}>{role}</p>
                </div>

                <div className={cx('line')} />

                <nav className={cx('menu')}>
                    {LIST_SIDEBARS.map((item) => (
                        <NavLink
                            key={item.to}
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