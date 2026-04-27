import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import classNames from 'classnames/bind';

import styles from './PackageCard.module.scss';
import {
    buildPlanBenefits,
    buildQuotaItems,
    formatDate,
    formatPrice,
    getPlanStatusLabel,
    getPlanStatusVariant,
    getQuotaPercent,
    mapBillingCycleToUnit,
} from '~/utils/billing.utils';

const cx = classNames.bind(styles);

function PackageCard({
    plan = {},
    subscription = {},
    usage = {},
}) {
    const benefits = buildPlanBenefits(plan);
    const quotaItems = buildQuotaItems(plan, usage);

    const statusLabel = getPlanStatusLabel(subscription);
    const statusVariant = getPlanStatusVariant(subscription);

    const isActive = subscription.status === 'ACTIVE';

    const currentPeriodStart = subscription.current_period_start;
    const currentPeriodEnd = subscription.current_period_end;

    return (
        <article className={cx('card')}>
            <div className={cx('header')}>
                <div className={cx('titleWrap')}>
                    <h2 className={cx('title')}>Gói {plan.name || '—'}</h2>

                    <span
                        className={cx('status', {
                            active: statusVariant === 'active',
                            ending: statusVariant === 'ending',
                            inactive: statusVariant === 'inactive',
                            warning: statusVariant === 'warning',
                        })}
                    >
                        {statusLabel}
                    </span>
                </div>

                <p className={cx('description')}>{plan.description}</p>

                {isActive && (
                    <p className={cx('subMessage')}>
                        Gói có hiệu lực đến ngày {formatDate(currentPeriodEnd)}.
                    </p>
                )}

                {!isActive && (
                    <p className={cx('subMessage', 'warningText')}>
                        Gói hiện không còn hoạt động.
                    </p>
                )}
            </div>

            <div className={cx('priceBox')}>
                <span className={cx('price')}>
                    {formatPrice(plan.price, plan.currency)}
                </span>
                <span className={cx('unit')}>
                    {mapBillingCycleToUnit(plan.billing_cycle)}
                </span>
            </div>

            <div className={cx('meta')}>
                <div className={cx('metaItem')}>
                    <span className={cx('metaLabel')}>Ngày bắt đầu</span>
                    <span className={cx('metaValue')}>
                        {formatDate(currentPeriodStart)}
                    </span>
                </div>

                <div className={cx('metaItem')}>
                    <span className={cx('metaLabel')}>Ngày hết hạn</span>
                    <span className={cx('metaValue')}>
                        {formatDate(currentPeriodEnd)}
                    </span>
                </div>

                <div className={cx('metaItem')}>
                    <span className={cx('metaLabel')}>Chu kỳ gói</span>
                    <span className={cx('metaValue')}>
                        {plan.billing_cycle === 'MONTH'
                            ? '1 tháng'
                            : plan.billing_cycle || '—'}
                    </span>
                </div>
            </div>

            <div className={cx('section')}>
                <h3 className={cx('sectionTitle')}>Quyền lợi của bạn</h3>

                <ul className={cx('benefitList')}>
                    {benefits.map((item, index) => (
                        <li
                            key={`${plan.id}-${index}`}
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

            <div className={cx('section')}>
                <div className={cx('quotaList')}>
                    {quotaItems.map((item) => (
                        <div key={item.key} className={cx('quotaItem')}>
                            <div className={cx('quotaRow')}>
                                <span className={cx('quotaLabel')}>
                                    {item.label}
                                </span>
                                <span className={cx('quotaValue')}>
                                    {item.used}/{item.limit}
                                </span>
                            </div>

                            <div className={cx('progress')}>
                                <div
                                    className={cx('progressBar')}
                                    style={{
                                        width: `${getQuotaPercent(
                                            item.used,
                                            item.limit,
                                        )}%`,
                                    }}
                                />
                            </div>

                            <p className={cx('quotaRemaining')}>
                                Còn lại: {item.remaining}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </article>
    );
}

export default PackageCard;