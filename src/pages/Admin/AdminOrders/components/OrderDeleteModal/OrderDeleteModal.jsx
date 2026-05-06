import classNames from 'classnames/bind';
import { FiAlertTriangle } from 'react-icons/fi';
import styles from './OrderDeleteModal.module.scss';

const cx = classNames.bind(styles);

function OrderDeleteModal({ order }) {
    if (!order) return null;

    return (
        <div className={cx('wrapper')}>
            <div className={cx('iconBox')}>
                <FiAlertTriangle />
            </div>

            <div className={cx('content')}>
                <h4>Xác nhận xóa đơn hàng</h4>

                <p>
                    Bạn đang chuẩn bị xóa đơn hàng{' '}
                    <strong>#{order.order_code || '--'}</strong>. Hành động này không thể hoàn tác.
                </p>

                <div className={cx('orderInfo')}>
                    <div>
                        <span>Người dùng</span>
                        <strong>{order.user?.full_name || '--'}</strong>
                    </div>

                    <div>
                        <span>Email</span>
                        <strong>{order.user?.email || '--'}</strong>
                    </div>

                    <div>
                        <span>Gói dịch vụ</span>
                        <strong>{order.plan?.name || '--'}</strong>
                    </div>

                    <div>
                        <span>Gói add-on</span>
                        <strong>{order.addon_package?.name || '--'}</strong>
                    </div>

                    <div>
                        <span>Loại đơn</span>
                        <strong>{order.order_type || '--'}</strong>
                    </div>

                    <div>
                        <span>Trạng thái</span>
                        <strong>{order.status || '--'}</strong>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderDeleteModal;