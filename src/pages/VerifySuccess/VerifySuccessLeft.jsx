import classNames from 'classnames/bind';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheck } from 'react-icons/fa6';

import { config } from '~/config';
import Button from '~/components/Button';
import styles from './VerifySuccess.module.scss';

const cx = classNames.bind(styles);

const MENU_CONTENT = {
    verify: {
        title: 'Xác minh email thành công',
        desc: 'Địa chỉ email của bạn đã được xác minh an toàn. Bây giờ bạn có thể đăng nhập và bắt đầu tạo CV chuyên nghiệp.',
    },
    reset: {
        title: 'Cấp mật khẩu thành công',
        desc: 'Hệ thống đã tạo mật khẩu mới và gửi đến email của bạn. Vui lòng kiểm tra hộp thư để lấy mật khẩu và tiến hành đăng nhập.',
    },
};

function VerifySuccessLeft() {
    const navigate = useNavigate();
    const { state } = useLocation();

    const formType = state?.form;
    const content = MENU_CONTENT[formType] || MENU_CONTENT.verify;

    const handleClick = () => {
        navigate(config.router.login);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('icon')}>
                <FaCheck />
            </div>

            <div className={cx('title')}>
                <h3>{content.title}</h3>
            </div>

            <div className={cx('desc')}>
                <p>{content.desc}</p>
            </div>

            <div className={cx('action')}>
                <Button
                    primary
                    large
                    className={cx('submit')}
                    onClick={handleClick}
                >
                    Đi tới Đăng nhập
                </Button>
            </div>
        </div>
    );
}

export default VerifySuccessLeft;