import { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';

import { config } from '~/config';
import GenericAdminToolbar from '~/components/GenericAdminToolbar';
import Pagination from '~/components/Pagination';
import { getAnalysisHistory } from '~/services/analysis-history.service';

import AnalysisHistoryRow from './components/AnalysisHistoryRow';
import styles from './CvAnalysisHistory.module.scss';

const cx = classNames.bind(styles);

const PAGE_SIZE = 8;

const AnalysisSortBy = {
    CREATED_AT: 'createdAt',
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

function CvAnalysisHistory() {
    const navigate = useNavigate();

    const [histories, setHistories] = useState([]);
    const [page, setPage] = useState(getPageFromUrl);
    const [meta, setMeta] = useState(DEFAULT_META);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        sort_by: AnalysisSortBy.CREATED_AT,
        sort_order: SortOrder.DESC,
        range: '30d',
        from: '',
        to: '',
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

        const fetchHistories = async () => {
            try {
                setLoading(true);

                const payload = {
                    page,
                    limit: PAGE_SIZE,
                    sort_by: filters.sort_by,
                    sort_order: filters.sort_order,
                    search: filters.search,
                };

                if (filters.range === 'custom') {
                    payload.from = filters.from;
                    payload.to = filters.to;
                } else {
                    payload.range = filters.range;
                }

                const result = await getAnalysisHistory(payload);

                if (ignore) return;

                if (result?.status >= 400 || result?.success === false) {
                    setHistories([]);
                    setMeta(DEFAULT_META);
                    return;
                }

                setHistories(Array.isArray(result?.data) ? result.data : []);
                setMeta(result?.meta || DEFAULT_META);
            } catch (error) {
                if (!ignore) {
                    console.error('Fetch analysis history failed:', error);
                    setHistories([]);
                    setMeta(DEFAULT_META);
                }
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
            const nextFilters = {
                search: search || '',
                sort_by: sort?.sort_by || AnalysisSortBy.CREATED_AT,
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

    const handleViewDetail = (item) => {
        navigate(config.router.aiAnalysisResult.replace(':aiRunId', item.id));
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
                    defaultSortBy={AnalysisSortBy.CREATED_AT}
                    defaultSortOrder={SortOrder.DESC}
                    defaultRange="30d"
                    onChange={handleToolbarChange}
                    searchPlaceholder="Tìm kiếm theo tên CV hoặc vị trí..."
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