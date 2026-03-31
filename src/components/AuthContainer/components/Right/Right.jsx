import classNames from 'classnames/bind';
import styles from './Right.module.scss';

const cx = classNames.bind(styles);

function Right({ className, children }) {
    return (
        <div className={cx('right', className)}>
            {children}
        </div>
    );
}

export default Right;