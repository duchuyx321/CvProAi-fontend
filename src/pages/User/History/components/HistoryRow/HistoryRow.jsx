import classNames from 'classnames/bind';

import styles from './HistoryRow.module.scss';

const cx = classNames.bind(styles);

const VI_TIME_ZONE = 'Asia/Ho_Chi_Minh';

const STATUS_LABELS = {
    PAID: 'Đã thanh toán',
    PENDING: 'Đang chờ',
    FAILED: 'Thất bại',
    CANCELLED: 'Đã hủy',
    RECONCILE_FAILED: 'Đối soát lỗi',
};

function formatCurrency(value, currency = 'VND') {
    const amount = Number(value) || 0;

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(amount);
}

function isValidDate(date) {
    return date instanceof Date && !Number.isNaN(date.getTime());
}

function formatDateTime(value, timeZone = VI_TIME_ZONE) {
    if (!value) return '--';

    const date = new Date(value);

    if (!isValidDate(date)) return '--';

    return new Intl.DateTimeFormat('vi-VN', {
        timeZone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function formatTime(value, timeZone = VI_TIME_ZONE) {
    if (!value) return '--';

    const date = new Date(value);

    if (!isValidDate(date)) return '--';

    return new Intl.DateTimeFormat('vi-VN', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function formatOnlyDate(value, timeZone = VI_TIME_ZONE) {
    if (!value) return '--';

    const date = new Date(value);

    if (!isValidDate(date)) return '--';

    return new Intl.DateTimeFormat('vi-VN', {
        timeZone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

function formatPaidAt(value) {
    return formatDateTime(value, 'UTC');
}

function getStatusLabel(status) {
    return STATUS_LABELS[status] || status || '--';
}

function getPackageName(payment = {}) {
    const planName = payment?.plan?.name;
    const addonName = payment?.addon_package?.name;

    if (planName && addonName) {
        return `${planName} + ${addonName}`;
    }

    return planName || addonName || '--';
}

function HistoryRow({ payment }) {
    const status = payment?.status;
    const fullName = payment?.user?.full_name || '--';
    const email = payment?.user?.email || '--';
    const packageName = getPackageName(payment);

    return (
        <tr>
            <td className={cx('codeCell')}>
                <span title={payment?.order_code || ''}>
                    {payment?.order_code || '--'}
                </span>
            </td>

            <td>
                <div className={cx('userInfo')}>
                    <span className={cx('userName')} title={fullName}>
                        {fullName}
                    </span>

                    <small title={email}>{email}</small>
                </div>
            </td>

            <td>
                <div className={cx('packageInfo')}>
                    <span className={cx('packageName')} title={packageName}>
                        {packageName}
                    </span>

                    {payment?.paid_at ? (
                        <small>
                            Thanh toán lúc {formatPaidAt(payment.paid_at)}
                        </small>
                    ) : (
                        <small>Chưa thanh toán</small>
                    )}
                </div>
            </td>

            <td className={cx('amountCell')}>
                {formatCurrency(payment?.amount_cents)}
            </td>

            <td>
                <span
                    className={cx('statusBadge', {
                        paid: status === 'PAID',
                        pending: status === 'PENDING',
                        failed:
                            status === 'FAILED' ||
                            status === 'RECONCILE_FAILED',
                        cancelled: status === 'CANCELLED',
                    })}
                >
                    {getStatusLabel(status)}
                </span>
            </td>

            <td>
                <div className={cx('dateInfo')}>
                    <span>{formatTime(payment?.createdAt)}</span>
                    <small>{formatOnlyDate(payment?.createdAt)}</small>
                </div>
            </td>
        </tr>
    );
}

export default HistoryRow;