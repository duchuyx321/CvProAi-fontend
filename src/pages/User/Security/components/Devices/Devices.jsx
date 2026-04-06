import classNames from 'classnames/bind';
import Button from '~/components/Button';
import styles from './Devices.module.scss';

const cx = classNames.bind(styles);

function Devices({ onClose }) {
    return (
        <div className={cx('wrapper')}>
            <p className={cx('text')}>
                Tính năng đang được phát triển, vui lòng quay lại sau.
            </p>

            <div className={cx('actions')}>
                <Button primary type="button" onClick={onClose}>
                    Đóng
                </Button>
            </div>
        </div>
    );
}

export default Devices;