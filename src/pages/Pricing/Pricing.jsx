import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import styles from './Pricing.module.scss';
import PricingCard from './components/PricingCard';
import { useAuth } from '~/context/AuthContext';
import { getPricing } from '~/services/pricing.service';

const cx = classNames.bind(styles);

function normalizeSlug(value = '') {
    return value.trim().toLowerCase();
}

// eslint-disable-next-line react-refresh/only-export-components
// export const PRICING_RESPONSE = {
//     success: true,
//     message: 'Lấy dữ liệu thành công',
//     data: [
//         {
//             id: '02cd62a8-749a-4541-8202-be8e947a489b',
//             name: 'Free',
//             description:
//                 'Gói miễn phí để tạo CV, phân tích AI cơ bản và xuất file với giới hạn hằng tháng.',
//             price: '0',
//             currency: 'VND',
//             billing_cycle: 'MONTH',
//             cv_limit: 2,
//             export_limit: 5,
//             ai_limit: 3,
//             premium_template: false,
//             remove_watermark: false,
//             custom_domain: false,
//             priority_support: false,
//             allow_ai_addon_purchase: false,
//             is_active: true,
//             slug: 'free',
//             view_full_ai_analysis: true,
//         },
//         {
//             id: '5ec4f731-9b3b-46b7-9a62-76f261af9819',
//             name: 'Premium',
//             description:
//                 'Gói nâng cao cho người dùng cần tối ưu CV chuyên sâu, xem full phân tích AI và xuất file chất lượng cao.',
//             price: '199000',
//             currency: 'VND',
//             billing_cycle: 'MONTH',
//             cv_limit: 20,
//             export_limit: 15,
//             ai_limit: 10,
//             premium_template: true,
//             remove_watermark: true,
//             custom_domain: true,
//             priority_support: true,
//             allow_ai_addon_purchase: true,
//             is_active: true,
//             slug: 'premium',
//             view_full_ai_analysis: true,
//         },
//     ],
// };

function Pricing() {
    const { isAuthenticated, user } = useAuth();

    // giả lập user đã đăng nhập và đang dùng gói Premium
    // const isAuthenticated = true;
    // const user = {
    //     plan: {
    //         name: 'Premium',
    //         slug: 'Premium',
    //     },
    // };

    const currentPlanSlug = normalizeSlug(user?.plan?.slug ?? 'free');

    const isCurrentPremium = isAuthenticated && currentPlanSlug === 'premium';

    const checkIsCurrentPlan = (plan) => {
        if (!isAuthenticated) return false;

        return currentPlanSlug === normalizeSlug(plan.slug);
    };

    const [pricing, setPricing] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchPricing = async () => {
            setIsLoading(true);

            try {
                const result = await getPricing();
                // const result = PRICING_RESPONSE;

                if (!result?.success) {
                    throw new Error(
                        result?.message ?? 'Không thể tải bảng giá',
                    );
                }

                if (!Array.isArray(result?.data)) {
                    throw new Error('Dữ liệu bảng giá không hợp lệ');
                }

                const activePlans = result.data.filter((plan) => plan.is_active === true);

                if (!cancelled) {
                    setPricing(activePlans);
                }
            } catch (error) {
                if (!cancelled) {
                    toast.error(
                        error?.message ?? 'Có lỗi xảy ra, vui lòng thử lại sau',
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchPricing();

        return () => {
            cancelled = true;
        };
    }, []);

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
                    {isLoading ? (
                        <p className={cx('loading')}>Đang tải bảng giá...</p>
                    ) : pricing.length === 0 ? (
                        <p className={cx('empty')}>
                            Hiện chưa có gói dịch vụ nào.
                        </p>
                    ) : (
                        pricing.map((plan) => (
                            <PricingCard
                                key={plan.id}
                                plan={plan}
                                isAuthenticated={isAuthenticated}
                                isCurrentPlan={checkIsCurrentPlan(plan)}
                                isCurrentPremium={isCurrentPremium}
                            />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}

export default Pricing;