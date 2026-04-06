import classNames from 'classnames/bind';

import Sidebar from './components/Sidebar';
import Main from './components/Main';
import styles from './ProfileContainer.module.scss';

const cx = classNames.bind(styles);

function ProfileContainer({ childrenMain }) {
    return (
        <section className={cx('wrapper')}>
            <div className={cx('container')}>
                <Sidebar />
                <Main childrenMain={childrenMain} />
            </div>
        </section>
    );
}

export default ProfileContainer;