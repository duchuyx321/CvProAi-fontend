import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import PackageCard from './components/PackageCard';
import styles from './PackageMain.module.scss';
// import {
//     cancelPackageSubscription,
//     getMyPackage,
// } from '~/services/package.service';

const cx = classNames.bind(styles);

// eslint-disable-next-line react-refresh/only-export-components
export const PACKAGE_MOCKS = {
    success: true,
    message: 'Lấy thông tin gói dịch vụ thành công',
    data: {
        current_plan: {
            id: 'plan_premium_active',
            name: 'Premium',
            description:
                'Gói nâng cao cho người dùng cần tối ưu CV chuyên sâu, xem full phân tích AI và xuất file chất lượng cao.',
            price: '199000',
            currency: 'VND',
            billing_cycle: 'MONTH',
            cv_limit: 20,
            export_limit: 15,
            ai_limit: 10,
            premium_template: true,
            remove_watermark: true,
            custom_domain: true,
            priority_support: true,
            is_active: true,
            slug: 'premium',
            view_full_ai_analysis: true,
            started_at: '2026-05-15T00:00:00.000Z',
            expires_at: '2026-06-15T00:00:00.000Z',
            auto_renew: true,
            cancel_at_period_end: false,
            cancelled_at: null,
            can_cancel: true,
            status: 'ACTIVE',
        },
        usage: {
            cv_used: 8,
            export_used: 5,
            ai_used: 4,
        },
    },
    date: '08:39:35 21/04/2026',
    path: '/api/v1/users/me/package',
};

function PackageMain() {
    const [packageData, setPackageData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchPackage = async () => {
            setIsLoading(true);

            try {
                // const result = await getMyPackage();
                const result = PACKAGE_MOCKS;

                if (!result?.success) {
                    throw new Error(
                        result?.message ||
                            'Không thể tải thông tin gói dịch vụ',
                    );
                }

                if (!result?.data?.current_plan) {
                    throw new Error('Dữ liệu gói hiện tại không hợp lệ');
                }

                setPackageData(result.data);
            } catch (error) {
                toast.error(
                    error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchPackage();
    }, []);

    const updateCurrentPlan = (updater) => {
        setPackageData((prev) => {
            if (!prev?.current_plan) return prev;

            return {
                ...prev,
                current_plan: {
                    ...prev.current_plan,
                    ...updater,
                },
            };
        });
    };

    const handleCancelPackage = async () => {
        const confirmed = window.confirm(
            'Nếu bạn hủy, bạn vẫn sẽ được toàn quyền truy cập vào các tính năng của gói cho đến hết chu kỳ thanh toán hiện tại. Bạn có muốn tiếp tục không?',
        );

        if (!confirmed) return;

        setIsSubmitting(true);

        try {
            // const result = await cancelPackageSubscription();
            const result = {
                success: true,
                message: 'Đã hủy gia hạn gói thành công',
            };

            if (!result?.success) {
                throw new Error(
                    result?.message || 'Không thể hủy gói dịch vụ',
                );
            }

            updateCurrentPlan({
                auto_renew: false,
                cancel_at_period_end: true,
                cancelled_at: new Date().toISOString(),
                can_cancel: false,
                status: 'ACTIVE',
            });

            toast.success(result.message);
        } catch (error) {
            toast.error(
                error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className={cx('wrapper')}>
                <p className={cx('loading')}>Đang tải thông tin gói dịch vụ...</p>
            </div>
        );
    }

    if (!packageData) {
        return (
            <div className={cx('wrapper')}>
                <p className={cx('empty')}>Không có dữ liệu gói dịch vụ.</p>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <PackageCard
                plan={packageData.current_plan}
                usage={packageData.usage}
                isSubmitting={isSubmitting}
                onCancelPackage={handleCancelPackage}
            />
        </div>
    );
}

export default PackageMain;