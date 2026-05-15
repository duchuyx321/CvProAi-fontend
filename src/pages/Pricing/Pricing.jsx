import { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import styles from './Pricing.module.scss';
import PricingCard from './components/PricingCard';
import { useAuth } from '~/context/AuthContext';
import { getPricing } from '~/services/pricing.service';

const cx = classNames.bind(styles);

function normalizeSlug(value = '') {
    return String(value).trim().toLowerCase();
}

function Pricing() {
    const { isAuthenticated, user, isInitialized } = useAuth();

    const currentPlanSlug = useMemo(() => {
        return normalizeSlug(user?.planCurrent?.slug || '');
    }, [user]);

    const isCurrentPremium = isAuthenticated && currentPlanSlug === 'premium';

    const [pricing, setPricing] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchPricing = async () => {
            try {
                setIsLoading(true);

                const result = await getPricing();

                if (result?.status >= 400 || result?.success === false) {
                    throw new Error(
                        result?.message ||
                            result?.messsage ||
                            'Không thể tải bảng giá',
                    );
                }

                const plans = Array.isArray(result?.data?.data)
                    ? result.data.data
                    : [];

                const activePlans = plans.filter((plan) => plan?.is_active);

                if (!cancelled) {
                    setPricing(activePlans);
                }
            } catch (error) {
                if (!cancelled) {
                    toast.error(
                        error?.response?.data?.message ||
                            error?.response?.data?.messsage ||
                            error?.message ||
                            'Có lỗi xảy ra, vui lòng thử lại sau',
                    );

                    setPricing([]);
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

    const checkIsCurrentPlan = (plan) => {
        if (!isInitialized || !isAuthenticated) return false;

        return currentPlanSlug === normalizeSlug(plan?.slug);
    };

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
                                isAuthenticated={
                                    isInitialized && isAuthenticated
                                }
                                isCurrentPlan={checkIsCurrentPlan(plan)}
                                isCurrentPremium={
                                    isInitialized && isCurrentPremium
                                }
                            />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}

export default Pricing;