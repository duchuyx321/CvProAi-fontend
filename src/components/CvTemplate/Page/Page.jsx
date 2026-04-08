import classNames from 'classnames/bind';
import styles from './Page.module.scss';

const cx = classNames.bind(styles);

function Page({ children, style }) {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('inner')} style={style}>
                {children}
            </div>
        </div>
    );
}

export default Page;