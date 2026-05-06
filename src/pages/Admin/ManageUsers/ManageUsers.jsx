import classNames from 'classnames/bind';

import UserTable from './components/UserTable';
import styles from './ManageUsers.module.scss';

const cx = classNames.bind(styles);

function ManageUsers() {
    return (
        <div className={cx('wrapper')}>
            <UserTable />
        </div>
    );
}

export default ManageUsers;
