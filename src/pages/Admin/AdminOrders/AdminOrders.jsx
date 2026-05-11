import { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import Modal from '~/components/Modal';
import Button from '~/components/Button';
import GenericAdminToolbar from '~/components/GenericAdminToolbar';
import Pagination from '~/components/Pagination';
import OrderRow from './components/OrderRow';
import OrderDetailModal from './components/OrderDetailModal';
import OrderEditModal from './components/OrderEditModal';
import styles from './AdminOrders.module.scss';
import { editOrder, getAllOrders, getOrderDetail } from '~/services/history.service';

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
        label: 'Canceled',
        value: 'CANCELED',
    },
];

const ORDER_STATUS_FILTER_OPTIONS = [
    {
        label: 'Tất cả trạng thái',
        value: 'ALL',
    },
    ...ORDER_STATUS_OPTIONS,
];

// Tạm để 1 option mặc định để dùng đúng GenericAdminToolbar.
// Khi backend confirm sort_by/sort_order hợp lệ thì thêm option ở đây.
const ORDER_SORT_OPTIONS = [
    {
        label: 'Mặc định',
        sort_by: '',
        sort_order: '',
    },
];

// Chỉ dùng "Tùy chỉnh" để gửi from/to cho an toàn.
// Các range như 7d/30d chỉ nên thêm khi backend confirm value hợp lệ.
const ORDER_RANGE_OPTIONS = [
    {
        label: 'Tất cả thời gian',
        value: 'all',
    },
    {
        label: 'Tùy chỉnh',
        value: 'custom',
    },
];

function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: DEFAULT_LIMIT,
        total_items: 0,
        total_pages: 1,
    });

    const [toolbarParams, setToolbarParams] = useState({
        search: '',
        sort: null,
        range: 'all',
    });

    const [statusFilter, setStatusFilter] = useState('ALL');

    const [isLoading, setIsLoading] = useState(false);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalMode, setModalMode] = useState(null);

    const [editForm, setEditForm] = useState({
        status: '',
        provider_transaction_id: '',
        reason: '',
    });

    const fetchOrders = async (page = 1) => {
        try {
            setIsLoading(true);

            const queryParams = {
                page,
                limit: DEFAULT_LIMIT,
            };

            const range = toolbarParams.range;

            if (range && typeof range === 'object') {
                if (range.from) {
                    queryParams.from = range.from;
                }

                if (range.to) {
                    queryParams.to = range.to;
                }
            }

            const result = await getAllOrders(queryParams);

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
    }, [toolbarParams.range]);

    useEffect(() => {
        const hasLocalFilter =
            Boolean(toolbarParams.search.trim()) || statusFilter !== 'ALL';

        if (!hasLocalFilter) return;
        if (pagination.page === 1) return;

        fetchOrders(1);
    }, [toolbarParams.search, statusFilter]);

    const handleToolbarChange = useCallback((nextParams) => {
        setToolbarParams({
            search: nextParams.search || '',
            sort: nextParams.sort || null,
            range: nextParams.range || 'all',
        });
    }, []);

    const filteredOrders = useMemo(() => {
        const keyword = toolbarParams.search.trim().toLowerCase();

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
    }, [orders, statusFilter, toolbarParams.search]);

    const currentPage = pagination.page || 1;
    const backendTotalItems = pagination.total_items || 0;
    const backendTotalPages = Math.max(1, pagination.total_pages || 1);

    const hasLocalFilter =
        Boolean(toolbarParams.search.trim()) || statusFilter !== 'ALL';

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

    const handlePageChange = (page) => {
        if (hasLocalFilter || page === currentPage || isLoading) return;

        fetchOrders(page);
    };

    const handleViewOrder = async (order) => {
        try {
            setSelectedOrder(order);
            setModalMode('view');
            setIsDetailLoading(true);

            const result = await getOrderDetail(order.order_code);

            if (!result.success) {
                throw new Error(
                    result.message ||
                        result.messsage ||
                        'Không thể lấy chi tiết đơn hàng',
                );
            }

            const detailData = result.data?.data || result.data || order;

            setSelectedOrder(detailData);
        } catch (error) {
            console.log(error);

            const errorMessage =
                error.response?.data?.error?.[0] ||
                error.response?.data?.message ||
                error.response?.data?.messsage ||
                error.message ||
                'Không thể lấy chi tiết đơn hàng';

            alert(errorMessage);
        } finally {
            setIsDetailLoading(false);
        }
    };

    const handleEditOrder = (order) => {
        setSelectedOrder(order);
        setModalMode('edit');

        setEditForm({
            status: order.status || '',
            provider_transaction_id: order.provider_transaction_id || '',
            reason: '',
        });
    };

    const handleSwitchToEditModal = () => {
        if (!selectedOrder) return;

        handleEditOrder(selectedOrder);
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
        setModalMode(null);
        setIsDetailLoading(false);
        setIsSaving(false);

        setEditForm({
            status: '',
            provider_transaction_id: '',
            reason: '',
        });
    };

    const handleEditFormChange = (event) => {
        const { name, value } = event.target;

        setEditForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleSaveOrder = async () => {
        if (!selectedOrder || isSaving) return;

        if (!editForm.status) {
            alert('Vui lòng chọn trạng thái');
            return;
        }

        if (editForm.status === selectedOrder.status) {
            alert('Trạng thái mới đang trùng với trạng thái hiện tại.');
            return;
        }

        if (editForm.status === 'PAID' && !editForm.provider_transaction_id.trim()) {
            alert('Vui lòng nhập mã giao dịch từ cổng thanh toán');
            return;
        }

        try {
            setIsSaving(true);

            const payload = {
                status: editForm.status,
                reason: editForm.reason.trim(),
            };

            if (editForm.status === 'PAID') {
                payload.provider_transaction_id = editForm.provider_transaction_id.trim();
            }

            const result = await editOrder(
                selectedOrder.order_code,
                selectedOrder.id,
                payload,
            );

            if (!result.success) {
                throw new Error(
                    result.message ||
                        result.messsage ||
                        'Không thể cập nhật đơn hàng',
                );
            }

            const updatedOrder = result.data?.data || result.data || {};

            setOrders((prevOrders) => {
                return prevOrders.map((order) => {
                    if (order.id !== selectedOrder.id) return order;

                    return {
                        ...order,
                        ...updatedOrder,
                        status: updatedOrder.status || payload.status,
                        provider_transaction_id:
                            updatedOrder.provider_transaction_id ||
                            payload.provider_transaction_id,
                    };
                });
            });

            handleCloseModal();
        } catch (error) {
            console.log(error);

            const errorMessage =
                error.response?.data?.error?.[0] ||
                error.response?.data?.message ||
                error.response?.data?.messsage ||
                error.message ||
                'Cập nhật đơn hàng thất bại';

            alert(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const getModalTitle = () => {
        if (modalMode === 'view') return 'Chi tiết đơn hàng';
        if (modalMode === 'edit') return 'Chỉnh sửa đơn hàng';

        return '';
    };

    const renderModalContent = () => {
        if (!selectedOrder || !modalMode) return null;

        if (modalMode === 'view') {
            if (isDetailLoading) {
                return <p>Đang tải chi tiết đơn hàng...</p>;
            }

            return <OrderDetailModal order={selectedOrder} />;
        }

        if (modalMode === 'edit') {
            return (
                <OrderEditModal
                    order={selectedOrder}
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
                    disabled={isSaving}
                >
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
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
                        disabled={isDetailLoading}
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

            <GenericAdminToolbar
                searchPlaceholder="Tìm theo mã đơn, email, tên..."
                sortOptions={ORDER_SORT_OPTIONS}
                rangeOptions={ORDER_RANGE_OPTIONS}
                defaultSortBy=""
                defaultSortOrder=""
                defaultRange="all"
                searchLoading={isLoading}
                onChange={handleToolbarChange}
            />

            <div className={cx('statusFilterBar')}>
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

                    <Pagination
                        currentPage={displayCurrentPage}
                        totalPages={displayTotalPages}
                        disabled={hasLocalFilter || isLoading}
                        onPageChange={handlePageChange}
                    />
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