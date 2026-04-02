import classNames from 'classnames/bind';
import images from '~/assets';
import styles from './LoginRight.module.scss';

const cx = classNames.bind(styles);

function LoginRight() {
    return (
        <>
            <img
                src={images.BannerLogin}
                alt="Banner Login"
                className={cx('bannerImg')}
            />

            <div className={cx('bannerContent')}>
                <h2 className={cx('bannerTitle')}>Xây dựng tương lai với AI</h2>
                <p className={cx('bannerDesc')}>
                    Tạo hồ sơ chuyên nghiệp chỉ trong vài phút với công nghệ trí tuệ
                    nhân tạo hàng đầu.
                </p>
            </div>
        </>
    );
}

export default LoginRight;