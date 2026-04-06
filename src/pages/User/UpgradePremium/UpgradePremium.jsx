import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './UpgradePremium.module.scss';
import { useAuth } from '~/context/AuthContext';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { GiAlliedStar } from 'react-icons/gi';

const cx = classNames.bind(styles);

function UpgradePremium() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [packages, setPackages] = useState([]);
    const [faqs, setFaqs] = useState([]);

  
    useEffect(() => {
        const fetchUpgradeData = async () => {
            try {
                setIsLoading(true);


                // const resPackages = await axios.get('/api/v1/packages');
                // const resFaqs = await axios.get('/api/v1/faqs/upgrade');
                // setPackages(resPackages.data); ...

                await new Promise(resolve => setTimeout(resolve, 100));

                setPackages([
                    {
                        id: 'free_plan',
                        name: 'Gói Miễn Phí',
                        description: 'Dành cho người mới bắt đầu',
                        price: 0,
                        interval: '/ tháng',
                        isPopular: false,
                       
                        isCurrentPlan: user?.tier === 'Free' || !user?.tier, 
                        features: [
                            { text: '5 mẫu CV cơ bản', isActive: true },
                            { text: 'Phân tích AI giới hạn', isActive: true },
                            { text: 'Xuất PDF có watermark', isActive: true },
                            { text: 'Gợi ý nâng cao từ AI', isActive: false },
                        ]
                    },
                    {
                        id: 'premium_plan',
                        name: 'Gói Premium',
                        description: 'Tối ưu hóa sự nghiệp của bạn',
                        price: 199000,
                        interval: '/ tháng',
                        isPopular: true,
                        isCurrentPlan: user?.tier === 'Premium',
                        features: [
                            { text: 'Phân tích AI không giới hạn', isActive: true },
                            { text: 'Xuất PDF không watermark', isActive: true },
                            { text: 'Gợi ý nâng cao từ AI', isActive: true },
                            { text: 'Hỗ trợ ưu tiên 24/7', isActive: true },
                            { text: 'Truy cập tất cả các mẫu thiết kế', isActive: true },
                        ]
                    }

                ]);

                setFaqs([
                    {
                        id: 1,
                        question: 'Tôi có thể hủy gói Premium bất cứ lúc nào không?',
                        answer: 'Có, bạn có thể hủy đăng ký bất cứ lúc nào từ trang cài đặt tài khoản của mình. Quyền lợi Premium vẫn duy trì cho đến hết chu kỳ thanh toán.'
                    },
                    {
                        id: 2,
                        question: 'Các phương thức thanh toán được hỗ trợ?',
                        answer: 'Chúng tôi hỗ trợ thanh toán qua Ví MoMo, Thẻ tín dụng (Visa/Mastercard), và Chuyển khoản ngân hàng nội địa.'
                    },
                    {
                        id: 3,
                        question: 'Lợi ích của AI Analysis là gì?',
                        answer: 'AI của chúng tôi sẽ quét CV của bạn theo tiêu chuẩn ATS và đưa ra các đề xuất chỉnh sửa từ ngữ, định dạng để tăng tỷ lệ được gọi phỏng vấn lên 80%.'
                    }
                ]);

            } catch (error) {
                console.error("Lỗi tải dữ liệu gói dịch vụ:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUpgradeData();
    }, [user]);

    
    const handleUpgrade = (packageId) => {
        // [TODO BACKEND]: Gọi API tạo đơn hàng (Order) và trả về link thanh toán (VNPAY/MOMO)
        console.log("Tiến hành thanh toán cho gói:", packageId);
        // navigate(`/checkout/${packageId}`);
    };


    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
            .format(amount)
            .replace('₫', 'đ');
    };

    if (isLoading) {
        return <div className={cx('loading')}>Đang tải danh sách gói dịch vụ...</div>;
    }

    return (
        <div className={cx('wrapper')}>

            <div className={cx('header-section')}>
                <h1 className={cx('title')}>Nâng cấp tài khoản của bạn</h1>
                <p className={cx('subtitle')}>
                    Mở khóa sức mạnh của AI để tạo ra bản CV hoàn hảo nhất và nổi bật trước các nhà tuyển dụng hàng đầu.
                </p>
            </div>


            <div className={cx('packages-grid')}>
                {packages.map((pkg) => (
                    <div 
                        key={pkg.id} 
                        className={cx('package-card', { 'is-popular': pkg.isPopular })}
                    >
                        {/* Ruy băng (Ribbon) cho gói Phổ biến */}
                        {pkg.isPopular && <div className={cx('ribbon')}>PHỔ BIẾN</div>}

                        <div className={cx('pkg-header')}>
                            <h3 className={cx('pkg-name')}>
                                {pkg.name} 
                                {pkg.isPopular && <GiAlliedStar className={cx('star-icon')} />}
                            </h3>
                            <p className={cx('pkg-desc')}>{pkg.description}</p>
                        </div>

                        <div className={cx('pkg-price-wrap')}>
                            <span className={cx('pkg-price')}>{pkg.price === 0 ? '0đ' : formatCurrency(pkg.price)}</span>
                            <span className={cx('pkg-interval')}>{pkg.interval}</span>
                        </div>

                        <button 
                            className={cx('btn-action', { 
                                'btn-current': pkg.isCurrentPlan,
                                'btn-upgrade': !pkg.isCurrentPlan && pkg.isPopular,
                                'btn-standard': !pkg.isCurrentPlan && !pkg.isPopular
                            })}
                            disabled={pkg.isCurrentPlan}
                            onClick={() => handleUpgrade(pkg.id)}
                        >
                            {pkg.isCurrentPlan ? 'Đang sử dụng' : 'Nâng cấp ngay'}
                        </button>

                        <ul className={cx('feature-list')}>
                            {pkg.features.map((feature, index) => (
                                <li key={index} className={cx('feature-item', { 'inactive': !feature.isActive })}>
                                    {feature.isActive ? (
                                        <FiCheckCircle className={cx('icon-check', { 'blue': pkg.isPopular })} />
                                    ) : (
                                        <FiXCircle className={cx('icon-cross')} />
                                    )}
                                    <span>{feature.text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className={cx('faq-section')}>
                <h2 className={cx('faq-title')}>Câu hỏi thường gặp</h2>
                <div className={cx('faq-list')}>
                    {faqs.map(faq => (
                        <div key={faq.id} className={cx('faq-item')}>
                            <h4 className={cx('faq-question')}>{faq.question}</h4>
                            <p className={cx('faq-answer')}>{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className={cx('page-footer')}>
                © 2026 CvProAI Platform. Mọi quyền được bảo lưu.
            </div>
        </div>
    );
}

export default UpgradePremium;