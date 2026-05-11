import { useCallback, useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import GenericAdminToolbar from '~/components/GenericAdminToolbar';
import Pagination from '~/components/Pagination';

import AnalysisHistoryRow from './components/AnalysisHistoryRow';
import styles from './CvAnalysisHistory.module.scss';

const cx = classNames.bind(styles);

const PAGE_SIZE = 8;

const AnalysisSortBy = {
    CREATED_AT: 'createdAt',
    SCORE: 'score',
    FILE_NAME: 'file_name',
};

const SortOrder = {
    ASC: 'ASC',
    DESC: 'DESC',
};

const SORT_OPTIONS = [
    {
        label: 'Phân tích mới nhất',
        sort_by: AnalysisSortBy.CREATED_AT,
        sort_order: SortOrder.DESC,
    },
    {
        label: 'Phân tích cũ nhất',
        sort_by: AnalysisSortBy.CREATED_AT,
        sort_order: SortOrder.ASC,
    },
    {
        label: 'Điểm cao nhất',
        sort_by: AnalysisSortBy.SCORE,
        sort_order: SortOrder.DESC,
    },
    {
        label: 'Điểm thấp nhất',
        sort_by: AnalysisSortBy.SCORE,
        sort_order: SortOrder.ASC,
    },
    {
        label: 'Tên CV: A → Z',
        sort_by: AnalysisSortBy.FILE_NAME,
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
    sort_by: AnalysisSortBy.CREATED_AT,
    sort_order: SortOrder.DESC,
    range: '30d',
    from: '',
    to: '',
};

const MOCK_ANALYSIS_HISTORY = [
    {
        id: '1',
        file_name: 'Senior_UX_Designer_2024.pdf',
        position: 'UX/UI Designer',
        score: 85,
        status: 'COMPLETED',
        createdAt: '2024-10-24T14:30:00.000Z',
    },
    {
        id: '2',
        file_name: 'Frontend_Dev_NguyenVanA.pdf',
        position: 'Frontend Engineer',
        score: 62,
        status: 'COMPLETED',
        createdAt: '2024-10-24T10:15:00.000Z',
    },
    {
        id: '3',
        file_name: 'Marketing_Manager_CV.pdf',
        position: 'Marketing Manager',
        score: 35,
        status: 'COMPLETED',
        createdAt: '2024-10-23T16:45:00.000Z',
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

function isInRange(item, filters) {
    if (filters.range !== 'custom') return true;

    const createdDate = new Date(item.createdAt);
    const fromDate = filters.from ? new Date(filters.from) : null;
    const toDate = filters.to ? new Date(filters.to) : null;

    if (Number.isNaN(createdDate.getTime())) return false;
    if (fromDate && createdDate < fromDate) return false;

    if (toDate) {
        const endOfToDate = new Date(toDate);
        endOfToDate.setHours(23, 59, 59, 999);

        if (createdDate > endOfToDate) return false;
    }

    return true;
}

function sortItems(items, filters) {
    const sortedItems = [...items];

    sortedItems.sort((a, b) => {
        let firstValue = a[filters.sort_by];
        let secondValue = b[filters.sort_by];

        if (filters.sort_by === AnalysisSortBy.CREATED_AT) {
            firstValue = new Date(a.createdAt).getTime();
            secondValue = new Date(b.createdAt).getTime();
        }

        if (typeof firstValue === 'string') {
            firstValue = firstValue.toLowerCase();
        }

        if (typeof secondValue === 'string') {
            secondValue = secondValue.toLowerCase();
        }

        if (firstValue < secondValue) {
            return filters.sort_order === SortOrder.ASC ? -1 : 1;
        }

        if (firstValue > secondValue) {
            return filters.sort_order === SortOrder.ASC ? 1 : -1;
        }

        return 0;
    });

    return sortedItems;
}

function getFilteredItems(filters) {
    const keyword = filters.search.trim().toLowerCase();

    const filteredItems = MOCK_ANALYSIS_HISTORY.filter((item) => {
        const searchableText = [
            item.file_name,
            item.position,
            item.status,
            String(item.score),
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        const isMatchSearch = !keyword || searchableText.includes(keyword);
        const isMatchRange = isInRange(item, filters);

        return isMatchSearch && isMatchRange;
    });

    return sortItems(filteredItems, filters);
}

function CvAnalysisHistory() {
    const navigate = useNavigate();
    const [page, setPage] = useState(getPageFromUrl);
    const [histories, setHistories] = useState([]);
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

        const fetchHistories = async () => {
            try {
                setLoading(true);

                // TODO: Khi có API thì thay block mock này bằng service call.
                const allItems = getFilteredItems(filters);
                const totalItems = allItems.length;
                const totalPages = Math.max(Math.ceil(totalItems / PAGE_SIZE), 1);
                const startIndex = (page - 1) * PAGE_SIZE;
                const endIndex = startIndex + PAGE_SIZE;
                const pagedItems = allItems.slice(startIndex, endIndex);

                if (ignore) return;

                setHistories(pagedItems);
                setMeta({
                    page,
                    limit: PAGE_SIZE,
                    total_items: totalItems,
                    total_pages: totalPages,
                });
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchHistories();

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
    const totalItems = Number(meta?.total_items) || histories.length;
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

    const handleViewDetail = (item) => {
        console.log('View analysis detail:', item);
        navigate(config)
    };

    return (
        <div className={cx('wrapper')}>
            <header>
                <div className={cx('title')}>
                    <h3>Lịch sử phân tích CV</h3>
                    <p>Theo dõi và đánh giá chi tiết lịch sử phân tích CV bằng AI.</p>
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
                    searchPlaceholder="Tìm kiếm theo tên CV..."
                    searchLoading={loading && Boolean(filters.search)}
                />
            </div>

            <div className={cx('tableCard')}>
                <div className={cx('tableScroll')}>
                    <table className={cx('table')}>
                        <thead>
                            <tr>
                                <th>Tên CV</th>
                                <th>Ngày phân tích</th>
                                <th>Điểm matching</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>

                        <tbody>
                            {histories.map((item) => (
                                <AnalysisHistoryRow
                                    key={item.id}
                                    item={item}
                                    onViewDetail={handleViewDetail}
                                />
                            ))}

                            {!loading && !histories.length ? (
                                <tr>
                                    <td colSpan="5" className={cx('emptyCell')}>
                                        Chưa có lịch sử phân tích CV nào.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>

                    {loading ? (
                        <div className={cx('loadingOverlay')}>
                            <span className={cx('loader')} />
                            <span>Đang tải lịch sử phân tích CV...</span>
                        </div>
                    ) : null}
                </div>

                <div className={cx('tableFooter')}>
                    <p>
                        Hiển thị {startItem} đến {endItem} trong số {totalItems} kết quả
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

export default CvAnalysisHistory;