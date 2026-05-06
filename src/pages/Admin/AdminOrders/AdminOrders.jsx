import { useEffect, useMemo, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import classNames from 'classnames/bind';
import Modal from '~/components/Modal';
import Button from '~/components/Button';
import OrderRow from './components/OrderRow';
import OrderDetailModal from './components/OrderDetailModal';
import OrderEditModal from './components/OrderEditModal';
import styles from './AdminOrders.module.scss';
import { getOrders } from '~/services/history.service';
import { useDebounce } from '~/hooks/useDebounce';

const cx = classNames.bind(styles);

const DEFAULT_LIMIT = 8;

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

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: DEFAULT_LIMIT,
        total_items: 0,
        total_pages: 1,
    });

    const [searchValue, setSearchValue] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const debouncedSearchValue = useDebounce(searchValue, 500);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalMode, setModalMode] = useState(null);

    const [editForm, setEditForm] = useState({
        status: '',
        plan_name: '',
        amount_cents: '',
    });

    const fetchOrders = async (page = 1) => {
        try {
            setIsLoading(true);

            const queryParams = {
                page,
                limit: DEFAULT_LIMIT,
            };

            if (fromDate) {
                queryParams.from = fromDate;
            }

            if (toDate) {
                queryParams.to = toDate;
            }

            const result = await getOrders(queryParams);

            if (!result.success) {
                throw new Error(
                    result.message ||
                    result.messsage ||
                    'Không thể lấy danh sách đơn hàng',
                );
            }

            const ordersData = result.data?.data || [];
            const metaData = result.data?.meta || {};

            setOrders(ordersData);
            setPagination({
                page: metaData.page || page,
                limit: metaData.limit || DEFAULT_LIMIT,
                total_items: metaData.total_items || ordersData.length,
                total_pages: metaData.total_pages || 1,
            });
        } catch (error) {
            console.log(error);

            setOrders([]);
            setPagination({
                page: 1,
                limit: DEFAULT_LIMIT,
                total_items: 0,
                total_pages: 1,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(1);
    }, [fromDate, toDate]);

    useEffect(() => {
        const hasLocalFilter =
            debouncedSearchValue.trim() || statusFilter !== 'ALL';

        if (!hasLocalFilter) return;
        if (pagination.page === 1) return;

        fetchOrders(1);
    }, [debouncedSearchValue, statusFilter]);

    const planOptions = useMemo(() => {
        const uniquePlanNames = [
            ...new Set(
                orders
                    .map((order) => order.plan?.name)
                    .filter(Boolean),
            ),
        ];

        return [
            {
                label: 'Tất cả các gói',
                value: 'ALL',
            },
            ...uniquePlanNames.map((planName) => ({
                label: planName,
                value: planName,
            })),
        ];
    }, [orders]);

    const filteredOrders = useMemo(() => {
        const keyword = debouncedSearchValue.trim().toLowerCase();

        return orders.filter((order) => {
            const isMatchStatus =
                statusFilter === 'ALL' || order.status === statusFilter;

            const searchableText = [
                order.order_code,
                order.user?.full_name,
                order.user?.email,
                order.plan?.name,
                order.addon_package?.name,
                order.order_type,
                order.status,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const isMatchSearch = !keyword || searchableText.includes(keyword);

            return isMatchStatus && isMatchSearch;
        });
    }, [orders, statusFilter, debouncedSearchValue]);

    const currentPage = pagination.page || 1;
    const backendTotalItems = pagination.total_items || 0;
    const backendTotalPages = Math.max(1, pagination.total_pages || 1);

    const hasLocalFilter =
        Boolean(debouncedSearchValue.trim()) || statusFilter !== 'ALL';

    const displayCurrentPage = hasLocalFilter ? 1 : currentPage;
    const displayTotalItems = hasLocalFilter ? filteredOrders.length : backendTotalItems;
    const displayTotalPages = hasLocalFilter ? 1 : backendTotalPages;

    const showingFrom = filteredOrders.length
        ? (displayCurrentPage - 1) * DEFAULT_LIMIT + 1
        : 0;

    const showingTo = filteredOrders.length
        ? showingFrom + filteredOrders.length - 1
        : 0;

    const isModalOpen = Boolean(selectedOrder && modalMode);

    const handlePrevPage = () => {
        if (hasLocalFilter || currentPage <= 1 || isLoading) return;

        fetchOrders(currentPage - 1);
    };

    const handleNextPage = () => {
        if (hasLocalFilter || currentPage >= backendTotalPages || isLoading) return;

        fetchOrders(currentPage + 1);
    };

    const handleGoToPage = (page) => {
        if (hasLocalFilter || page === currentPage || isLoading) return;

        fetchOrders(page);
    };

    const handleResetFilters = () => {
        setSearchValue('');
        setStatusFilter('ALL');
        setFromDate('');
        setToDate('');
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setModalMode('view');
    };

    const handleEditOrder = (order) => {
        setSelectedOrder(order);
        setModalMode('edit');

        setEditForm({
            status: order.status || '',
            plan_name: order.plan?.name || '',
            amount_cents: order.amount_cents || '',
        });
    };

    const handleSwitchToEditModal = () => {
        if (!selectedOrder) return;

        handleEditOrder(selectedOrder);
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
        setModalMode(null);

        setEditForm({
            status: '',
            plan_name: '',
            amount_cents: '',
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

        setOrders((prevOrders) => {
            return prevOrders.map((order) => {
                if (order.id !== selectedOrder.id) return order;

                return {
                    ...order,
                    status: editForm.status,
                    amount_cents: amountValue,
                    plan: {
                        ...order.plan,
                        name: editForm.plan_name,
                    },
                };
            });
        });

        handleCloseModal();
    };

    const getModalTitle = () => {
        if (modalMode === 'view') return 'Chi tiết đơn hàng';
        if (modalMode === 'edit') return 'Chỉnh sửa đơn hàng';

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
                    plans={planOptions.filter((plan) => plan.value !== 'ALL')}
                    statusOptions={ORDER_STATUS_OPTIONS}
                    editForm={editForm}
                    onChange={handleEditFormChange}
                />
            );
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
                    <span>Tìm kiếm</span>
                    <input
                        type="search"
                        value={searchValue}
                        placeholder="Mã đơn, email, tên..."
                        onChange={(event) => setSearchValue(event.target.value)}
                    />
                </label>

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
                    <span>Từ ngày</span>
                    <input
                        type="date"
                        value={fromDate}
                        max={toDate || undefined}
                        onChange={(event) => setFromDate(event.target.value)}
                    />
                </label>

                <label className={cx('filterGroup')}>
                    <span>Đến ngày</span>
                    <input
                        type="date"
                        value={toDate}
                        min={fromDate || undefined}
                        onChange={(event) => setToDate(event.target.value)}
                    />
                </label>

                <div className={cx('filterActions')}>
                    <Button
                        type="button"
                        className={cx('resetFilterButton')}
                        onClick={handleResetFilters}
                    >
                        Làm mới
                    </Button>
                </div>
            </div>

            <div className={cx('tableCard')}>
                <table className={cx('table')}>
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Người dùng</th>
                            <th>Gói dịch vụ</th>
                            <th>Giá</th>
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
                            />
                        ))}

                        {!filteredOrders.length && (
                            <tr>
                                <td colSpan="7" className={cx('emptyCell')}>
                                    {isLoading
                                        ? 'Đang tải danh sách đơn hàng...'
                                        : 'Không tìm thấy đơn hàng phù hợp.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className={cx('tableFooter')}>
                    <p>
                        Hiển thị {showingFrom}-{showingTo} của {displayTotalItems} đơn hàng
                    </p>

                    <div className={cx('pagination')}>
                        <button
                            type="button"
                            disabled={
                                hasLocalFilter ||
                                displayCurrentPage <= 1 ||
                                isLoading
                            }
                            onClick={handlePrevPage}
                            aria-label="Trang trước"
                        >
                            <FiChevronLeft />
                        </button>

                        {Array.from(
                            { length: displayTotalPages },
                            (_, index) => index + 1,
                        ).map((page) => (
                            <button
                                key={page}
                                type="button"
                                disabled={hasLocalFilter || isLoading}
                                className={cx({
                                    activePage: displayCurrentPage === page,
                                })}
                                onClick={() => handleGoToPage(page)}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            disabled={
                                hasLocalFilter ||
                                displayCurrentPage >= displayTotalPages ||
                                isLoading
                            }
                            onClick={handleNextPage}
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