import classNames from 'classnames/bind';
import styles from './BannerSection.module.scss';
import images from '~/assets';
import Button from '~/components/Button';
import { BsStars } from "react-icons/bs";
import { config } from '~/config';
const cx = classNames.bind(styles);

function BannerSection() {
    return (
        <section className={cx('wrapper')}>
            <div className={cx('inner')}>
                <div className={cx('left')}>
                    <div className={cx('badge')}>
                        <span className={cx('badge-icon')}><BsStars /></span>
                        Đột phá bởi trí tuệ nhân tạo
                    </div>

                    <h1 className={cx('title')}>
                        Tạo CV chuyên<br />
                        nghiệp –{' '}
                        <span className={cx('title-highlight')}>Đánh giá<br />CV</span> bằng AI
                    </h1>

                    <p className={cx('desc')}>
                        Tạo CV nhanh chóng, phân tích mức độ tương thích với bản mô tả
                        công việc (JD) và nhận gợi ý cải thiện từ trợ lý AI thông minh.
                    </p>

                    <div className={cx('cta-group')}>
                        <Button
                            primary
                            to={config.router.cvSample}
                            className={cx('btnPrimary')}
                        >
                            Tạo CV ngay
                        </Button>

                        <Button
                            outline
                            to={config.router.aiAnalysis}
                            className={cx('btnSecondary')}
                        >
                            Phân tích CV bằng AI
                        </Button>
                    </div>
                </div>

                <img
                    src={images.BannerHome}
                    alt="Người dùng tạo CV"
                    className={cx('img')}
                />
                <div className={cx('right')}>

                </div>
            </div>
        </section>
    );
}

export default BannerSection;