import classNames from 'classnames/bind';
import {
    FiUser,
    FiShoppingBag,
    FiCreditCard,
} from 'react-icons/fi';
import styles from './OrderEditModal.module.scss';

const cx = classNames.bind(styles);

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

function OrderEditModal({ order, plans, statusOptions, editForm, onChange }) {
    if (!order) return null;

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
                        value={order.user?.name}
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

                        <FieldGroup label="Mã đơn hàng">
                            <input
                                value={order.order_code || ''}
                                readOnly
                            />
                        </FieldGroup>
                    </div>

                    <FieldGroup label="Gói dịch vụ">
                        <select
                            name="plan_slug"
                            value={editForm.plan_slug}
                            onChange={onChange}
                        >
                            {plans.map((plan) => (
                                <option key={plan.id} value={plan.slug}>
                                    {plan.name}
                                </option>
                            ))}
                        </select>
                    </FieldGroup>

                    <FieldGroup label="Số tiền">
                        <input
                            name="amount_cents"
                            value={editForm.amount_cents}
                            onChange={onChange}
                            inputMode="numeric"
                            placeholder="Nhập số tiền"
                        />
                    </FieldGroup>
                </div>
            </section>

            <section className={cx('section')}>
                <div className={cx('sectionTitle')}>
                    <FiCreditCard />
                    <span>Thông tin thanh toán</span>
                </div>

                <div className={cx('sectionBody')}>
                    <div className={cx('fieldGrid')}>
                        <FieldGroup label="Phương thức thanh toán">
                            <input
                                name="payment_method"
                                value={editForm.payment_method}
                                onChange={onChange}
                                placeholder="Nhập phương thức thanh toán"
                            />
                        </FieldGroup>

                        <FieldGroup label="Thời gian tạo">
                            <input
                                value={
                                    order.created_at
                                        ? new Intl.DateTimeFormat('vi-VN', {
                                              day: '2-digit',
                                              month: '2-digit',
                                              year: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit',
                                          }).format(new Date(order.created_at))
                                        : ''
                                }
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