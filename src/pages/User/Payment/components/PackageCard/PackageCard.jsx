import React from 'react';
import classNames from 'classnames/bind';
import { FiCheckCircle } from 'react-icons/fi';

import styles from '~/pages/User/Payment/Payment.module.scss';
import { helper } from '~/utils/helper';

const cx = classNames.bind(styles);

const BILLING_CYCLE_LABELS = {
    MONTH: 'Tháng',
    YEAR: 'Năm',
    FOREVER: 'Vĩnh viễn',
};

function toNumber(value) {
    return Number(value) || 0;
}

function formatPrice(value, currency = 'VND') {
    const amount = toNumber(value);

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(amount);
}

function getBillingCycleLabel(value) {
    if (!value) return '';

    return BILLING_CYCLE_LABELS[value] || '';
}

function PackageCard({ pkg = {} }) {
    const plan = pkg?.plan || null;
    const addon = pkg?.addon || null;

    const hasPlan = Boolean(plan?.id || plan?.name);
    const hasAddon = Boolean(addon?.id || addon?.name);

    const displayName =
        pkg?.displayName ||
        [plan?.name, addon?.name].filter(Boolean).join(' + ') ||
        'Thông tin đơn hàng';

    const displayDescription =
        pkg?.displayDescription ||
        [plan?.description, addon?.description].filter(Boolean).join(' ') ||
        '';

    const currency =
        pkg?.displayCurrency ||
        plan?.currency ||
        addon?.currency ||
        'VND';

    const totalAmount =
        toNumber(pkg?.amount_cents) ||
        toNumber(pkg?.displayPrice) ||
        toNumber(plan?.price) + toNumber(addon?.price);

    const billingCycle =
        pkg?.displayBillingCycle || plan?.billing_cycle || '';

    const billingCycleLabel = getBillingCycleLabel(billingCycle);

    const planFeatures = hasPlan ? helper.buildPlanFeatures(plan) : [];

    const addonFeature =
        hasAddon && addon?.name
            ? `Mua thêm gói ${addon.name}`
            : hasAddon && addon?.runs
              ? `Mua thêm ${addon.runs} lượt phân tích AI`
              : '';

    return (
        <div className={cx('package-card')}>
            {pkg?.is_popular || plan?.is_popular || addon?.is_popular ? (
                <div className={cx('ribbon-corner')}>
                    <span className={cx('ribbon-text')}>Phổ biến</span>
                </div>
            ) : null}

            <div className={cx('package-top')}>
                <h2 className={cx('pkg-name')}>{displayName}</h2>

                {displayDescription ? (
                    <p className={cx('pkg-desc')}>{displayDescription}</p>
                ) : null}
            </div>

            {totalAmount > 0 ? (
                <div className={cx('pkg-price-wrap')}>
                    <span className={cx('pkg-price')}>
                        {formatPrice(totalAmount, currency)}
                    </span>

                    {billingCycleLabel ? (
                        <span className={cx('pkg-interval')}>
                            / {billingCycleLabel}
                        </span>
                    ) : null}
                </div>
            ) : null}

            <div className={cx('order-summary')}>
                {hasPlan ? (
                    <div className={cx('summary-row')}>
                        <span>{plan.name}</span>
                        <strong>{formatPrice(plan.price, plan.currency)}</strong>
                    </div>
                ) : null}

                {hasAddon ? (
                    <div className={cx('summary-row')}>
                        <span>
                            {addon.name ||
                                `Add-on ${addon.runs || 0} lượt AI`}
                        </span>
                        <strong>
                            {formatPrice(addon.price, addon.currency || currency)}
                        </strong>
                    </div>
                ) : null}

                <div className={cx('summary-divider')}></div>

                <div className={cx('summary-row', 'summary-total')}>
                    <span>Tổng thanh toán</span>
                    <strong>{formatPrice(totalAmount, currency)}</strong>
                </div>
            </div>

            {(planFeatures.length > 0 || addonFeature) && (
                <ul className={cx('feature-list')}>
                    {planFeatures.map((feature) => (
                        <li key={feature} className={cx('feature-item')}>
                            <FiCheckCircle className={cx('icon-check')} />
                            <span>{feature}</span>
                        </li>
                    ))}

                    {addonFeature ? (
                        <li className={cx('feature-item')}>
                            <FiCheckCircle className={cx('icon-check')} />
                            <span>{addonFeature}</span>
                        </li>
                    ) : null}
                </ul>
            )}
        </div>
    );
}

export default PackageCard;