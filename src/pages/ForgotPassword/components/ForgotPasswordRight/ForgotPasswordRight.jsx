import classNames from 'classnames/bind';
import images from '~/assets';
import styles from './ForgotPasswordRight.module.scss';

const cx = classNames.bind(styles);

function ForgotPasswordRight() {
    return (
        <>
            <img
                src={images.BannerForgotPassword}
                alt="Forgot Password Banner"
                className={cx('bannerImg')}
            />

            <div className={cx('bannerContent')}>
                <h2 className={cx('bannerTitle')}>
                    Khôi phục quyền
                    <br />
                    truy cập của bạn
                </h2>

                <p className={cx('bannerDesc')}>
                    Đừng lo lắng khi quên mật khẩu. Hệ thống bảo mật của chúng tôi
                    sẽ giúp bạn đặt lại mật khẩu an toàn và tiếp tục hành trình xây
                    dựng CV chuyên nghiệp.
                </p>
            </div>
        </>
    );
}

export default ForgotPasswordRight;