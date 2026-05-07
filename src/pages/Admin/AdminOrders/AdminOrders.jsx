import { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames/bind';

import Button from '~/components/Button';
import GenericAdminToolbar from '~/components/GenericAdminToolbar';
import Pagination from '~/components/Pagination';
import Modal from '~/components/Modal';

import OrderRow from './components/OrderRow';
import OrderDetailModal from './components/OrderDetailModal';
import OrderEditModal from './components/OrderEditModal';

import {
    editOrder,
    getAllOrders,
    getOrderDetail,
} from '~/services/history.service';

import styles from './AdminOrders.module.scss';

const cx = classNames.bind(styles);

const PAGE_SIZE = 8;

const PaymentSortBy = {
    CREATED_AT: 'createdAt',
    PAID_AT: 'paid_at',
    AMOUNT: 'amount_cents',
};

const SortOrder = {
    ASC: 'ASC',
    DESC: 'DESC',
};

const SORT_OPTIONS = [
    {
        label: 'Tạo mới nhất',
        sort_by: PaymentSortBy.CREATED_AT,
        sort_order: SortOrder.DESC,
    },
    {
        label: 'Tạo cũ nhất',
        sort_by: PaymentSortBy.CREATED_AT,
        sort_order: SortOrder.ASC,
    },
    {
        label: 'Thanh toán mới nhất',
        sort_by: PaymentSortBy.PAID_AT,
        sort_order: SortOrder.DESC,
    },
    {
        label: 'Số tiền cao nhất',
        sort_by: PaymentSortBy.AMOUNT,
        sort_order: SortOrder.DESC,
    },
    {
        label: 'Số tiền thấp nhất',
        sort_by: PaymentSortBy.AMOUNT,
        sort_order: SortOrder.ASC,
    },
];

const RANGE_OPTIONS = [
    {
        label: '7 ngày qua',
        value: '7d',
    },
    {
        label: '30 ngày qua',
        value: '30d',
    },
    {
        label: '90 ngày qua',
        value: '90d',
    },
    {
        label: 'Tháng này',
        value: 'month',
    },
    {
        label: 'Năm nay',
        value: 'year',
    },
    {
        label: 'Tùy chỉnh',
        value: 'custom',
    },
];

const DEFAULT_META = {
    page: 1,
    limit: PAGE_SIZE,
    total_items: 0,
    total_pages: 1,
};

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
];

function getPageFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const pageParam = Number(params.get('page'));

    return pageParam > 0 ? pageParam : 1;
}

function syncPageToUrl(nextPage, replace = false) {
    const params = new URLSearchParams(window.location.search);
    params.set('page', String(nextPage));

    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    const method = replace ? 'replaceState' : 'pushState';

    window.history[method](null, '', nextUrl);
}

function getErrorMessage(error, fallbackMessage) {
    return (
        error.response?.data?.error?.[0] ||
        error.response?.data?.message ||
        error.response?.data?.messsage ||
        error.message ||
        fallbackMessage
    );
}

function AdminOrders() {
    const [page, setPage] = useState(getPageFromUrl);
    const [orders, setOrders] = useState([]);
    const [meta, setMeta] = useState(DEFAULT_META);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        search: '',
        sort_by: PaymentSortBy.CREATED_AT,
        sort_order: SortOrder.DESC,
        range: '30d',
        from: '',
        to: '',
    });

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalMode, setModalMode] = useState(null);

    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [editForm, setEditForm] = useState({
        status: '',
        provider_transaction_id: '',
        reason: '',
    });

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const pageParam = Number(params.get('page'));

        if (!params.get('page') || pageParam <= 0 || Number.isNaN(pageParam)) {
            syncPageToUrl(1, true);
            setPage(1);
        }
    }, []);

    useEffect(() => {
        let ignore = false;

        const fetchOrders = async () => {
            try {
                setLoading(true);

                const payload = {
                    page,
                    limit: PAGE_SIZE,
                    search: filters.search,
                    sort_by: filters.sort_by,
                    sort_order: filters.sort_order,
                };

                if (filters.range === 'custom') {
                    payload.from = filters.from;
                    payload.to = filters.to;
                } else {
                    payload.range = filters.range;
                }

                const result = await getAllOrders(payload);

                if (ignore) return;

                if (!result.success) {
                    throw new Error(
                        result.message ||
                            result.messsage ||
                            'Không thể lấy danh sách đơn hàng',
                    );
                }

                setOrders(
                    Array.isArray(result.data?.data) ? result.data.data : [],
                );

                setMeta(result.data?.meta || DEFAULT_META);
            } catch (error) {
                if (ignore) return;

                console.log(error);
                setOrders([]);
                setMeta(DEFAULT_META);
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchOrders();

        return () => {
            ignore = true;
        };
    }, [
        page,
        filters.search,
        filters.sort_by,
        filters.sort_order,
        filters.range,
        filters.from,
        filters.to,
    ]);

    const totalPages = Math.max(Number(meta?.total_pages) || 1, 1);
    const totalItems = Number(meta?.total_items) || orders.length;
    const limit = Number(meta?.limit) || PAGE_SIZE;
    const startItem = totalItems ? (page - 1) * limit + 1 : 0;
    const endItem = totalItems ? Math.min(page * limit, totalItems) : 0;

    const isModalOpen = Boolean(selectedOrder && modalMode);

    const handlePageChange = useCallback(
        (newPage) => {
            if (newPage < 1 || newPage > totalPages || newPage === page) {
                return;
            }

            setPage(newPage);
            syncPageToUrl(newPage);
        },
        [page, totalPages],
    );

    const handleToolbarChange = useCallback(
        ({ search, sort, range }) => {
            const nextFilters = {
                search: search || '',
                sort_by: sort?.sort_by || PaymentSortBy.CREATED_AT,
                sort_order: sort?.sort_order || SortOrder.DESC,
                range: '',
                from: '',
                to: '',
            };

            if (typeof range === 'string') {
                nextFilters.range = range;
            } else {
                nextFilters.range = 'custom';
                nextFilters.from = range?.from || '';
                nextFilters.to = range?.to || '';
            }

            const isSame =
                filters.search === nextFilters.search &&
                filters.sort_by === nextFilters.sort_by &&
                filters.sort_order === nextFilters.sort_order &&
                filters.range === nextFilters.range &&
                filters.from === nextFilters.from &&
                filters.to === nextFilters.to;

            if (isSame) return;

            setFilters(nextFilters);
            setPage(1);
            syncPageToUrl(1, true);
        },
        [filters],
    );

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
            alert(getErrorMessage(error, 'Không thể lấy chi tiết đơn hàng'));
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
                payload.provider_transaction_id =
                    editForm.provider_transaction_id.trim();
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
            alert(getErrorMessage(error, 'Cập nhật đơn hàng thất bại'));
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
            <header>
                <div className={cx('title')}>
                    <h3>Quản lý đơn hàng</h3>
                    <p>
                        Theo dõi và quản lý các giao dịch thanh toán từ người
                        dùng.
                    </p>
                </div>
            </header>

            <div className={cx('toolbar')}>
                <GenericAdminToolbar
                    sortOptions={SORT_OPTIONS}
                    rangeOptions={RANGE_OPTIONS}
                    defaultSortBy={PaymentSortBy.CREATED_AT}
                    defaultSortOrder={SortOrder.DESC}
                    defaultRange="30d"
                    onChange={handleToolbarChange}
                    searchPlaceholder="Tìm theo mã đơn, email, tên..."
                    searchLoading={loading && Boolean(filters.search)}
                />
            </div>

            <div className={cx('tableCard')}>
                <div className={cx('tableScroll')}>
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
                            {orders.map((order) => (
                                <OrderRow
                                    key={order.id}
                                    order={order}
                                    onView={handleViewOrder}
                                    onEdit={handleEditOrder}
                                />
                            ))}

                            {!loading && !orders.length ? (
                                <tr>
                                    <td colSpan="7" className={cx('emptyCell')}>
                                        Không tìm thấy đơn hàng phù hợp.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>

                    {loading ? (
                        <div className={cx('loadingOverlay')}>
                            <span className={cx('loader')} />
                            <span>Đang tải danh sách đơn hàng...</span>
                        </div>
                    ) : null}
                </div>

                <div className={cx('tableFooter')}>
                    <p>
                        Hiển thị {startItem} - {endItem} của {totalItems} đơn
                        hàng
                    </p>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        disabled={loading}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={getModalTitle()}
                description={
                    selectedOrder ? `Mã đơn ${selectedOrder.order_code}` : ''
                }
                size="lg"
                footer={renderModalFooter()}
            >
                {renderModalContent()}
            </Modal>
        </div>
    );
}

export default AdminOrders;