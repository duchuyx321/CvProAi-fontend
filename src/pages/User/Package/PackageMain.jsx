import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import PackageCard from './components/PackageCard';
import styles from './PackageMain.module.scss';

import { useAuth } from '~/context/AuthContext';

// import { getMyPackage } from '~/services/package.service';

const cx = classNames.bind(styles);

// eslint-disable-next-line react-refresh/only-export-components
export const PACKAGE_MOCKS = {
    success: true,
    message: 'Lấy thông tin gói dịch vụ thành công',
    data: {
        current_plan: {
            // TEST user từng dùng Premium nhưng gói đã hết hạn
            id: '5ec4f731-9b3b-46b7-9a62-76f261af9819',
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
            allow_ai_addon_purchase: true,

            is_active: true,
            slug: 'premium',
            view_full_ai_analysis: true,

            created_at: '2026-03-15T00:00:00.000Z',
            updated_at: '2026-04-15T00:00:00.000Z',
        },

        subscription: {
            id: 'premium-expired-subscription-test-id',
            user_id: 'test-user-id',
            plan_id: '5ec4f731-9b3b-46b7-9a62-76f261af9819',
            order_id: 'premium-order-test-id',
            status: 'EXPIRED',
            current_period_start: '2026-03-15T00:00:00.000Z',
            current_period_end: '2026-04-15T00:00:00.000Z',
            cancel_at_period_end: false,
            canceled_at: null,
            created_at: '2026-03-15T00:00:00.000Z',
            updated_at: '2026-04-15T00:00:00.000Z',
        },

        usage: {
            id: 'premium-expired-usage-quota-test-id',
            user_id: 'test-user-id',
            period_month: '2026-04',

            ai_runs_used: 10,
            ai_runs_limit: 10,

            exports_used: 15,
            exports_limit: 15,
            cv_used: 20,
            created_at: '2026-04-01T00:00:00.000Z',
        },
    },
    date: '08:39:35 21/04/2026',
    path: '/api/v1/users/me/package',
};

function PackageMain() {
    const { isAuthenticated } = useAuth();

    const [packageData, setPackageData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchPackage = async () => {
            if (!isAuthenticated) {
                setPackageData(null);
                setIsLoading(false);
                return;
            }

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

                if (!result?.data?.subscription) {
                    throw new Error('Dữ liệu đăng ký gói không hợp lệ');
                }

                if (!cancelled) {
                    setPackageData(result.data);
                }
            } catch (error) {
                if (!cancelled) {
                    toast.error(
                        error?.response?.data?.message ||
                        error?.message ||
                        'Có lỗi xảy ra, vui lòng thử lại sau',
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchPackage();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className={cx('wrapper')}>
                <p className={cx('empty')}>
                    Vui lòng đăng nhập để xem thông tin gói dịch vụ của bạn.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={cx('wrapper')}>
                <p className={cx('loading')}>
                    Đang tải thông tin gói dịch vụ...
                </p>
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
                subscription={packageData.subscription}
                usage={packageData.usage}
            />
        </div>
    );
}

export default PackageMain;