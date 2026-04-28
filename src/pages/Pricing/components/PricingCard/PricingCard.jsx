import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import classNames from 'classnames/bind';

import Button from '~/components/Button';
import {
    buildPlanFeatures,
    formatPrice,
    mapBillingCycleToUnit,
} from '~/utils/pricing.utils';
import styles from './PricingCard.module.scss';

const cx = classNames.bind(styles);

const PLAN_SLUGS = {
    FREE: 'free',
    PREMIUM: 'premium',
};

function PricingCard({ plan = {} }) {
    const isPremium = plan.slug === PLAN_SLUGS.PREMIUM;

    const displayName =
        plan.slug === PLAN_SLUGS.FREE
            ? 'Gói Miễn phí'
            : plan.name || 'Gói dịch vụ';

    const features = buildPlanFeatures(plan);

    return (
        <article className={cx('card', { popular: isPremium })}>
            {isPremium && <span className={cx('badge')}>PHỔ BIẾN NHẤT</span>}

            <div className={cx('head')}>
                <h2 className={cx('cardTitle')}>{displayName}</h2>

                {plan.description && (
                    <p className={cx('cardDesc')}>{plan.description}</p>
                )}

                <div className={cx('priceBox')}>
                    <span className={cx('price')}>
                        {formatPrice(plan.price, plan.currency)}
                    </span>
                    <span className={cx('unit')}>
                        {mapBillingCycleToUnit(plan.billing_cycle)}
                    </span>
                </div>
            </div>

            <div className={cx('body')}>
                {isPremium && (
                    <p className={cx('featureTitle')}>
                        Mọi tính năng trong gói Miễn phí và:
                    </p>
                )}

                <ul className={cx('list')}>
                    {features.map((item, index) => (
                        <li key={`${plan.slug}-${index}`} className={cx('item')}>
                            <span className={cx('itemIcon')}>
                                <IoCheckmarkCircleOutline />
                            </span>
                            <span className={cx('itemText')}>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className={cx('actions')}>
                <Button
                    to={plan.to}
                    primary={isPremium}
                    className={cx('btn', { btnPrimary: isPremium })}
                >
                    {isPremium ? 'Nâng cấp Premium' : 'Bắt đầu ngay'}
                </Button>
            </div>
        </article>
    );
}

export default PricingCard;