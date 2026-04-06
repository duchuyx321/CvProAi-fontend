import classNames from 'classnames/bind';

import styles from './Main.module.scss';

const cx = classNames.bind(styles);

function Main({ childrenMain }) {
    return <main className={cx('wrapper')}>{childrenMain}</main>;
}

export default Main;