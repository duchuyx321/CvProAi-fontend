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
    usage = {},
    isSubmitting = false,
    onCancelPackage,
}) {
    const benefits = buildPlanBenefits(plan);
    const quotaItems = buildQuotaItems(plan, usage);

    const statusLabel = getPlanStatusLabel(plan);
    const statusVariant = getPlanStatusVariant(plan);

    const isActive = plan.status === 'ACTIVE';
    const willEndAtPeriodEnd = Boolean(plan.cancel_at_period_end);

    return (
        <article className={cx('card')}>
            <div className={cx('header')}>
                <div className={cx('titleWrap')}>
                    <h2 className={cx('title')}>Gói {plan.name || '—'}</h2>

                    <span
                        className={cx('status', {
                            active: statusVariant === 'active',
                            ending: statusVariant === 'ending',
                        })}
                    >
                        {statusLabel}
                    </span>
                </div>

                <p className={cx('description')}>{plan.description}</p>

                {isActive && !willEndAtPeriodEnd && (
                    <p className={cx('subMessage')}>
                        Gói sẽ tự động gia hạn vào {formatDate(plan.expires_at)}.
                    </p>
                )}

                {isActive && willEndAtPeriodEnd && (
                    <p className={cx('subMessage', 'warningText')}>
                        Bạn đã hủy gia hạn. Gói vẫn hoạt động đến hết ngày{' '}
                        {formatDate(plan.expires_at)}.
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
                        {formatDate(plan.started_at)}
                    </span>
                </div>

                <div className={cx('metaItem')}>
                    <span className={cx('metaLabel')}>Gia hạn tiếp theo</span>
                    <span className={cx('metaValue')}>
                        {formatDate(plan.expires_at)}
                    </span>
                </div>

                <div className={cx('metaItem')}>
                    <span className={cx('metaLabel')}>Tự động gia hạn</span>
                    <span className={cx('metaValue')}>
                        {plan.auto_renew ? 'Có' : 'Không'}
                    </span>
                </div>
            </div>

            <div className={cx('section')}>
                <h3 className={cx('sectionTitle')}>Quyền lợi của bạn</h3>

                <ul className={cx('benefitList')}>
                    {benefits.map((item, index) => (
                        <li
                            key={`${plan.slug}-${index}`}
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
                {/* <h3 className={cx('sectionTitle')}>Quota AI / Export / CV</h3> */}

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

            {isActive && !willEndAtPeriodEnd && plan.can_cancel && (
                <div className={cx('cancelBox')}>
                    <div className={cx('cancelContent')}>
                        <h3 className={cx('cancelTitle')}>Hủy gói</h3>
                        <p className={cx('cancelDesc')}>
                            Nếu bạn hủy, bạn vẫn sẽ được toàn quyền truy cập vào
                            các tính năng của gói cho đến hết chu kỳ thanh toán
                            của bạn.
                        </p>
                    </div>

                    <button
                        type="button"
                        className={cx('cancelBtn')}
                        onClick={onCancelPackage}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Hủy'}
                    </button>
                </div>
            )}
        </article>
    );
}

export default PackageCard;