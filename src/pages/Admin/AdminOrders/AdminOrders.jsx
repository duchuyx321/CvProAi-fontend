import { useEffect, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import classNames from 'classnames/bind';
import Modal from '~/components/Modal';
import Button from '~/components/Button';
import OrderRow from './components/OrderRow';
import OrderDetailModal from './components/OrderDetailModal';
import OrderEditModal from './components/OrderEditModal';
import OrderDeleteModal from './components/OrderDeleteModal';
import styles from './AdminOrders.module.scss';

const cx = classNames.bind(styles);

const ORDER_STATUS_OPTIONS = [
    {
        label: 'Paid',
        value: 'PAID',
    },
    {
        label: 'Pending',
        value: 'PENDING',
    },
    {
        label: 'Failed',
        value: 'FAILED',
    },
    {
        label: 'Cancelled',
        value: 'CANCELLED',
    },
];

const ORDER_STATUS_FILTER_OPTIONS = [
    {
        label: 'Tất cả trạng thái',
        value: 'ALL',
    },
    ...ORDER_STATUS_OPTIONS,
];

// eslint-disable-next-line react-refresh/only-export-components
export const MOCKS_ADMIN_ORDERS = {
    success: true,
    message: 'Lấy danh sách đơn hàng thành công',
    data: {
        plans: [
            {
                id: 'plan-001',
                name: 'Premium Monthly',
                slug: 'premium-monthly',
            },
            {
                id: 'plan-002',
                name: 'Pro Lifetime',
                slug: 'pro-lifetime',
            },
            {
                id: 'plan-003',
                name: 'Premium Yearly',
                slug: 'premium-yearly',
            },
        ],
        pagination: {
            page: 1,
            limit: 10,
            total_items: 4,
            total_pages: 1,
        },
        items: [
            {
                id: 'order-8821',
                order_code: 'ORD-8821',
                user: {
                    id: 'user-001',
                    name: 'Lê Đức Huy',
                    email: 'hung.le@gmail.com',
                    avatar: 'https://i.pravatar.cc/80?img=12',
                },
                plan: {
                    id: 'plan-001',
                    name: 'Premium Monthly',
                    slug: 'premium-monthly',
                },
                amount_cents: '199000',
                currency: 'VND',
                payment_method: 'Momo',
                status: 'PAID',
                created_at: '2024-05-20T08:30:00.000Z',
            },
            {
                id: 'order-8752',
                order_code: 'ORD-8752',
                user: {
                    id: 'user-002',
                    name: 'Nguyễn Văn Long',
                    email: 'mai.tt@hotmail.com',
                    avatar: 'https://i.pravatar.cc/80?img=14',
                },
                plan: {
                    id: 'plan-002',
                    name: 'Pro Lifetime',
                    slug: 'pro-lifetime',
                },
                amount_cents: '1299000',
                currency: 'VND',
                payment_method: 'VNPAY',
                status: 'PENDING',
                created_at: '2024-05-19T08:30:00.000Z',
            },
            {
                id: 'order-8699',
                order_code: 'ORD-8699',
                user: {
                    id: 'user-003',
                    name: 'Phạm Minh Đức',
                    email: 'duc.pham@outlook.com',
                    avatar: 'https://i.pravatar.cc/80?img=15',
                },
                plan: {
                    id: 'plan-003',
                    name: 'Premium Yearly',
                    slug: 'premium-yearly',
                },
                amount_cents: '899000',
                currency: 'VND',
                payment_method: 'Thẻ tín dụng',
                status: 'FAILED',
                created_at: '2024-05-18T08:30:00.000Z',
            },
            {
                id: 'order-8640',
                order_code: 'ORD-8640',
                user: {
                    id: 'user-004',
                    name: 'Nguyễn Bảo Ngọc',
                    email: 'ngoc.nb@gmail.com',
                    avatar: 'https://i.pravatar.cc/80?img=16',
                },
                plan: {
                    id: 'plan-001',
                    name: 'Premium Monthly',
                    slug: 'premium-monthly',
                },
                amount_cents: '199000',
                currency: 'VND',
                payment_method: 'ZaloPay',
                status: 'PAID',
                created_at: '2024-05-18T08:30:00.000Z',
            },
        ],
    },
    date: '10:30:00 20/05/2024',
    path: '/api/v1/admin/orders',
};

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [plans, setPlans] = useState([]);
    const [pagination, setPagination] = useState({});
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [planFilter, setPlanFilter] = useState('ALL');
    const [createdDate, setCreatedDate] = useState('');

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalMode, setModalMode] = useState(null);
    const [editForm, setEditForm] = useState({
        status: '',
        plan_slug: '',
        amount_cents: '',
        payment_method: '',
    });

    useEffect(() => {
        const fetchApi = async () => {
            try {
                // const result = await getPayment();
                const result = MOCKS_ADMIN_ORDERS;

                if (!result.success) {
                    throw new Error(result.message || 'Không thể lấy danh sách đơn hàng');
                }

                setOrders(result.data.items || []);
                setPlans(result.data.plans || []);
                setPagination(result.data.pagination || {});
            } catch (error) {
                console.log(error);
            }
        };

        fetchApi();
    }, []);

    const planOptions = useMemo(() => {
        return [
            {
                label: 'Tất cả các gói',
                value: 'ALL',
            },
            ...plans.map((plan) => ({
                label: plan.name,
                value: plan.slug,
            })),
        ];
    }, [plans]);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const isMatchStatus = statusFilter === 'ALL' || order.status === statusFilter;
            const isMatchPlan = planFilter === 'ALL' || order.plan?.slug === planFilter;
            const isMatchDate =
                !createdDate || order.created_at?.slice(0, 10) === createdDate;

            return isMatchStatus && isMatchPlan && isMatchDate;
        });
    }, [orders, statusFilter, planFilter, createdDate]);

    const currentPage = pagination.page || 1;
    const limit = pagination.limit || 10;
    const totalItems = filteredOrders.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const showingFrom = totalItems ? 1 : 0;
    const showingTo = filteredOrders.length;
    const isModalOpen = Boolean(selectedOrder && modalMode);

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setModalMode('view');
    };

    const handleEditOrder = (order) => {
        setSelectedOrder(order);
        setModalMode('edit');
        setEditForm({
            status: order.status || '',
            plan_slug: order.plan?.slug || '',
            amount_cents: order.amount_cents || '',
            payment_method: order.payment_method || '',
        });
    };

    const handleDeleteOrder = (order) => {
        setSelectedOrder(order);
        setModalMode('delete');
    };

    const handleSwitchToEditModal = () => {
        if (!selectedOrder) return;

        handleEditOrder(selectedOrder);
    };

    const handleConfirmDeleteOrder = () => {
        if (!selectedOrder) return;

        setOrders((prevOrders) => {
            return prevOrders.filter((item) => item.id !== selectedOrder.id);
        });

        handleCloseModal();
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
        setModalMode(null);
        setEditForm({
            status: '',
            plan_slug: '',
            amount_cents: '',
            payment_method: '',
        });
    };

    const handleEditFormChange = (event) => {
        const { name, value } = event.target;

        setEditForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleSaveOrder = () => {
        if (!selectedOrder) return;

        const amountValue = editForm.amount_cents.trim();

        if (!amountValue || Number.isNaN(Number(amountValue)) || Number(amountValue) < 0) {
            alert('Số tiền không hợp lệ');
            return;
        }

        const selectedPlan = plans.find((plan) => plan.slug === editForm.plan_slug);

        setOrders((prevOrders) => {
            return prevOrders.map((order) => {
                if (order.id !== selectedOrder.id) return order;

                return {
                    ...order,
                    status: editForm.status,
                    amount_cents: amountValue,
                    payment_method: editForm.payment_method.trim(),
                    plan: selectedPlan
                        ? {
                            id: selectedPlan.id,
                            name: selectedPlan.name,
                            slug: selectedPlan.slug,
                        }
                        : order.plan,
                };
            });
        });

        handleCloseModal();
    };

    const getModalTitle = () => {
        if (modalMode === 'view') return 'Chi tiết đơn hàng';
        if (modalMode === 'edit') return 'Chỉnh sửa đơn hàng';
        if (modalMode === 'delete') return 'Xóa đơn hàng';

        return '';
    };

    const renderModalContent = () => {
        if (!selectedOrder || !modalMode) return null;

        if (modalMode === 'view') {
            return <OrderDetailModal order={selectedOrder} />;
        }

        if (modalMode === 'edit') {
            return (
                <OrderEditModal
                    order={selectedOrder}
                    plans={plans}
                    statusOptions={ORDER_STATUS_OPTIONS}
                    editForm={editForm}
                    onChange={handleEditFormChange}
                />
            );
        }

        if (modalMode === 'delete') {
            return <OrderDeleteModal order={selectedOrder} />;
        }

        return null;
    };

    const renderModalFooter = () => {
        if (modalMode === 'edit') {
            return (
                <Button
                    type="button"
                    className={cx('modalSaveButton')}
                    onClick={handleSaveOrder}
                >
                    Lưu thay đổi
                </Button>
            );
        }

        if (modalMode === 'delete') {
            return (
                <Button
                    type="button"
                    className={cx('modalDeleteButton')}
                    onClick={handleConfirmDeleteOrder}
                >
                    Xóa đơn hàng
                </Button>
            );
        }

        if (modalMode === 'view') {
            return (
                <>
                    <Button
                        type="button"
                        className={cx('modalEditButton')}
                        onClick={handleSwitchToEditModal}
                    >
                        Chỉnh sửa
                    </Button>

                    <Button
                        type="button"
                        className={cx('modalCloseButton')}
                        onClick={handleCloseModal}
                    >
                        Đóng
                    </Button>
                </>
            );
        }

        return null;
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header')}>
                <h1>Quản lý đơn hàng</h1>
                <p>Theo dõi và quản lý các giao dịch thanh toán từ người dùng.</p>
            </div>

            <div className={cx('filterCard')}>
                <label className={cx('filterGroup')}>
                    <span>Trạng thái</span>

                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        {ORDER_STATUS_FILTER_OPTIONS.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className={cx('filterGroup')}>
                    <span>Gói dịch vụ</span>

                    <select
                        value={planFilter}
                        onChange={(event) => setPlanFilter(event.target.value)}
                    >
                        {planOptions.map((plan) => (
                            <option key={plan.value} value={plan.value}>
                                {plan.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label className={cx('filterGroup')}>
                    <span>Ngày tạo</span>

                    <input
                        type="date"
                        value={createdDate}
                        onChange={(event) => setCreatedDate(event.target.value)}
                    />
                </label>
            </div>

            <div className={cx('tableCard')}>
                <table className={cx('table')}>
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Người dùng</th>
                            <th>Gói dịch vụ</th>
                            <th>Giá</th>
                            <th>PT thanh toán</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredOrders.map((order) => (
                            <OrderRow
                                key={order.id}
                                order={order}
                                onView={handleViewOrder}
                                onEdit={handleEditOrder}
                                onDelete={handleDeleteOrder}
                            />
                        ))}

                        {!filteredOrders.length && (
                            <tr>
                                <td colSpan="8" className={cx('emptyCell')}>
                                    Không tìm thấy đơn hàng phù hợp.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className={cx('tableFooter')}>
                    <p>
                        Hiển thị {showingFrom}-{showingTo} của {totalItems} đơn hàng
                    </p>

                    <div className={cx('pagination')}>
                        <button type="button" disabled aria-label="Trang trước">
                            <FiChevronLeft />
                        </button>

                        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                            (page) => (
                                <button
                                    key={page}
                                    type="button"
                                    className={cx({
                                        activePage: currentPage === page,
                                    })}
                                >
                                    {page}
                                </button>
                            ),
                        )}

                        <button
                            type="button"
                            disabled={currentPage === totalPages}
                            aria-label="Trang sau"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={getModalTitle()}
                description={selectedOrder ? `Mã đơn ${selectedOrder.order_code}` : ''}
                size="lg"
                footer={renderModalFooter()}
            >
                {renderModalContent()}
            </Modal>
        </div>
    );
}

export default AdminOrders;