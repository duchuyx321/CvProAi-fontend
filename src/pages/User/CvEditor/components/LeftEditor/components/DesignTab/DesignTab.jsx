import classNames from 'classnames/bind';
import styles from './DesignTab.module.scss';

const cx = classNames.bind(styles);

function DesignTab() {
    return (
        <div className={cx('wrapper')}>
            <p className={cx('text')}>
                Phần tùy chỉnh thiết kế sẽ được triển khai tại đây.
            </p>
        </div>
    );
}

export default DesignTab;