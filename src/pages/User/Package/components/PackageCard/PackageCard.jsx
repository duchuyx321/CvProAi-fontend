import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import classNames from 'classnames/bind';

import styles from './PackageCard.module.scss';

const cx = classNames.bind(styles);

const VI_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const BILLING_CYCLE_LABELS = {
    MONTH: '1 tháng',
    YEAR: '1 năm',
};

function formatPrice(value, currency = 'VND') {
    const amount = Number(value) || 0;

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(amount);
}

function formatDate(value) {
    if (!value) return '--';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '--';

    return new Intl.DateTimeFormat('vi-VN', {
        timeZone: VI_TIME_ZONE,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

function getBillingCycleLabel(value) {
    return BILLING_CYCLE_LABELS[value] || value || '--';
}

function getBillingCycleUnit(value) {
    if (value === 'MONTH') return '/tháng';
    if (value === 'YEAR') return '/năm';

    return '';
}

function buildPlanBenefits(plan = {}) {
    return [
        `Tạo tối đa ${plan.cv_limit || 0} CV`,
        `${plan.ai_limit || 0} lượt phân tích AI mỗi tháng`,
        plan.view_full_ai_analysis
            ? 'Xem đầy đủ phân tích AI'
            : 'Phân tích AI cơ bản',
        plan.remove_watermark
            ? 'Xuất PDF không watermark'
            : 'Xuất PDF có watermark',
        plan.premium_template
            ? 'Truy cập mẫu thiết kế Premium'
            : 'Sử dụng mẫu thiết kế cơ bản',
        plan.can_purchase_ai_addon
            ? 'Được mua thêm lượt phân tích AI'
            : 'Không hỗ trợ mua thêm lượt phân tích AI',
        plan.priority_support ? 'Hỗ trợ ưu tiên' : 'Hỗ trợ tiêu chuẩn',
    ];
}

function PackageCard({ plan = {} }) {
    const benefits = buildPlanBenefits(plan);
    const isActive = Boolean(plan.is_active);

    const hasSubscriptionStartedAt = Boolean(plan.subscription_started_at);
    const hasSubscriptionExpiresAt = Boolean(plan.subscription_expires_at);

    return (
        <article className={cx('card')}>
            <div className={cx('header')}>
                <div className={cx('titleWrap')}>
                    <h2 className={cx('title')}>Gói {plan.name || '--'}</h2>

                    <span
                        className={cx('status', {
                            active: isActive,
                            inactive: !isActive,
                        })}
                    >
                        {isActive ? 'Đang áp dụng' : 'Tạm ngưng'}
                    </span>
                </div>

                <p className={cx('description')}>{plan.description || '--'}</p>

                <p
                    className={cx('subMessage', {
                        warningText: !isActive,
                    })}
                >
                    {isActive
                        ? 'Gói hiện đang được áp dụng cho tài khoản của bạn.'
                        : 'Gói hiện không còn hoạt động.'}
                </p>
            </div>

            <div className={cx('priceBox')}>
                <span className={cx('price')}>
                    {formatPrice(plan.price, plan.currency)}
                </span>

                <span className={cx('unit')}>
                    {getBillingCycleUnit(plan.billing_cycle)}
                </span>
            </div>

            <div className={cx('meta')}>
                <div className={cx('metaItem')}>
                    <span className={cx('metaLabel')}>Chu kỳ gói</span>
                    <span className={cx('metaValue')}>
                        {getBillingCycleLabel(plan.billing_cycle)}
                    </span>
                </div>

                {hasSubscriptionStartedAt && (
                    <div className={cx('metaItem')}>
                        <span className={cx('metaLabel')}>Ngày bắt đầu</span>
                        <span className={cx('metaValue')}>
                            {formatDate(plan.subscription_started_at)}
                        </span>
                    </div>
                )}

                {hasSubscriptionExpiresAt && (
                    <div className={cx('metaItem')}>
                        <span className={cx('metaLabel')}>Ngày hết hạn</span>
                        <span className={cx('metaValue')}>
                            {formatDate(plan.subscription_expires_at)}
                        </span>
                    </div>
                )}
            </div>

            <div className={cx('section')}>
                <h3 className={cx('sectionTitle')}>Quyền lợi của bạn</h3>

                <ul className={cx('benefitList')}>
                    {benefits.map((item, index) => (
                        <li
                            key={`${plan.id || 'plan'}-${index}`}
                            className={cx('benefitItem')}
                        >
                            <span className={cx('benefitIcon')}>
                                <IoCheckmarkCircleOutline />
                            </span>

                            <span className={cx('benefitText')}>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </article>
    );
}

export default PackageCard;
