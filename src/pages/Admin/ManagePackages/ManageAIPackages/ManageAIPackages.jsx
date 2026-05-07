import classNames from 'classnames/bind';
import styles from './ManageAIPackages.module.scss';

const cx = classNames.bind(styles);

function ManageAIPackages() {
    return (
        <section className={cx('wrapper')}>
            <h1>Quản lý gói AI</h1>
            <p>Tính năng đang được phát triển.</p>
        </section>
    );
}

export default ManageAIPackages;
