import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { HiCheckBadge } from 'react-icons/hi2';
import classNames from 'classnames/bind';

import Button from '~/components/Button';
import {
    buildPlanFeatures,
    formatPrice,
    mapBillingCycleToUnit,
} from '~/utils/pricing.utils';
import { config } from '~/config';
import styles from './PricingCard.module.scss';

const cx = classNames.bind(styles);

function getRoute(isPremium, isAuthenticated, slug) {
    if (!isAuthenticated) return config.router.login;

    if (isPremium && slug) {
        return config.router.upgradeOptions.replace(':slug', slug);
    }

    return undefined;
}

const PLAN_SLUGS = {
    FREE: 'free',
    PREMIUM: 'premium',
};

function normalizeSlug(value = '') {
    return value.trim().toLowerCase();
}

function getCtaLabel({
    isFree,
    isPremium,
    isCurrentPlan,
    isCurrentPremium,
    isAuthenticated,
}) {
    if (isCurrentPlan) return 'Gói hiện tại';
    if (isCurrentPremium && isFree) return 'Free';
    if (isAuthenticated && isFree) return 'Gói hiện tại';
    if (isPremium) return 'Nâng cấp Premium';

    return 'Bắt đầu ngay';
}

function PricingCard({
    plan = {},
    isAuthenticated = false,
    isCurrentPlan = false,
    isCurrentPremium = false,
}) {
    const planSlug = normalizeSlug(plan.slug);

    const isFree = planSlug === PLAN_SLUGS.FREE;
    const isPremium = planSlug === PLAN_SLUGS.PREMIUM;

    const features = buildPlanFeatures(plan);

    const route = getRoute(isPremium, isAuthenticated, planSlug);

    const isDisabled =
        isCurrentPlan ||
        (isCurrentPremium && isFree) ||
        (isAuthenticated && isFree);

    const ctaLabel = getCtaLabel({
        isFree,
        isPremium,
        isCurrentPlan,
        isCurrentPremium,
        isAuthenticated,
    });

    return (
        <article className={cx('card', { popular: isPremium })}>
            {isPremium && <span className={cx('badge')}>PHỔ BIẾN NHẤT</span>}

            <div className={cx('head')}>
                <h2 className={cx('cardTitle')}>{plan.name}</h2>

                {isCurrentPlan && (
                    <span className={cx('currentBadge')}>
                        <HiCheckBadge className={cx('currentBadgeIcon')} />
                        <span>Đang sử dụng</span>
                    </span>
                )}

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
                    {features.map((item) => (
                        <li key={`${plan.id}-${item}`} className={cx('item')}>
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
                    to={isDisabled ? undefined : route}
                    primary={isPremium && !isDisabled}
                    disabled={isDisabled}
                    className={cx('btn', {
                        btnPrimary: isPremium && !isDisabled,
                        btnCurrent: isDisabled,
                    })}
                >
                    {ctaLabel}
                </Button>
            </div>
        </article>
    );
}

export default PricingCard;