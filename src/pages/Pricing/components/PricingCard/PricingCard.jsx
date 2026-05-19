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

const PLAN_SLUGS = {
    FREE: 'free',
};

function normalizeSlug(value = '') {
    return String(value).trim().toLowerCase();
}

function getUpgradeRoute({ isFree, isAuthenticated, slug }) {
    if (!isAuthenticated) return config.router.login;

    if (!isFree && slug) {
        return config.router.upgradeOptions.replace(':slug', slug);
    }

    return undefined;
}

function getCtaLabel({
    planName,
    isFree,
    isCurrentPlan,
    isAuthenticated,
}) {
    if (isCurrentPlan) return 'Gói hiện tại';

    if (!isAuthenticated) {
        return isFree ? 'Bắt đầu miễn phí' : `Chọn gói ${planName}`;
    }

    if (isFree) return 'Gói miễn phí';

    return `Chọn gói ${planName}`;
}

function PricingCard({
    plan = {},
    isPopular = false,
    isAuthenticated = false,
    isCurrentPlan = false,
}) {
    const planSlug = normalizeSlug(plan.slug);
    const planName = plan.name || 'dịch vụ';

    const isFree = planSlug === PLAN_SLUGS.FREE;

    const features = buildPlanFeatures(plan);

    const route = getUpgradeRoute({
        isFree,
        isAuthenticated,
        slug: planSlug,
    });

    const isDisabled = isCurrentPlan || (isAuthenticated && isFree);

    const ctaLabel = getCtaLabel({
        planName,
        isFree,
        isCurrentPlan,
        isAuthenticated,
    });

    const isPrimaryButton = isPopular && !isDisabled;

    return (
        <article
            className={cx('card', {
                popular: isPopular,
                current: isCurrentPlan,
            })}
        >
            {isPopular ? (
                <span className={cx('badge')}>PHỔ BIẾN NHẤT</span>
            ) : null}

            <div className={cx('head')}>
                <div className={cx('titleRow')}>
                    <h2 className={cx('cardTitle')}>{plan.name || '--'}</h2>

                    {isCurrentPlan ? (
                        <span className={cx('currentBadge')}>
                            <HiCheckBadge className={cx('currentBadgeIcon')} />
                            <span>Đang sử dụng</span>
                        </span>
                    ) : null}
                </div>

                {plan.description ? (
                    <p className={cx('cardDesc')}>{plan.description}</p>
                ) : null}

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
                    primary={isPrimaryButton}
                    disabled={isDisabled}
                    className={cx('btn', {
                        btnPrimary: isPrimaryButton,
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