import { useMemo, useState } from 'react';
import classNames from 'classnames/bind';

import Modal from '~/components/Modal';
import SectionItem from '../Profile/components/SectionItem';
import Password from './components/Password';
import TwoFactor from './components/TwoFactor';
import Devices from './components/Devices';
import styles from './SecurityMain.module.scss';

const cx = classNames.bind(styles);

function SecurityMain({ LIST_CONTENT = [] }) {
    const [activeItem, setActiveItem] = useState(null);

    const loginList = useMemo(() => {
        return LIST_CONTENT.filter((item) => item.section === 'login');
    }, [LIST_CONTENT]);

    const sessionList = useMemo(() => {
        return LIST_CONTENT.filter((item) => item.section === 'session');
    }, [LIST_CONTENT]);

    const handleOpenModal = (item) => {
        setActiveItem(item);
    };

    const handleCloseModal = () => {
        setActiveItem(null);
    };

    const renderModalContent = () => {
        if (!activeItem?.key) return null;

        if (activeItem.key === 'password') {
            return <Password onClose={handleCloseModal} />;
        }

        if (activeItem.key === 'twoFactor') {
            return <TwoFactor onClose={handleCloseModal} />;
        }

        if (activeItem.key === 'devices') {
            return <Devices onClose={handleCloseModal} />;
        }

        return null;
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('pageHeader')}>
                {/* <h1 className={cx('pageTitle')}>Mật khẩu và bảo mật</h1>
                <p className={cx('pageDesc')}>
                    Quản lý mật khẩu và cài đặt bảo mật.
                </p> */}
            </div>

            <section className={cx('section')}>
                <div className={cx('header')}>
                    <h2 className={cx('title')}>Đăng nhập & khôi phục</h2>
                    <p className={cx('desc')}>
                        Quản lý mật khẩu và xác minh 2 bước.
                    </p>
                </div>

                <div className={cx('list')}>
                    {loginList.map((item) => (
                        <SectionItem
                            key={item.key}
                            label={item.label}
                            value={item.value}
                            onClick={() => handleOpenModal(item)}
                        />
                    ))}
                </div>
            </section>

            <section className={cx('section')}>
                <div className={cx('header-1')}>
                    <h2 className={cx('title')}>Phiên đăng nhập</h2>
                    <p className={cx('desc')}>
                        Quản lý và đăng xuất khỏi các thiết bị bạn đang đăng nhập.
                    </p>
                </div>

                <div className={cx('list')}>
                    {sessionList.map((item) => (
                        <SectionItem
                            key={item.key}
                            label={item.label}
                            value={item.value}
                            onClick={() => handleOpenModal(item)}
                        />
                    ))}
                </div>
            </section>

            <Modal
                isOpen={Boolean(activeItem)}
                onClose={handleCloseModal}
                title={activeItem?.title || ''}
                description={activeItem?.description || ''}
                size="md"
            >
                <div className={cx('body')}>{renderModalContent()}</div>
            </Modal>
        </div>
    );
}

export default SecurityMain;