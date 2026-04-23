import React from 'react';
import classNames from 'classnames/bind';
import { FiCheckCircle } from 'react-icons/fi';
import styles from '~/pages/User/Payment/Payment.module.scss';

const cx = classNames.bind(styles);

function PackageCard({ pkg, formatCurrency }) {
    const hasAddOn = Boolean(pkg?.addOn);
    const basePrice = Number(pkg?.basePrice || 0);

    return (
        <div className={cx('package-card')}>
            {pkg.isPopular && (
                <div className={cx('ribbon-corner')}>
                    <span className={cx('ribbon-text')}>Phổ biến</span>
                </div>
            )}

            <div className={cx('package-top')}>
                <h2 className={cx('pkg-name')}>{pkg.name}</h2>
                <p className={cx('pkg-desc')}>{pkg.description}</p>
            </div>

            <div className={cx('pkg-price-wrap')}>
                <span className={cx('pkg-price')}>{formatCurrency(pkg.price)}</span>
                <span className={cx('pkg-interval')}>{pkg.interval || ''}</span>
            </div>

            {hasAddOn ? (
                <div className={cx('order-summary')}>
                    <div className={cx('summary-row')}>
                        <span>Premium Plan</span>
                        <strong>{formatCurrency(basePrice)}</strong>
                    </div>
                    <div className={cx('summary-row')}>
                        <span>{pkg?.addOn?.label || `Add-on ${pkg?.addOn?.credits || 0} lượt AI`}</span>
                        <strong>{formatCurrency(pkg?.addOn?.price || 0)}</strong>
                    </div>
                    <div className={cx('summary-divider')}></div>
                    <div className={cx('summary-row', 'summary-total')}>
                        <span>Tổng thanh toán</span>
                        <strong>{formatCurrency(pkg.price)}</strong>
                    </div>
                </div>
            ) : null}

            <ul className={cx('feature-list')}>
                {pkg.features.map((feature) => (
                    <li key={feature} className={cx('feature-item')}>
                        <FiCheckCircle className={cx('icon-check')} />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PackageCard;
