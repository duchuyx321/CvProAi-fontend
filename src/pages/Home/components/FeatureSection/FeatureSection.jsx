import classNames from 'classnames/bind';
import styles from './FeatureSection.module.scss';
import {
    MdOutlineEditNote,
    MdOutlineImageSearch,
    MdOutlineLightbulb,
    MdOutlinePictureAsPdf,
} from 'react-icons/md';
const cx = classNames.bind(styles);

const FEATURES = [
    {
        id: 1,
        icon: <MdOutlineEditNote />,
        title: 'Tạo CV trực tuyến',
        desc: 'Trình tạo CV trực quan, dễ sử dụng với kho mẫu chuyên nghiệp chuẩn ATS.',
    },
    {
        id: 2,
        icon: <MdOutlineImageSearch />,
        title: 'Phân tích CV bằng AI',
        desc: 'So sánh CV của bạn với Job Description để tính Matching Score chính xác.',
    },
    {
        id: 3,
        icon: <MdOutlineLightbulb />,
        title: 'Gợi ý cải thiện',
        desc: 'AI đề xuất các kỹ năng, từ khóa và nội dung cần bổ sung để tối ưu hồ sơ.',
    },
    {
        id: 4,
        icon: <MdOutlinePictureAsPdf />,
        title: 'Xuất CV PDF',
        desc: 'Xuất file PDF chất lượng cao, giữ nguyên định dạng trên mọi thiết bị.',
    },
];

function FeatureSection() {
    return (
        <section className={cx('wrapper')}>
            <div className={cx('inner')}>
                <div className={cx('header')}>
                    <h2 className={cx('title')}>Tính năng ưu việt</h2>
                    <p className={cx('subtitle')}>
                        Giải pháp AI toàn diện giúp bạn vượt qua mọi vòng kiểm duyệt
                        của nhà tuyển dụng.
                    </p>
                </div>

                <div className={cx('grid')}>
                    {FEATURES.map((item) => (
                        <div key={item.id} className={cx('card')}>
                            <div className={cx('icon')}>{item.icon}</div>
                            <h3 className={cx('name')}>{item.title}</h3>
                            <p className={cx('text')}>{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FeatureSection;