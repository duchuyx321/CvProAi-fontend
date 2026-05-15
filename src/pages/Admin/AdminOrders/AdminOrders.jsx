import { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

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

const SortOrder = {
    ASC: 'ASC',
    DESC: 'DESC',
};

const PaymentSortBy = {
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    ORDER_CODE: 'order_code',
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
        label: 'Cập nhật mới nhất',
        sort_by: PaymentSortBy.UPDATED_AT,
        sort_order: SortOrder.DESC,
    },
    {
        label: 'Cập nhật cũ nhất',
        sort_by: PaymentSortBy.UPDATED_AT,
        sort_order: SortOrder.ASC,
    },
    {
        label: 'Mã đơn: A → Z',
        sort_by: PaymentSortBy.ORDER_CODE,
        sort_order: SortOrder.ASC,
    },
    {
        label: 'Mã đơn: Z → A',
        sort_by: PaymentSortBy.ORDER_CODE,
        sort_order: SortOrder.DESC,
    },
];

const RANGE_OPTIONS = [
    { label: '7 ngày qua', value: '7d' },
    { label: '30 ngày qua', value: '30d' },
    { label: 'Tháng này', value: 'month' },
    { label: 'Năm nay', value: 'year' },
    { label: 'Tùy chỉnh', value: 'custom' },
];

const DEFAULT_META = {
    page: 1,
    limit: PAGE_SIZE,
    total_items: 0,
    total_pages: 1,
};

const DEFAULT_FILTERS = {
    search: '',
    sort_by: PaymentSortBy.CREATED_AT,
    sort_order: SortOrder.DESC,
    range: '30d',
    from: '',
    to: '',
};

const DEFAULT_EDIT_FORM = {
    status: '',
    provider_transaction_id: '',
    reason: '',
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

function getApiMessage(response, fallbackMessage) {
    return response?.message || response?.messsage || fallbackMessage;
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

function normalizeToolbarFilters({ search, sort, range }) {
    const nextFilters = {
        search: search?.trim() || '',
        sort_by: sort?.sort_by || DEFAULT_FILTERS.sort_by,
        sort_order: sort?.sort_order || DEFAULT_FILTERS.sort_order,
        range: '',
        from: '',
        to: '',
    };

    if (typeof range === 'string') {
        nextFilters.range = range;
        return nextFilters;
    }

    nextFilters.range = 'custom';
    nextFilters.from = range?.from || '';
    nextFilters.to = range?.to || '';

    return nextFilters;
}

function isSameFilters(currentFilters, nextFilters) {
    return (
        currentFilters.search === nextFilters.search &&
        currentFilters.sort_by === nextFilters.sort_by &&
        currentFilters.sort_order === nextFilters.sort_order &&
        currentFilters.range === nextFilters.range &&
        currentFilters.from === nextFilters.from &&
        currentFilters.to === nextFilters.to
    );
}

function buildOrderListPayload({ page, filters }) {
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

    return payload;
}

function getOrderListFromResponse(response) {
    return Array.isArray(response?.data?.data) ? response.data.data : [];
}

function getMetaFromResponse(response) {
    return response?.data?.meta || DEFAULT_META;
}

function getDetailDataFromResponse(response, fallbackOrder) {
    return response?.data?.data || response?.data || fallbackOrder;
}

function getUpdatedOrderFromResponse(response) {
    return response?.data?.data || response?.data || {};
}

function AdminOrders() {
    const [page, setPage] = useState(getPageFromUrl);
    const [orders, setOrders] = useState([]);
    const [meta, setMeta] = useState(DEFAULT_META);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState(DEFAULT_FILTERS);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modalMode, setModalMode] = useState(null);

    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [editForm, setEditForm] = useState(DEFAULT_EDIT_FORM);

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

                const payload = buildOrderListPayload({
                    page,
                    filters,
                });

                const response = await getAllOrders(payload);

                if (ignore) return;

                if (!response?.success) {
                    toast.warning(
                        getApiMessage(
                            response,
                            'Không thể lấy danh sách đơn hàng',
                        ),
                    );

                    setOrders([]);
                    setMeta(DEFAULT_META);
                    return;
                }

                setOrders(getOrderListFromResponse(response));
                setMeta(getMetaFromResponse(response));
            } catch (error) {
                if (ignore) return;

                toast.error(
                    getErrorMessage(
                        error,
                        'Có lỗi xảy ra khi tải danh sách đơn hàng',
                    ),
                );

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
    }, [page, filters]);

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
            const nextFilters = normalizeToolbarFilters({
                search,
                sort,
                range,
            });

            if (isSameFilters(filters, nextFilters)) return;

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

            const response = await getOrderDetail(order.order_code);

            if (!response?.success) {
                toast.warning(
                    getApiMessage(response, 'Không thể lấy chi tiết đơn hàng'),
                );
                return;
            }

            setSelectedOrder(getDetailDataFromResponse(response, order));
        } catch (error) {
            toast.error(
                getErrorMessage(error, 'Có lỗi xảy ra khi tải chi tiết đơn hàng'),
            );
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
        setEditForm(DEFAULT_EDIT_FORM);
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
            toast.warning('Vui lòng chọn trạng thái');
            return;
        }

        if (editForm.status === selectedOrder.status) {
            toast.warning('Trạng thái mới đang trùng với trạng thái hiện tại.');
            return;
        }

        if (
            editForm.status === 'PAID' &&
            !editForm.provider_transaction_id.trim()
        ) {
            toast.warning('Vui lòng nhập mã giao dịch từ cổng thanh toán');
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

            const response = await editOrder(
                selectedOrder.order_code,
                selectedOrder.id,
                payload,
            );

            if (!response?.success) {
                toast.warning(
                    getApiMessage(response, 'Không thể cập nhật đơn hàng'),
                );
                return;
            }

            const updatedOrder = getUpdatedOrderFromResponse(response);

            setOrders((prevOrders) =>
                prevOrders.map((order) => {
                    if (order.id !== selectedOrder.id) return order;

                    return {
                        ...order,
                        ...updatedOrder,
                        status: updatedOrder.status || payload.status,
                        provider_transaction_id:
                            updatedOrder.provider_transaction_id ||
                            payload.provider_transaction_id,
                    };
                }),
            );

            toast.success(
                getApiMessage(response, 'Cập nhật đơn hàng thành công'),
            );

            handleCloseModal();
        } catch (error) {
            toast.error(getErrorMessage(error, 'Cập nhật đơn hàng thất bại'));
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
                    defaultSortBy={DEFAULT_FILTERS.sort_by}
                    defaultSortOrder={DEFAULT_FILTERS.sort_order}
                    defaultRange={DEFAULT_FILTERS.range}
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
