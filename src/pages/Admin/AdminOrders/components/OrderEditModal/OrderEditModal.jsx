import classNames from 'classnames/bind';
import {
    FiUser,
    FiShoppingBag,
    FiCreditCard,
} from 'react-icons/fi';
import styles from './OrderEditModal.module.scss';

const cx = classNames.bind(styles);

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

function formatCurrency(value, currency = 'VND') {
    const formattedValue = new Intl.NumberFormat('vi-VN').format(Number(value || 0));

    if (currency === 'VND') {
        return `${formattedValue}đ`;
    }

    return `${formattedValue} ${currency}`;
}

function ReadonlyRow({ label, value, strongValue = false }) {
    return (
        <div className={cx('detailRow')}>
            <span className={cx('label')}>{label}</span>
            <div className={cx('value', { strongValue })}>{value || '--'}</div>
        </div>
    );
}

function FieldGroup({ label, children }) {
    return (
        <label className={cx('fieldGroup')}>
            <span className={cx('fieldLabel')}>{label}</span>
            {children}
        </label>
    );
}

function OrderEditModal({ order, statusOptions, editForm, onChange }) {
    if (!order) return null;

    const isPaidStatus = editForm.status === 'PAID';

    return (
        <div className={cx('wrapper')}>
            <section className={cx('section')}>
                <div className={cx('sectionTitle')}>
                    <FiUser />
                    <span>Thông tin khách hàng</span>
                </div>

                <div className={cx('sectionBody')}>
                    <ReadonlyRow
                        label="Họ và tên"
                        value={order.user?.full_name}
                        strongValue
                    />

                    <ReadonlyRow
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
                    <div className={cx('fieldGrid')}>
                        <FieldGroup label="Mã đơn hàng">
                            <input
                                value={order.order_code || ''}
                                readOnly
                            />
                        </FieldGroup>

                        <FieldGroup label="ID thanh toán">
                            <input
                                value={order.id || ''}
                                readOnly
                            />
                        </FieldGroup>
                    </div>

                    <div className={cx('fieldGrid')}>
                        <FieldGroup label="Loại đơn">
                            <input
                                value={order.order_type || ''}
                                readOnly
                            />
                        </FieldGroup>

                        <FieldGroup label="Gói dịch vụ">
                            <input
                                value={order.plan?.name || ''}
                                readOnly
                            />
                        </FieldGroup>
                    </div>

                    <div className={cx('fieldGrid')}>
                        <FieldGroup label="Gói add-on">
                            <input
                                value={order.addon_package?.name || ''}
                                readOnly
                            />
                        </FieldGroup>

                        <FieldGroup label="Số tiền">
                            <input
                                value={formatCurrency(order.amount_cents, order.currency)}
                                readOnly
                            />
                        </FieldGroup>
                    </div>
                </div>
            </section>

            <section className={cx('section')}>
                <div className={cx('sectionTitle')}>
                    <FiCreditCard />
                    <span>Cập nhật thanh toán</span>
                </div>

                <div className={cx('sectionBody')}>
                    <FieldGroup label="Trạng thái">
                        <select
                            name="status"
                            value={editForm.status}
                            onChange={onChange}
                        >
                            {statusOptions.map((status) => (
                                <option key={status.value} value={status.value}>
                                    {status.label}
                                </option>
                            ))}
                        </select>
                    </FieldGroup>

                    {isPaidStatus && (
                        <FieldGroup label="Mã giao dịch từ cổng thanh toán">
                            <input
                                name="provider_transaction_id"
                                value={editForm.provider_transaction_id}
                                onChange={onChange}
                                placeholder="Nhập mã giao dịch từ cổng thanh toán"
                            />
                        </FieldGroup>
                    )}

                    <FieldGroup label="Lý do cập nhật">
                        <textarea
                            name="reason"
                            value={editForm.reason}
                            onChange={onChange}
                            placeholder="Nhập lý do cập nhật trạng thái"
                            rows="3"
                        />
                    </FieldGroup>

                    <div className={cx('fieldGrid')}>
                        <FieldGroup label="Thời gian tạo">
                            <input
                                value={formatDateTime(order.createdAt)}
                                readOnly
                            />
                        </FieldGroup>

                        <FieldGroup label="Thời gian thanh toán">
                            <input
                                value={formatDateTime(order.paid_at)}
                                readOnly
                            />
                        </FieldGroup>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default OrderEditModal;