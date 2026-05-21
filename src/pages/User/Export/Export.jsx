import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import {
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiDownload,
    FiRefreshCw,
    FiSearch,
} from 'react-icons/fi';
import { toast } from 'react-toastify';

import Button from '~/components/Button';
import {
    downloadExportFile,
    getExportHistory,
} from '~/services/export.service';
import styles from './Export.module.scss';

const cx = classNames.bind(styles);

const PAGE_SIZE = 8;

const SORT_OPTIONS = [
    {
        value: 'newest',
        label: 'Mới nhất',
        sort_by: 'createdAt',
        sort_order: 'DESC',
    },
    {
        value: 'oldest',
        label: 'Cũ nhất',
        sort_by: 'createdAt',
        sort_order: 'ASC',
    },
];

function getValidPage(value) {
    const page = Number(value);

    if (!Number.isInteger(page) || page < 1) {
        return 1;
    }

    return page;
}

function formatDateTime(value) {
    if (!value) return '';

    if (typeof value === 'string' && value.includes('/') && value.includes(':')) {
        return value;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function downloadBlob(blob, fileName) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName || 'cv-export.pdf';

    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
}

function normalizeExportItem(item = {}) {
    return {
        id: item.id || item._id,
        fileName:
            item.fileName ||
            item.file_name ||
            item.filename ||
            item.name ||
            item.cv_name ||
            'CV_export.pdf',
        fileSize:
            item.fileSize ||
            item.file_size ||
            item.size ||
            item.size_text ||
            '',
        fileType:
            item.fileType ||
            item.file_type ||
            item.type ||
            'PDF Document',
        exportedAt: formatDateTime(
            item.exportedAt ||
                item.exported_at ||
                item.createdAt ||
                item.created_at ||
                '',
        ),
    };
}

function getExportItems(result) {
    const rawData = result?.data;

    if (Array.isArray(rawData?.data)) {
        return rawData.data;
    }

    if (Array.isArray(rawData?.items)) {
        return rawData.items;
    }

    if (Array.isArray(rawData?.results)) {
        return rawData.results;
    }

    if (Array.isArray(rawData?.rows)) {
        return rawData.rows;
    }

    if (Array.isArray(rawData?.cv_exports)) {
        return rawData.cv_exports;
    }

    if (Array.isArray(rawData?.exports)) {
        return rawData.exports;
    }

    if (Array.isArray(rawData)) {
        return rawData;
    }

    return [];
}

function getTotalItems(result, fallback = 0) {
    const rawData = result?.data;

    const total =
        rawData?.meta?.total_items ||
        rawData?.meta?.totalItems ||
        rawData?.meta?.total ||
        rawData?.pagination?.total_items ||
        rawData?.pagination?.totalItems ||
        rawData?.pagination?.total ||
        rawData?.total_items ||
        rawData?.totalItems ||
        rawData?.total ||
        rawData?.count ||
        result?.meta?.total_items ||
        result?.meta?.totalItems ||
        result?.meta?.total ||
        result?.pagination?.total_items ||
        result?.pagination?.totalItems ||
        result?.pagination?.total ||
        result?.total_items ||
        result?.totalItems ||
        result?.total;

    return Number(total) || fallback;
}

function normalizeApiData(result) {
    const items = getExportItems(result);
    const total = getTotalItems(result, items.length);

    return {
        items: items.map(normalizeExportItem),
        total,
    };
}

function Export() {
    const sortRef = useRef(null);
    const didMountSearchRef = useRef(false);

    const [searchParams, setSearchParams] = useSearchParams();
    const pageFromUrl = getValidPage(searchParams.get('page'));

    const [exportList, setExportList] = useState([]);
    const [currentPage, setCurrentPage] = useState(pageFromUrl);
    const [totalItems, setTotalItems] = useState(0);
    const [searchValue, setSearchValue] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortType, setSortType] = useState('newest');
    const [showSortMenu, setShowSortMenu] = useState(false);
    const [loading, setLoading] = useState(false);
    const [downloadId, setDownloadId] = useState(null);
    const [error, setError] = useState('');

    const currentSort = useMemo(() => {
        return (
            SORT_OPTIONS.find((option) => option.value === sortType) ||
            SORT_OPTIONS[0]
        );
    }, [sortType]);

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    }, [totalItems]);

    const isSearching = loading && Boolean(debouncedSearch || searchValue.trim());

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(currentPage * PAGE_SIZE, totalItems);

    const updatePage = useCallback(
        (page, options = {}) => {
            const nextPage = getValidPage(page);

            setCurrentPage(nextPage);

            setSearchParams(
                (prevParams) => {
                    const nextParams = new URLSearchParams(prevParams);
                    nextParams.set('page', nextPage.toString());
                    return nextParams;
                },
                {
                    replace: Boolean(options.replace),
                },
            );
        },
        [setSearchParams],
    );

    useEffect(() => {
        if (!searchParams.get('page')) {
            updatePage(1, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (pageFromUrl !== currentPage) {
            setCurrentPage(pageFromUrl);
        }
    }, [pageFromUrl, currentPage]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchValue.trim());
        }, 400);

        return () => clearTimeout(timer);
    }, [searchValue]);

    useEffect(() => {
        if (!didMountSearchRef.current) {
            didMountSearchRef.current = true;
            return;
        }

        updatePage(1, { replace: true });
    }, [debouncedSearch, updatePage]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!sortRef.current) return;

            if (!sortRef.current.contains(event.target)) {
                setShowSortMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchExportHistory = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const result = await getExportHistory({
                limit: PAGE_SIZE,
                page: currentPage,
                search: debouncedSearch,
                sort_by: currentSort.sort_by,
                sort_order: currentSort.sort_order,
            });

            if (!result?.success) {
                throw new Error(
                    result?.message || 'Không thể tải lịch sử export',
                );
            }

            const normalized = normalizeApiData(result);

            setExportList(normalized.items);
            setTotalItems(normalized.total);
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Có lỗi xảy ra, vui lòng thử lại sau';

            setError(message);
            setExportList([]);
            setTotalItems(0);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, [
        currentPage,
        debouncedSearch,
        currentSort.sort_by,
        currentSort.sort_order,
    ]);

    useEffect(() => {
        fetchExportHistory();
    }, [fetchExportHistory]);

    useEffect(() => {
        if (currentPage > totalPages) {
            updatePage(totalPages, { replace: true });
        }
    }, [currentPage, totalPages, updatePage]);

    const handleDownload = useCallback(async (item) => {
        if (!item?.id) {
            toast.error('Không tìm thấy ID file export');
            return;
        }

        setDownloadId(item.id);

        try {
            const res = await downloadExportFile(item.id);

            if (!res || res.success === false) {
                throw new Error(res?.message || 'Không thể tải file');
            }

            const blob = res?.data instanceof Blob ? res.data : res;

            if (!(blob instanceof Blob)) {
                throw new Error('Dữ liệu tải xuống không hợp lệ');
            }

            if (blob.size === 0) {
                throw new Error('File tải xuống rỗng');
            }

            downloadBlob(blob, item.fileName);

            toast.success(`Đã tải xuống: ${item.fileName}`);
        } catch (err) {
            toast.error(
                err?.message || 'Không thể tải file, vui lòng thử lại sau',
            );
        } finally {
            setDownloadId(null);
        }
    }, []);

    const handleSelectSort = useCallback(
        (value) => {
            setSortType(value);
            updatePage(1, { replace: true });
            setShowSortMenu(false);
        },
        [updatePage],
    );

    const handlePrevPage = useCallback(() => {
        if (currentPage === 1) return;
        updatePage(currentPage - 1);
    }, [currentPage, updatePage]);

    const handleNextPage = useCallback(() => {
        if (currentPage === totalPages) return;
        updatePage(currentPage + 1);
    }, [currentPage, totalPages, updatePage]);

    const renderPageNumbers = () => {
        const pages = [];

        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i += 1) {
                pages.push(i);
            }
        } else if (currentPage <= 3) {
            pages.push(1, 2, 3, '...', totalPages);
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
        } else {
            pages.push(1, '...', currentPage, '...', totalPages);
        }

        return pages.map((page, index) => {
            if (page === '...') {
                return (
                    <span key={`dots-${index}`} className={cx('dots')}>
                        ...
                    </span>
                );
            }

            return (
                <Button
                    key={page}
                    type="button"
                    className={cx('pageBtn', {
                        active: currentPage === page,
                    })}
                    onClick={() => updatePage(page)}
                    disabled={loading}
                >
                    {page}
                </Button>
            );
        });
    };

    return (
        <div className={cx('wrapper')}>
            <h1 className={cx('title')}>Lịch sử export</h1>

            <div className={cx('toolbar')}>
                <div className={cx('searchBox')}>
                    {isSearching ? (
                        <FiRefreshCw className={cx('searchIcon', 'spin')} />
                    ) : (
                        <FiSearch className={cx('searchIcon')} />
                    )}

                    <input
                        value={searchValue}
                        onChange={(event) => setSearchValue(event.target.value)}
                        placeholder="Tìm kiếm lịch sử export..."
                    />
                </div>

                <div className={cx('toolbarSpace')} />

                <div className={cx('sortWrap')} ref={sortRef}>
                    <button
                        type="button"
                        className={cx('sortBtn')}
                        onClick={() => setShowSortMenu((prev) => !prev)}
                        disabled={loading}
                    >
                        <span>Sắp xếp:</span>
                        <strong>{currentSort.label}</strong>
                        <FiChevronDown
                            className={cx('sortIcon', {
                                rotate: showSortMenu,
                            })}
                        />
                    </button>

                    {showSortMenu && (
                        <div className={cx('sortMenu')}>
                            {SORT_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={cx('sortItem', {
                                        active: sortType === option.value,
                                    })}
                                    onClick={() =>
                                        handleSelectSort(option.value)
                                    }
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <section className={cx('card')}>
                <div className={cx('tableWrap')}>
                    <table className={cx('table')}>
                        <thead>
                            <tr>
                                <th>TÊN FILE</th>
                                <th>THỜI GIAN XUẤT</th>
                                <th>HÀNH ĐỘNG</th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                Array.from({ length: PAGE_SIZE }).map(
                                    (_, index) => (
                                        <tr key={`skeleton-${index}`}>
                                            <td>
                                                <div className={cx('fileInfo')}>
                                                    <div
                                                        className={cx(
                                                            'fileIcon',
                                                            'skeleton',
                                                        )}
                                                    />

                                                    <div
                                                        className={cx(
                                                            'fileMeta',
                                                        )}
                                                    >
                                                        <div
                                                            className={cx(
                                                                'skeletonLine',
                                                                'nameLine',
                                                            )}
                                                        />
                                                        <div
                                                            className={cx(
                                                                'skeletonLine',
                                                                'subLine',
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            <td>
                                                <div
                                                    className={cx(
                                                        'skeletonLine',
                                                        'timeLine',
                                                    )}
                                                />
                                            </td>

                                            <td>
                                                <div
                                                    className={cx(
                                                        'skeletonLine',
                                                        'actionLine',
                                                    )}
                                                />
                                            </td>
                                        </tr>
                                    ),
                                )
                            ) : error ? (
                                <tr>
                                    <td colSpan={3} className={cx('empty')}>
                                        <div className={cx('errorBox')}>
                                            <p>{error}</p>

                                            <button
                                                type="button"
                                                className={cx('retryBtn')}
                                                onClick={fetchExportHistory}
                                            >
                                                <FiRefreshCw />
                                                Tải lại
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : exportList.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className={cx('empty')}>
                                        Không tìm thấy file export nào
                                    </td>
                                </tr>
                            ) : (
                                exportList.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className={cx('fileInfo')}>
                                                <div className={cx('fileIcon')}>
                                                    <span>PDF</span>
                                                </div>

                                                <div className={cx('fileMeta')}>
                                                    <h3
                                                        className={cx(
                                                            'fileName',
                                                        )}
                                                    >
                                                        {item.fileName}
                                                    </h3>

                                                    <p
                                                        className={cx(
                                                            'fileSub',
                                                        )}
                                                    >
                                                        {item.fileSize}
                                                        {item.fileSize &&
                                                            item.fileType &&
                                                            ' • '}
                                                        {item.fileType}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className={cx('time')}>
                                            {item.exportedAt}
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className={cx('downloadBtn')}
                                                onClick={() =>
                                                    handleDownload(item)
                                                }
                                                disabled={
                                                    downloadId === item.id
                                                }
                                                aria-label="Tải xuống file"
                                            >
                                                {downloadId === item.id ? (
                                                    <FiRefreshCw
                                                        className={cx('spin')}
                                                    />
                                                ) : (
                                                    <FiDownload />
                                                )}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={cx('footer')}>
                    <p className={cx('note')}>
                        Hiển thị {startItem} - {endItem} trong số{' '}
                        <strong>{totalItems}</strong> file đã xuất
                    </p>

                    <div className={cx('pagination')}>
                        <Button
                            type="button"
                            className={cx('pageBtn', 'navBtn')}
                            onClick={handlePrevPage}
                            disabled={currentPage === 1 || loading}
                        >
                            <FiChevronLeft />
                        </Button>

                        {renderPageNumbers()}

                        <Button
                            type="button"
                            className={cx('pageBtn', 'navBtn')}
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages || loading}
                        >
                            <FiChevronRight />
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Export;