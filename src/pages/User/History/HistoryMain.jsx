import { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames/bind';

import GenericAdminToolbar from '~/components/GenericAdminToolbar';
import Pagination from '~/components/Pagination';
import { getMyPayments } from '~/services/history.service';

import HistoryRow from './components/HistoryRow';
import styles from './HistoryMain.module.scss';

const cx = classNames.bind(styles);

const PAGE_SIZE = 8;

const PaymentSortBy = {
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    AMOUNT: 'amount_cents',
    STATUS: 'status',
};

const SortOrder = {
    ASC: 'ASC',
    DESC: 'DESC',
};

const SORT_OPTIONS = [
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
        label: 'Giao dịch mới nhất',
        sort_by: PaymentSortBy.CREATED_AT,
        sort_order: SortOrder.DESC,
    },
    {
        label: 'Giao dịch cũ nhất',
        sort_by: PaymentSortBy.CREATED_AT,
        sort_order: SortOrder.ASC,
    },
    {
        label: 'Giá cao nhất',
        sort_by: PaymentSortBy.AMOUNT,
        sort_order: SortOrder.DESC,
    },
    {
        label: 'Giá thấp nhất',
        sort_by: PaymentSortBy.AMOUNT,
        sort_order: SortOrder.ASC,
    },
    {
        label: 'Trạng thái: A → Z',
        sort_by: PaymentSortBy.STATUS,
        sort_order: SortOrder.ASC,
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
    sort_by: PaymentSortBy.UPDATED_AT,
    sort_order: SortOrder.DESC,
    range: '30d',
    from: '',
    to: '',
};

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

function normalizeToolbarFilters({ search, sort, range }) {
    const nextFilters = {
        search: search || '',
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

function HistoryMain() {
    const [page, setPage] = useState(getPageFromUrl);
    const [payments, setPayments] = useState([]);
    const [meta, setMeta] = useState(DEFAULT_META);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState(DEFAULT_FILTERS);

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

        const fetchPayments = async () => {
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

                const result = await getMyPayments(payload);

                if (ignore) return;

                if (result?.status >= 400 || result?.success === false) {
                    setPayments([]);
                    setMeta(DEFAULT_META);
                    return;
                }

                const paymentData = Array.isArray(result?.data?.data)
                    ? result.data.data
                    : [];
                const paymentMeta = result?.data?.meta || DEFAULT_META;

                setPayments(paymentData);
                setMeta(paymentMeta);
            } catch (error) {
                if (!ignore) {
                    console.error('Fetch payment history failed:', error);
                    setPayments([]);
                    setMeta(DEFAULT_META);
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchPayments();

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
    const totalItems = Number(meta?.total_items) || payments.length;
    const limit = Number(meta?.limit) || PAGE_SIZE;
    const startItem = totalItems ? (page - 1) * limit + 1 : 0;
    const endItem = totalItems ? Math.min(page * limit, totalItems) : 0;

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

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header-section')}>
                <div className={cx('title')}>
                    <h3>Lịch sử giao dịch</h3>
                    <p>Theo dõi danh sách giao dịch và trạng thái thanh toán.</p>
                </div>
            </div>

            <div className={cx('toolbar')}>
                <GenericAdminToolbar
                    sortOptions={SORT_OPTIONS}
                    rangeOptions={RANGE_OPTIONS}
                    defaultSortBy={DEFAULT_FILTERS.sort_by}
                    defaultSortOrder={DEFAULT_FILTERS.sort_order}
                    defaultRange={DEFAULT_FILTERS.range}
                    onChange={handleToolbarChange}
                    searchPlaceholder="Tìm kiếm theo mã đơn, tên hoặc email..."
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
                                <th>Số tiền</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                            </tr>
                        </thead>

                        <tbody>
                            {payments.map((payment) => (
                                <HistoryRow
                                    key={payment.id}
                                    payment={payment}
                                />
                            ))}

                            {!loading && !payments.length ? (
                                <tr>
                                    <td colSpan="6" className={cx('emptyCell')}>
                                        Chưa có giao dịch nào.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>

                    {loading ? (
                        <div className={cx('loadingOverlay')}>
                            <span className={cx('loader')} />
                            <span>Đang tải lịch sử giao dịch...</span>
                        </div>
                    ) : null}
                </div>

                <div className={cx('tableFooter')}>
                    <p>
                        Hiển thị {startItem} đến {endItem} trong số {totalItems} giao dịch
                    </p>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        disabled={loading}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
}

export default HistoryMain;