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

function Pricing() {
    const { isAuthenticated, user } = useAuth();

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

                if (!result?.success) {
                    throw new Error(
                        result?.message ?? 'Không thể tải bảng giá',
                    );
                }

                if (!Array.isArray(result?.data?.data)) {
                    throw new Error('Dữ liệu bảng giá không hợp lệ');
                }

                const activePlans = result.data?.data.filter(
                    (plan) => plan.is_active === true,
                );

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
