import classNames from 'classnames/bind';
import { FiEye, FiEdit2 } from 'react-icons/fi';
// import { FiTrash2 } from 'react-icons/fi';
import styles from './OrderRow.module.scss';

const cx = classNames.bind(styles);

const STATUS_META = {
    PAID: {
        label: 'Paid',
        className: 'paid',
    },
    PENDING: {
        label: 'Pending',
        className: 'pending',
    },
    FAILED: {
        label: 'Failed',
        className: 'failed',
    },
    CANCELLED: {
        label: 'Cancelled',
        className: 'cancelled',
    },
};

function formatCurrency(value, currency = 'VND') {
    const formattedValue = new Intl.NumberFormat('vi-VN').format(Number(value || 0));

    if (currency === 'VND') {
        return `${formattedValue}đ`;
    }

    return `${formattedValue} ${currency}`;
}

function formatDate(value) {
    if (!value) return '--';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '--';

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

function getAvatarFallback(name) {
    if (!name) return '?';

    return name
        .trim()
        .split(' ')
        .slice(-1)
        .join('')
        .charAt(0)
        .toUpperCase();
}

function splitPlanName(name) {
    if (!name) return ['--'];

    return name.split(' ');
}

function OrderRow({
    order,
    onView,
    onEdit,
    // onDelete
}) {
    const statusMeta = STATUS_META[order.status] || {
        label: order.status || '--',
        className: 'default',
    };

    const userName = order.user?.full_name || '--';
    const userEmail = order.user?.email || '--';
    const planParts = splitPlanName(order.plan?.name);

    return (
        <tr className={cx('row')}>
            <td>
                <span className={cx('orderCode')}>
                    #{order.order_code || '--'}
                </span>
            </td>

            <td>
                <div className={cx('userInfo')}>
                    {order.user?.avatar ? (
                        <img
                            src={order.user.avatar}
                            alt={userName}
                            className={cx('avatar')}
                        />
                    ) : (
                        <div className={cx('avatar', 'avatarFallback')}>
                            {getAvatarFallback(userName)}
                        </div>
                    )}

                    <div className={cx('userMeta')}>
                        <strong>{userName}</strong>
                        <span>{userEmail}</span>
                    </div>
                </div>
            </td>

            <td>
                <div className={cx('planName')}>
                    {planParts.map((part, index) => (
                        <span key={`${part}-${index}`}>{part}</span>
                    ))}
                </div>
            </td>

            <td>
                <strong className={cx('price')}>
                    {formatCurrency(order.amount_cents, order.currency)}
                </strong>
            </td>

            <td>
                <span className={cx('statusBadge', statusMeta.className)}>
                    {statusMeta.label}
                </span>
            </td>

            <td>
                <span className={cx('createdDate')}>
                    {formatDate(order.createdAt)}
                </span>
            </td>

            <td>
                <div className={cx('actions')}>
                    <button
                        type="button"
                        className={cx('actionButton', 'viewAction')}
                        onClick={() => onView?.(order)}
                        title="Xem chi tiết"
                        aria-label="Xem chi tiết đơn hàng"
                    >
                        <FiEye />
                    </button>

                    <button
                        type="button"
                        className={cx('actionButton', 'editAction')}
                        onClick={() => onEdit?.(order)}
                        title="Chỉnh sửa"
                        aria-label="Chỉnh sửa đơn hàng"
                    >
                        <FiEdit2 />
                    </button>

                    {/* <button
                        type="button"
                        className={cx('actionButton', 'deleteAction')}
                        onClick={() => onDelete?.(order)}
                        title="Xóa"
                        aria-label="Xóa đơn hàng"
                    >
                        <FiTrash2 />
                    </button> */}
                </div>
            </td>
        </tr>
    );
}

export default OrderRow;