import classNames from 'classnames/bind';

import styles from './HistoryRow.module.scss';
import {
    formatDate,
    formatPrice,
    mapBillingCycleToLabel,
    mapPaymentMethod,
    mapPaymentStatus,
} from '~/utils/billing.utils';

const cx = classNames.bind(styles);

function HistoryRow({ item = {} }) {
    const statusText = mapPaymentStatus(item.status);
    const paymentMethodText = mapPaymentMethod(
        item.payment_method,
        item.provider,
    );

    const isSuccess = item.status === 'SUCCESS';
    const isFailed = item.status === 'FAILED';
    const isPending = item.status === 'PENDING';

    return (
        <div className={cx('row')}>
            <div className={cx('cell', 'code')}>{item.transaction_code}</div>

            <div className={cx('cell', 'date')}>
                {formatDate(item.paid_at)}
            </div>

            <div className={cx('cell', 'plan')}>
                <span className={cx('planName')}>{item.plan_name}</span>
                <span className={cx('planCycle')}>
                    ({mapBillingCycleToLabel(item.billing_cycle)})
                </span>
            </div>

            <div className={cx('cell', 'amount')}>
                {formatPrice(item.amount, item.currency)}
            </div>

            <div className={cx('cell', 'method')}>{paymentMethodText}</div>

            <div className={cx('cell', 'status')}>
                <span
                    className={cx('statusBadge', {
                        success: isSuccess,
                        failed: isFailed,
                        pending: isPending,
                    })}
                >
                    {statusText}
                </span>
            </div>
        </div>
    );
}

export default HistoryRow;