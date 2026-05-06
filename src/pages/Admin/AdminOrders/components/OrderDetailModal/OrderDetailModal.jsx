import classNames from 'classnames/bind';
import {
    FiUser,
    FiShoppingBag,
    FiCreditCard,
} from 'react-icons/fi';
import styles from './OrderDetailModal.module.scss';

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

const ORDER_TYPE_META = {
    SUBSCRIPTION: 'Gói đăng ký',
    ADDON: 'Gói add-on',
    BOTH: 'Gói đăng ký + add-on',
};

function formatCurrency(value, currency = 'VND') {
    const formattedValue = new Intl.NumberFormat('vi-VN').format(Number(value || 0));

    if (currency === 'VND') {
        return `${formattedValue}đ`;
    }

    return `${formattedValue} ${currency}`;
}

function formatDateTime(value) {
    if (!value) return '--';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '--';

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function DetailRow({ label, value, strongValue = false, children }) {
    return (
        <div className={cx('detailRow')}>
            <span className={cx('label')}>{label}</span>

            <div className={cx('value', { strongValue })}>
                {children || value || '--'}
            </div>
        </div>
    );
}

function OrderDetailModal({ order }) {
    if (!order) return null;

    const statusMeta = STATUS_META[order.status] || {
        label: order.status || '--',
        className: 'default',
    };

    const orderTypeLabel = ORDER_TYPE_META[order.order_type] || order.order_type || '--';

    return (
        <div className={cx('wrapper')}>
            <section className={cx('section')}>
                <div className={cx('sectionTitle')}>
                    <FiUser />
                    <span>Thông tin khách hàng</span>
                </div>

                <div className={cx('sectionBody')}>
                    <DetailRow
                        label="Họ và tên"
                        value={order.user?.full_name}
                        strongValue
                    />

                    <DetailRow
                        label="Email"
                        value={order.user?.email}
                    />
                </div>
            </section>

            <section className={cx('section')}>
                <div className={cx('sectionTitle')}>
                    <FiShoppingBag />
                    <span>Thông tin đơn hàng</span>
                </div>

                <div className={cx('sectionBody')}>
                    <DetailRow
                        label="Mã đơn hàng"
                        value={order.order_code}
                        strongValue
                    />

                    <DetailRow
                        label="Loại đơn"
                        value={orderTypeLabel}
                    />

                    <DetailRow
                        label="Gói dịch vụ"
                        value={order.plan?.name}
                    />

                    <DetailRow
                        label="Gói add-on"
                        value={order.addon_package?.name}
                    />

                    <DetailRow
                        label="Số tiền"
                        value={formatCurrency(order.amount_cents, order.currency)}
                        strongValue
                    />

                    <DetailRow label="Trạng thái">
                        <span className={cx('statusBadge', statusMeta.className)}>
                            {statusMeta.label}
                        </span>
                    </DetailRow>

                    <DetailRow
                        label="Ngày tạo"
                        value={formatDateTime(order.createdAt)}
                    />
                </div>
            </section>

            <section className={cx('section')}>
                <div className={cx('sectionTitle')}>
                    <FiCreditCard />
                    <span>Thông tin thanh toán</span>
                </div>

                <div className={cx('sectionBody')}>
                    <DetailRow
                        label="Phương thức thanh toán"
                        value={order.payment_method}
                    />

                    <DetailRow
                        label="Thời gian thanh toán"
                        value={formatDateTime(order.paid_at)}
                    />
                </div>
            </section>
        </div>
    );
}

export default OrderDetailModal;