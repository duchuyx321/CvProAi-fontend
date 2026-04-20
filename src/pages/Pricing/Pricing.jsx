import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import { config } from '~/config';
// import { useAuth } from '~/context/AuthContext';
// import { getPricing } from '~/services/pricing.service';

import styles from './Pricing.module.scss';
import PricingCard from './components/PricingCard';

const cx = classNames.bind(styles);

// eslint-disable-next-line react-refresh/only-export-components
export const PRICING_RESPONSE = {
    success: true,
    message: 'Lấy bảng giá thành công',
    data: [
        {
            id: 1,
            key: 'free',
            title: 'Gói Miễn phí',
            description: 'Trí tuệ cho các nhu cầu tạo CV cơ bản hằng ngày',
            pricePrefix: '',
            price: '0đ',
            unit: '/vĩnh viễn',
            featureTitle: '',
            features: [
                'Phân tích AI giới hạn (5 lần/tháng)',
                'Xuất PDF có watermark',
            ],
            buttonText: 'Bắt đầu ngay',
            popular: false,
            badgeText: '',
            note: '',
        },
        {
            id: 2,
            key: 'premium',
            title: 'Gói Premium',
            description: 'Tối ưu toàn diện hơn với AI nâng cao và không giới hạn',
            pricePrefix: '',
            price: '199.000đ',
            unit: '/tháng',
            featureTitle: 'Mọi tính năng trong gói Miễn phí và:',
            features: [
                'Tạo CV không giới hạn',
                'Phân tích AI nâng cao (Không giới hạn)',
                'PDF không watermark (Chất lượng cao)',
                'Xem lịch sử phân tích và giao dịch',
            ],
            buttonText: 'Nâng cấp Premium',
            popular: true,
            badgeText: 'PHỔ BIẾN NHẤT',
            note: 'Phù hợp cho người dùng cần tối ưu CV chuyên sâu và sử dụng thường xuyên.',
        },
    ],
    meta: {
        timestamp: '2026-04-13T09:17:01Z',
        totalPlans: 2,
    },
};

function getPlanRoute(planKey, isAuthenticated) {
    if (!isAuthenticated) {
        if (planKey === 'free') return config.router.register;
        if (planKey === 'premium') return config.router.login;

        return config.router.home;
    }

    if (planKey === 'free') return config.router.cvTemplates;
    if (planKey === 'premium') return config.router.payment;

    return config.router.home;
}

function Pricing() {
    // const { isAuthenticated } = useAuth();
    const isAuthenticated = false;

    const [pricing, setPricing] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPricing = async () => {
            try {
                setIsLoading(true);

                // const result = await getPricing();
                const result = PRICING_RESPONSE;

                if (!result?.success) {
                    throw new Error(
                        result?.message || 'Không thể tải bảng giá',
                    );
                }

                if (!Array.isArray(result?.data)) {
                    throw new Error('Dữ liệu bảng giá không hợp lệ');
                }

                setPricing(result.data);
            } catch (error) {
                toast.error(
                    error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchPricing();
    }, []);

    const pricingViewData = pricing.map((plan) => ({
        ...plan,
        to: getPlanRoute(plan.key, isAuthenticated),
    }));

    return (
        <section className={cx('wrapper')}>
            <div className={cx('inner')}>
                <div className={cx('header')}>
                    <h1 className={cx('title')}>Gói dịch vụ phù hợp</h1>
                    <p className={cx('desc')}>
                        Chọn gói phù hợp để tối đa khả năng trúng tuyển.
                    </p>
                </div>

                <div className={cx('grid')}>
                    {!isLoading &&
                        pricingViewData.map((plan) => (
                            <PricingCard key={plan.id} plan={plan} />
                        ))}
                </div>
            </div>
        </section>
    );
}

export default Pricing;