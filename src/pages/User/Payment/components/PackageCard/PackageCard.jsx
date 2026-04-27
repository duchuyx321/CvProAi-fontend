import React from 'react';
import classNames from 'classnames/bind';
import { FiCheckCircle } from 'react-icons/fi';
import styles from '~/pages/User/Payment/Payment.module.scss';
import { helper } from '~/utils/helper';

const cx = classNames.bind(styles);
const menuBicycal = {
    MONTH: 'Tháng',
    YEAR: 'Năm',
    FOREVER: 'Vĩnh viễn',
};
function PackageCard({ pkg }) {
    return (
        <div className={cx('package-card')}>
            <div className={cx('ribbon-corner')}>
                <span className={cx('ribbon-text')}>Phổ biến</span>
            </div>

            <div className={cx('package-top')}>
                <h2 className={cx('pkg-name')}>
                    {pkg?.plan?.name + ' ' + pkg?.addon?.name}
                </h2>
                <p className={cx('pkg-desc')}>
                    {pkg?.plan?.description + ' ' + pkg?.addon?.description}
                </p>
            </div>

            <div className={cx('pkg-price-wrap')}>
                <span
                    className={cx('pkg-price')}
                >{`${pkg.amount_cents} ${pkg?.plan?.currency}`}</span>
                <span className={cx('pkg-interval')}>
                    /
                    {' ' + menuBicycal[pkg?.plan?.billing_cycle] ||
                        menuBicycal.MONTH}
                </span>
            </div>

            <div className={cx('order-summary')}>
                <div className={cx('summary-row')}>
                    <span>{pkg?.plan?.name}</span>
                    <strong>{pkg?.plan?.price}</strong>
                </div>
                <div className={cx('summary-row')}>
                    <span>
                        {pkg?.addon?.name ||
                            `Add-on ${pkg?.addon?.runs || 0} lượt AI`}
                    </span>
                    <strong>{pkg?.addon?.price || 0}</strong>
                </div>
                <div className={cx('summary-divider')}></div>
                <div className={cx('summary-row', 'summary-total')}>
                    <span>Tổng thanh toán</span>
                    <strong>{pkg.amount_cents}</strong>
                </div>
            </div>

            <ul className={cx('feature-list')}>
                {helper.buildPlanFeatures(pkg?.plan ?? {}).map((feature) => (
                    <li key={feature} className={cx('feature-item')}>
                        <FiCheckCircle className={cx('icon-check')} />
                        <span>{feature}</span>
                    </li>
                ))}
                <li className={cx('feature-item')}>
                    <FiCheckCircle className={cx('icon-check')} />
                    <span>{`Mua thêm gói ${pkg?.addon?.name}`}</span>
                </li>
            </ul>
        </div>
    );
}

export default PackageCard;
