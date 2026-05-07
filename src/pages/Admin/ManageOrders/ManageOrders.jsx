import { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { FiRefreshCw, FiSearch } from 'react-icons/fi';

import styles from './ManageOrders.module.scss';
import { getAdminOrders } from '~/services/manage-orders.service';

const cx = classNames.bind(styles);

function formatMoney(value) {
    if (value === null || value === undefined || value === '') return '0đ';
    return `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)}đ`;
}

function formatDateTime(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function mapOrders(items = []) {
    return (Array.isArray(items) ? items : []).map((item) => {
        let statusType = 'warning';
        let statusText = item?.status || '';

        if (item?.status === 'PAID') {
            statusType = 'success';
            statusText = 'ĐÃ THANH TOÁN';
        }

        if (item?.status === 'PENDING') {
            statusType = 'warning';
            statusText = 'ĐANG CHỜ';
        }

        if (item?.status === 'FAILED' || item?.status === 'CANCELED') {
            statusType = 'danger';
            statusText = 'THẤT BẠI';
        }

        let planName = '';
        if (item?.order_type === 'BOTH') {
            const plan = item?.plan?.name || '';
            const addon = item?.addon_package?.name || '';
            planName = [plan, addon].filter(Boolean).join(' + ');
        } else if (item?.plan?.name) {
            planName = item.plan.name;
        } else if (item?.addon_package?.name) {
            planName = item.addon_package.name;
        }

        return {
            id: item?.order_code || item?.id || '',
            fullName: item?.user?.full_name || '',
            email: item?.user?.email || '',
            plan: planName || 'Không rõ',
            amount: formatMoney(item?.amount_cents),
            status: statusText,
            statusType,
            createdAt: formatDateTime(item?.createdAt || item?.created_at),
            paidAt: formatDateTime(item?.paid_at),
        };
    });
}

function ManageOrders() {
    const [orders, setOrders] = useState([]);
    const [meta, setMeta] = useState({
        page: 1,
        limit: 10,
        total_items: 0,
        total_pages: 1,
    });

    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [keyword, setKeyword] = useState('');

    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const queryParams = useMemo(() => {
        return {
            page,
            limit,
            status: statusFilter,
            search: keyword,
        };
    }, [page, limit, statusFilter, keyword]);

    const fetchOrders = async (params = queryParams, isRefresh = false) => {
        try {
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setErrorMessage('');

            const res = await getAdminOrders(params);

            if (!res?.success) {
                setErrorMessage(
                    res?.message ||
                        res?.messsage ||
                        'Không tải được danh sách đơn hàng',
                );
                return;
            }

            const payload = res?.data || {};
            const rawItems = payload?.data || [];
            const rawMeta = payload?.meta || {};

            setOrders(mapOrders(rawItems));
            setMeta({
                page: rawMeta?.page || 1,
                limit: rawMeta?.limit || limit,
                total_items: rawMeta?.total_items || 0,
                total_pages: rawMeta?.total_pages || 1,
            });
        } catch {
            setErrorMessage('Có lỗi xảy ra khi tải đơn hàng');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchOrders(queryParams);
    }, [queryParams]);

    const handleSearch = () => {
        setPage(1);
        setKeyword(searchInput.trim());
    };

    const handleRefresh = async () => {
        await fetchOrders(queryParams, true);
    };

    const handleChangeStatus = (nextStatus) => {
        setPage(1);
        setStatusFilter(nextStatus);
    };

    return (
        <div className={cx('page')}>
            <div className={cx('header')}>
                <div>
                    <h1 className={cx('title')}>Quản lý đơn hàng</h1>
                    <p className={cx('subtitle')}>
                        Tổng cộng {meta.total_items} đơn hàng
                    </p>
                </div>

                <button
                    type="button"
                    className={cx('refreshBtn')}
                    onClick={handleRefresh}
                    disabled={loading || refreshing}
                >
                    <FiRefreshCw />
                    <span>
                        {refreshing ? 'Đang tải...' : 'Làm mới'}
                    </span>
                </button>
            </div>

            <div className={cx('toolbar')}>
                <div className={cx('searchBox')}>
                    <FiSearch className={cx('searchIcon')} />
                    <input
                        type="text"
                        placeholder="Tìm theo mã đơn hoặc email..."
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                handleSearch();
                            }
                        }}
                    />
                    <button
                        type="button"
                        className={cx('searchBtn')}
                        onClick={handleSearch}
                    >
                        Tìm
                    </button>
                </div>

                <div className={cx('filterGroup')}>
                    <button
                        type="button"
                        className={cx('filterBtn', {
                            active: statusFilter === '',
                        })}
                        onClick={() => handleChangeStatus('')}
                    >
                        Tất cả
                    </button>

                    <button
                        type="button"
                        className={cx('filterBtn', {
                            active: statusFilter === 'PAID',
                        })}
                        onClick={() => handleChangeStatus('PAID')}
                    >
                        Đã thanh toán
                    </button>

                    <button
                        type="button"
                        className={cx('filterBtn', {
                            active: statusFilter === 'PENDING',
                        })}
                        onClick={() => handleChangeStatus('PENDING')}
                    >
                        Đang chờ
                    </button>

                    <button
                        type="button"
                        className={cx('filterBtn', {
                            active:
                                statusFilter === 'FAILED' ||
                                statusFilter === 'CANCELED',
                        })}
                        onClick={() => handleChangeStatus('FAILED')}
                    >
                        Thất bại
                    </button>
                </div>
            </div>

            {errorMessage ? (
                <div className={cx('stateBox', 'errorState')}>
                    {errorMessage}
                </div>
            ) : loading ? (
                <div className={cx('stateBox')}>Đang tải đơn hàng...</div>
            ) : (
                <>
                    <div className={cx('tableWrap')}>
                        <table className={cx('table')}>
                            <thead>
                                <tr>
                                    <th>MÃ ĐƠN</th>
                                    <th>KHÁCH HÀNG</th>
                                    <th>EMAIL</th>
                                    <th>GÓI</th>
                                    <th>SỐ TIỀN</th>
                                    <th>TRẠNG THÁI</th>
                                    <th>THỜI GIAN TẠO</th>
                                    <th>THANH TOÁN</th>
                                </tr>
                            </thead>

                            <tbody>
                                {orders.length > 0 ? (
                                    orders.map((item) => (
                                        <tr key={item.id}>
                                            <td className={cx('mono')}>
                                                {item.id}
                                            </td>
                                            <td>{item.fullName || '--'}</td>
                                            <td>{item.email || '--'}</td>
                                            <td>{item.plan}</td>
                                            <td>{item.amount}</td>
                                            <td>
                                                <span
                                                    className={cx(
                                                        'statusPill',
                                                        item.statusType,
                                                    )}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td>{item.createdAt || '--'}</td>
                                            <td>{item.paidAt || '--'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className={cx('emptyRow')}>
                                            Chưa có đơn hàng nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className={cx('pagination')}>
                        <button
                            type="button"
                            className={cx('pageBtn')}
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={page <= 1}
                        >
                            Trước
                        </button>

                        <span className={cx('pageInfo')}>
                            Trang {meta.page} / {meta.total_pages}
                        </span>

                        <button
                            type="button"
                            className={cx('pageBtn')}
                            onClick={() =>
                                setPage((prev) =>
                                    Math.min(prev + 1, meta.total_pages),
                                )
                            }
                            disabled={page >= meta.total_pages}
                        >
                            Sau
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ManageOrders;