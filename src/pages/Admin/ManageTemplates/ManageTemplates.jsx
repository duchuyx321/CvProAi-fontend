import { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames/bind';

import { IoMdAdd } from 'react-icons/io';
import { Eye, Pencil, Trash2 } from 'lucide-react';

import Button from '~/components/Button';
import Pagination from '~/components/Pagination';
import { getAllTemplate } from '~/services/admin-template.service';

import styles from './ManageTemplates.module.scss';
import { useNavigate } from 'react-router-dom';
import { config } from '~/config';
import GenericAdminToolbar from '~/components/GenericAdminToolbar';

const cx = classNames.bind(styles);
const PAGE_SIZE = 8;

const TemplateSortBy = {
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    NAME: 'name',
};

const SortOrder = {
    ASC: 'ASC',
    DESC: 'DESC',
};

const SORT_OPTIONS = [
    {
        label: 'Cập nhật mới nhất',
        sort_by: TemplateSortBy.UPDATED_AT,
        sort_order: SortOrder.DESC,
    },
    {
        label: 'Cập nhật cũ nhất',
        sort_by: TemplateSortBy.UPDATED_AT,
        sort_order: SortOrder.ASC,
    },
    {
        label: 'Tạo mới nhất',
        sort_by: TemplateSortBy.CREATED_AT,
        sort_order: SortOrder.DESC,
    },
    {
        label: 'Tên: A → Z',
        sort_by: TemplateSortBy.NAME,
        sort_order: SortOrder.ASC,
    },
    {
        label: 'Tên: Z → A',
        sort_by: TemplateSortBy.NAME,
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

function formatDate(value) {
    if (!value) return '--';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '--';

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

function formatNumber(value) {
    return new Intl.NumberFormat('vi-VN').format(Number(value) || 0);
}

function getTemplateDisplayId({ index, page, limit }) {
    return `#CV-${String((page - 1) * limit + index + 1).padStart(3, '0')}`;
}

function ManageTemplates() {
    const [page, setPage] = useState(getPageFromUrl);
    const [templates, setTemplates] = useState([]);
    const [meta, setMeta] = useState(DEFAULT_META);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        search: '',
        sort_by: TemplateSortBy.UPDATED_AT,
        sort_order: SortOrder.DESC,
        range: '30d',
        from: '',
        to: '',
    });
    const navigate = useNavigate();
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

        const fetchTemplates = async () => {
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

                const result = await getAllTemplate(payload);

                if (ignore) return;

                setTemplates(Array.isArray(result?.data) ? result.data : []);
                setMeta(result?.meta || DEFAULT_META);
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        fetchTemplates();

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
    const totalItems = Number(meta?.total_items) || templates.length;
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
                sort_by: sort?.sort_by || TemplateSortBy.UPDATED_AT,
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

    return (
        <div className={cx('wrapper')}>
            <header>
                <div className={cx('title')}>
                    <h3>Quản lý mẫu CV</h3>
                    <p>
                        Quản lý và cập nhật danh sách các mẫu CV cho hệ thống
                        AI.
                    </p>
                </div>
                <div className={cx('action')}>
                    <Button
                        primary
                        leftIcon={<IoMdAdd aria-label="Thêm mẫu CV" />}
                    >
                        Thêm mẫu CV
                    </Button>
                </div>
            </header>

            <div className={cx('toolbar')}>
                <GenericAdminToolbar
                    sortOptions={SORT_OPTIONS}
                    rangeOptions={RANGE_OPTIONS}
                    defaultSortBy={TemplateSortBy.UPDATED_AT}
                    defaultSortOrder={SortOrder.DESC}
                    defaultRange={'30d'}
                    onChange={handleToolbarChange}
                    searchPlaceholder="Tìm theo tên..."
                    searchLoading={loading && Boolean(filters.search)}
                />
            </div>

            <div className={cx('tableCard')}>
                <div className={cx('tableScroll')}>
                    <table className={cx('table')}>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên mẫu CV</th>
                                <th>Lượt dùng</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {templates.map((template, index) => (
                                <tr key={template.id || template.code}>
                                    <td className={cx('idCell')}>
                                        {getTemplateDisplayId({
                                            index,
                                            page,
                                            limit,
                                        })}
                                    </td>
                                    <td>
                                        <div className={cx('templateInfo')}>
                                            <img
                                                src={template.preview_url}
                                                alt={template.name}
                                                className={cx('preview')}
                                            />
                                            <span
                                                className={cx('templateName')}
                                            >
                                                {template.name}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={cx('numberCell')}>
                                        {formatNumber(template.used_count)}
                                    </td>
                                    <td>
                                        <span
                                            className={cx('statusBadge', {
                                                active: template.is_active,
                                                inactive: !template.is_active,
                                            })}
                                        >
                                            {template.is_active
                                                ? 'Hoạt động'
                                                : 'Tạm ngưng'}
                                        </span>
                                    </td>
                                    <td className={cx('dateCell')}>
                                        {formatDate(template.createdAt)}
                                    </td>
                                    <td>
                                        <div className={cx('actions')}>
                                            <button
                                                type="button"
                                                className={cx('iconButton')}
                                                aria-label={`Xem ${template.name}`}
                                                onClick={() =>
                                                    navigate(
                                                        config.router.previewTemplate.replace(
                                                            ':code',
                                                            template.code,
                                                        ),
                                                    )
                                                }
                                                title="Xem"
                                            >
                                                <Eye />
                                            </button>
                                            <button
                                                type="button"
                                                className={cx('iconButton')}
                                                aria-label={`Sửa ${template.name}`}
                                                title="Sửa"
                                            >
                                                <Pencil />
                                            </button>
                                            <button
                                                type="button"
                                                className={cx(
                                                    'iconButton',
                                                    'dangerButton',
                                                )}
                                                aria-label={`Xóa ${template.name}`}
                                                title="Xóa"
                                            >
                                                <Trash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {!loading && !templates.length ? (
                                <tr>
                                    <td className={cx('emptyCell')} colSpan="6">
                                        Chưa có mẫu CV nào.
                                    </td>
                                </tr>
                            ) : null}
                        </tbody>
                    </table>

                    {loading ? (
                        <div className={cx('loadingOverlay')}>
                            <span className={cx('loader')} />
                            <span>Đang tải danh sách mẫu CV...</span>
                        </div>
                    ) : null}
                </div>

                <div className={cx('tableFooter')}>
                    <p>
                        Hiển thị {startItem} - {endItem} của {totalItems} mẫu CV
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

export default ManageTemplates;
