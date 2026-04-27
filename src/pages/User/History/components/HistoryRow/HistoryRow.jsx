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

const ORDER_TYPES = {
    SUBSCRIPTION: 'SUBSCRIPTION',
    AI_ADDON: 'AI_ADDON',
};

function getOrderTitle(item = {}) {
    if (item.order_type === ORDER_TYPES.SUBSCRIPTION) {
        return item.plan?.name ? `Gói ${item.plan.name}` : 'Gói dịch vụ';
    }

    if (item.order_type === ORDER_TYPES.AI_ADDON) {
        return item.addon_package?.name ?? 'Gói mua thêm AI';
    }

    return item.description ?? 'Giao dịch';
}

function getOrderSubTitle(item = {}) {
    if (item.order_type === ORDER_TYPES.SUBSCRIPTION) {
        const billingCycleLabel = mapBillingCycleToLabel(
            item.plan?.billing_cycle,
        );

        return billingCycleLabel ? `(${billingCycleLabel})` : '';
    }

    if (item.order_type === ORDER_TYPES.AI_ADDON) {
        const runs = item.addon_package?.runs;

        return runs ? `(${runs} lượt AI)` : '';
    }

    return '';
}

function HistoryRow({ item = {} }) {
    const statusText = mapPaymentStatus(item.status);

    const paymentMethodText = mapPaymentMethod(
        item.metadata?.payment_method,
        item.provider,
    );

    const isSuccess = item.status === 'PAID';

    const isFailed = item.status === 'FAILED';
    const isPending = item.status === 'PENDING';

    const isCanceled =
        item.status === 'CANCELED' ||
        item.status === 'CANCELLED' ||
        item.status === 'REFUNDED';

    const displayDate = item.paid_at ?? item.created_at;

    const orderTitle = getOrderTitle(item);
    const orderSubTitle = getOrderSubTitle(item);

    return (
        <div className={cx('row')}>
            <div className={cx('cell', 'code')}>{item.order_code}</div>

            <div className={cx('cell', 'date')}>
                {formatDate(displayDate)}
            </div>

            <div className={cx('cell', 'plan')}>
                <span className={cx('planName')}>{orderTitle}</span>

                {orderSubTitle && (
                    <span className={cx('planCycle')}>{orderSubTitle}</span>
                )}
            </div>

            <div className={cx('cell', 'amount')}>
                {formatPrice(item.amount_cents, item.currency)}
            </div>

            <div className={cx('cell', 'method')}>{paymentMethodText}</div>

            <div className={cx('cell', 'status')}>
                <span
                    className={cx('statusBadge', {
                        success: isSuccess,
                        failed: isFailed || isCanceled,
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