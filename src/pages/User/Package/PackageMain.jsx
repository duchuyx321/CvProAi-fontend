import { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import { FileText, Brain, Download } from 'lucide-react';

import PackageCard from './components/PackageCard';
import styles from './PackageMain.module.scss';

import { getProfile } from '~/services/profile.service';

const cx = classNames.bind(styles);

const USAGE_CONFIG = [
    {
        key: 'cv',
        label: 'CV đã tạo',
        usageKey: 'cv_used',
        limitKey: 'cv_limit',
        icon: <FileText />,
        tone: 'primary',
    },
    {
        key: 'ai',
        label: 'Lượt phân tích AI',
        usageKey: 'ai_used',
        limitKey: 'ai_limit',
        icon: <Brain />,
        tone: 'warning',
    },
    {
        key: 'export',
        label: 'Lượt xuất PDF',
        usageKey: 'export_used',
        limitKey: 'export_limit',
        icon: <Download />,
        tone: 'info',
    },
];

function toNumber(value) {
    return Number(value) || 0;
}

function getUsagePercent(used, limit) {
    if (!limit) return 0;

    return Math.min(Math.round((used / limit) * 100), 100);
}

function getUsageStatus(used, limit) {
    if (!limit) return '';

    const percent = getUsagePercent(used, limit);

    if (percent >= 80) return 'Sắp hết';
    if (percent <= 50) return 'Bình thường';

    return '';
}

function buildPlanWithSubscription(planCurrent, subscriptionCurrent) {
    if (!planCurrent) return null;

    return {
        ...planCurrent,

        // lấy ngày bắt đầu từ subscriptionCurrent.current_period_start
        subscription_started_at:
            subscriptionCurrent?.current_period_start || null,

        // lấy ngày hết hạn từ subscriptionCurrent.current_period_end
        subscription_expires_at:
            subscriptionCurrent?.current_period_end || null,

        // lưu thêm trạng thái subscription nếu sau này cần dùng
        subscription_status: subscriptionCurrent?.status || null,
        cancel_at_period_end:
            subscriptionCurrent?.cancel_at_period_end || false,
    };
}

function PackageUsage({ plan = {}, usage = {} }) {
    const usageItems = useMemo(() => {
        return USAGE_CONFIG.map((item) => {
            const used = toNumber(usage?.[item.usageKey]);
            const limit = toNumber(plan?.[item.limitKey]);
            const percent = getUsagePercent(used, limit);
            const status = getUsageStatus(used, limit);

            return {
                ...item,
                used,
                limit,
                percent,
                status,
            };
        });
    }, [plan, usage]);

    return (
        <section className={cx('usageSection')}>
            <div className={cx('sectionHead')}>
                <h2 className={cx('sectionTitle')}>Mức sử dụng hiện tại</h2>
                <p className={cx('sectionDesc')}>
                    Theo dõi số lượt sử dụng còn lại trong gói dịch vụ của bạn.
                </p>
            </div>

            <div className={cx('usageList')}>
                {usageItems.map((item) => (
                    <article
                        key={item.key}
                        className={cx('usageCard', item.tone)}
                    >
                        <div className={cx('usageTop')}>
                            <span className={cx('usageIcon', item.tone)}>
                                {item.icon}
                            </span>

                            {item.status ? (
                                <span className={cx('usageStatus', item.tone)}>
                                    {item.status}
                                </span>
                            ) : null}
                        </div>

                        <p className={cx('usageLabel')}>{item.label}</p>

                        <strong className={cx('usageValue')}>
                            {item.used}
                            <span>/{item.limit}</span>
                        </strong>

                        <div className={cx('usageTrack')}>
                            <span
                                className={cx('usageBar', item.tone)}
                                style={{
                                    width: `${item.percent}%`,
                                }}
                            />
                        </div>

                        <p className={cx('usageRemaining')}>
                            Còn lại: {Math.max(item.limit - item.used, 0)}
                        </p>
                    </article>
                ))}
            </div>
        </section>
    );
}

function PackageMain() {
    const [planCurrent, setPlanCurrent] = useState(null);
    const [usage, setUsage] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const fetchProfile = async () => {
            try {
                setIsLoading(true);

                const result = await getProfile();

                if (result?.status >= 400 || result?.success === false) {
                    throw new Error(
                        result?.message ||
                            result?.messsage ||
                            'Không thể tải thông tin gói dịch vụ',
                    );
                }

                const profileData = result?.data || {};
                const nextPlanCurrent = profileData?.planCurrent || null;
                const subscriptionCurrent =
                    profileData?.subscriptionCurrent || null;
                const nextUsage = profileData?.usage || {};

                if (!nextPlanCurrent) {
                    throw new Error('Không tìm thấy thông tin gói hiện tại');
                }

                const nextPlanWithSubscription = buildPlanWithSubscription(
                    nextPlanCurrent,
                    subscriptionCurrent,
                );

                if (!cancelled) {
                    setPlanCurrent(nextPlanWithSubscription);
                    setUsage(nextUsage);
                }
            } catch (error) {
                if (!cancelled) {
                    setPlanCurrent(null);
                    setUsage({});

                    toast.error(
                        error?.response?.data?.message ||
                            error?.response?.data?.messsage ||
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

        fetchProfile();

        return () => {
            cancelled = true;
        };
    }, []);

    if (isLoading) {
        return (
            <div className={cx('wrapper')}>
                <p className={cx('loading')}>
                    Đang tải thông tin gói dịch vụ...
                </p>
            </div>
        );
    }

    if (!planCurrent) {
        return (
            <div className={cx('wrapper')}>
                <p className={cx('empty')}>Không có dữ liệu gói dịch vụ.</p>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('contentGrid')}>
                <div className={cx('leftCol')}>
                    <PackageCard plan={planCurrent} />
                </div>

                <div className={cx('rightCol')}>
                    <PackageUsage plan={planCurrent} usage={usage} />
                </div>
            </div>
        </div>
    );
}

export default PackageMain;