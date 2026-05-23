import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import {
    FiAlertCircle,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiLoader,
    FiPlusCircle,
    FiSearch,
    FiTrash2,
} from 'react-icons/fi';
import { LuFileText } from 'react-icons/lu';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Button from '~/components/Button';
import Modal from '~/components/Modal';
import { config } from '~/config';
import useDebounce from '~/hooks/useDebounce';
import { getMyCvs, softDeleteMyCv } from '~/services/my-cv.service';
import CardItemCV from './components/CardItemCV';
import styles from './MyCvs.module.scss';

const cx = classNames.bind(styles);

const PAGE_SIZE = 4;

const SORT_OPTIONS = ['Mới nhất', 'Cũ nhất', 'Sửa gần đây', 'A -> Z', 'Z -> A'];

const getValidPage = (value) => {
    const page = Number(value);

    if (!Number.isInteger(page) || page < 1) {
        return 1;
    }

    return page;
};

const getSortParam = (value) => {
    if (value === 'Cũ nhất') {
        return {
            sort_by: 'created_at',
            sort_order: 'ASC',
        };
    }

    if (value === 'Sửa gần đây') {
        return {
            sort_by: 'updated_at',
            sort_order: 'DESC',
        };
    }

    if (value === 'A -> Z') {
        return {
            sort_by: 'title',
            sort_order: 'ASC',
        };
    }

    if (value === 'Z -> A') {
        return {
            sort_by: 'title',
            sort_order: 'DESC',
        };
    }

    return {
        sort_by: 'updated_at',
        sort_order: 'DESC',
    };
};

const formatDateTime = (value) => {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const getCvItems = (res) => {
    if (Array.isArray(res?.data?.data)) {
        return res.data.data;
    }

    if (Array.isArray(res?.data)) {
        return res.data;
    }

    return [];
};

const getTotalItems = (res, fallback = 0) => {
    const total =
        res?.data?.meta?.total_items ||
        res?.data?.meta?.totalItems ||
        res?.data?.meta?.total ||
        res?.meta?.total_items ||
        res?.meta?.totalItems ||
        res?.meta?.total ||
        res?.pagination?.total ||
        res?.pagination?.totalItems ||
        res?.pagination?.total_items ||
        res?.total ||
        res?.totalItems ||
        res?.total_items;

    return Number(total) || fallback;
};

const mapCvItem = (cv) => ({
    id: cv.id,
    name: cv.title,
    updatedAt: formatDateTime(cv.updatedAt || cv.createdAt),
    status: cv.status === 'DRAFT' ? 'BẢN NHÁP' : 'HOÀN THIỆN',
    statusCode: cv.status === 'DRAFT' ? 'draft' : 'done',
    image:
        cv.preview_url ||
        'https://via.placeholder.com/400x520/334155/ffffff?text=CV',
    slug: cv.slug,
});

function MyCvs() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const pageFromUrl = getValidPage(searchParams.get('page'));

    const [keyword, setKeyword] = useState('');
    const debouncedKeyword = useDebounce(keyword, 500);

    const [currentPage, setCurrentPage] = useState(pageFromUrl);
    const [sortValue, setSortValue] = useState('Mới nhất');
    const [isOpenSort, setIsOpenSort] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);

    const [cvList, setCvList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [firstLoading, setFirstLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [isConfirm, setIsConfirm] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const sortRef = useRef(null);
    const didMountSearchRef = useRef(false);

    const updatePage = (page, options = {}) => {
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
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setIsOpenSort(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

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

    const fetchMyCvs = async ({
        page = currentPage,
        keywordValue = debouncedKeyword,
        sort = sortValue,
        silent = false,
    } = {}) => {
        const isSearching = keywordValue.trim().length > 0;
        const sortParams = getSortParam(sort);

        try {
            setErrorMessage('');

            if (isSearching) {
                setSearching(true);
            } else {
                setLoading(true);
            }

            const res = await getMyCvs({
                page,
                limit: PAGE_SIZE,
                search: keywordValue.trim(),
                sort_by: sortParams.sort_by,
                sort_order: sortParams.sort_order,
            });

            if (!res?.success) {
                const message =
                    res?.message ||
                    res?.messsage ||
                    'Không tải được danh sách CV';

                setCvList([]);
                setTotalItems(0);
                setErrorMessage(message);

                if (!silent) {
                    toast.error(message);
                }

                return;
            }

            const rawItems = getCvItems(res);
            const total = getTotalItems(res, rawItems.length);

            setCvList(rawItems.map(mapCvItem));
            setTotalItems(total);
            setErrorMessage('');
        } catch {
            setCvList([]);
            setTotalItems(0);
            setErrorMessage('Có lỗi xảy ra khi tải danh sách CV');

            if (!silent) {
                toast.error('Có lỗi xảy ra khi tải danh sách CV');
            }
        } finally {
            setLoading(false);
            setFirstLoading(false);

            setTimeout(() => {
                setSearching(false);
            }, 400);
        }
    };

    useEffect(() => {
        if (!didMountSearchRef.current) {
            didMountSearchRef.current = true;
            return;
        }

        updatePage(1, { replace: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedKeyword]);

    useEffect(() => {
        fetchMyCvs({
            page: currentPage,
            keywordValue: debouncedKeyword,
            sort: sortValue,
            silent: debouncedKeyword.trim().length > 0,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, sortValue, debouncedKeyword]);

    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const currentList = cvList;

    useEffect(() => {
        if (currentPage > totalPages) {
            updatePage(totalPages, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, totalPages]);

    const isEmpty = !loading && !errorMessage && currentList.length === 0;
    const isSearchingEmpty = isEmpty && debouncedKeyword.trim().length > 0;
    const isDefaultEmpty = isEmpty && !debouncedKeyword.trim();

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(currentPage * PAGE_SIZE, totalItems);

    const handleSearch = (event) => {
        setKeyword(event.target.value);
    };

    const handleClearSearch = () => {
        setKeyword('');
    };

    const handleCreateCv = () => {
        navigate(config.router.cvTemplates);
    };

    const handleAskDelete = (cv) => {
        setDeleteItem(cv);
    };

    const handleConfirmDelete = async () => {
        if (!deleteItem || isConfirm) return;

        setIsConfirm(true);

        try {
            const res = await softDeleteMyCv(deleteItem.id);

            if (!res?.success) {
                toast.error(res?.message || res?.messsage || 'Xóa CV thất bại');
                return;
            }

            toast.success(`Đã chuyển "${deleteItem.name}" vào thùng rác`);
            setDeleteItem(null);

            const nextPage =
                currentList.length === 1 && currentPage > 1
                    ? currentPage - 1
                    : currentPage;

            if (nextPage !== currentPage) {
                updatePage(nextPage, { replace: true });
            } else {
                await fetchMyCvs({
                    page: nextPage,
                    keywordValue: debouncedKeyword,
                    sort: sortValue,
                    silent: true,
                });
            }
        } catch {
            toast.error('Có lỗi xảy ra khi xóa CV');
        } finally {
            setIsConfirm(false);
        }
    };

    const handleOpenTrash = () => {
        navigate(config.router.trashCvs);
    };

    const handlePrevPage = () => {
        if (currentPage === 1) return;
        updatePage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage === totalPages) return;
        updatePage(currentPage + 1);
    };

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
                <button
                    key={page}
                    type="button"
                    className={cx('pageBtn', {
                        active: currentPage === page,
                    })}
                    onClick={() => updatePage(page)}
                    disabled={loading}
                >
                    {page}
                </button>
            );
        });
    };

    const deleteFooter = (
        <div className={cx('modalActions')}>
            <Button
                type="button"
                className={cx('modalCancelBtn')}
                onClick={() => {
                    if (!isConfirm) {
                        setDeleteItem(null);
                    }
                }}
                disabled={isConfirm}
            >
                Hủy
            </Button>

            <Button
                primary
                type="button"
                disabled={isConfirm}
                className={cx('modalDeleteBtn')}
                onClick={handleConfirmDelete}
            >
                {isConfirm ? 'Đang xóa...' : 'Xóa CV'}
            </Button>
        </div>
    );

    if (firstLoading && loading) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('loading')}>Đang tải danh sách CV...</div>
            </div>
        );
    }

    return (
        <>
            <div className={cx('wrapper')}>
                <div className={cx('header')}>
                    <h1 className={cx('title')}>CV của tôi</h1>
                    <p className={cx('desc')}>
                        Quản lý và tối ưu hóa các bản CV chuyên nghiệp của bạn
                        <br />
                        để gây ấn tượng với nhà tuyển dụng.
                    </p>
                </div>

                <div className={cx('toolbar')}>
                    <div className={cx('searchWrap')}>
                        {searching ? (
                            <FiLoader className={cx('searchSpinner')} />
                        ) : (
                            <FiSearch className={cx('searchIcon')} />
                        )}

                        <input
                            type="text"
                            placeholder="Tìm kiếm CV..."
                            className={cx('searchInput')}
                            value={keyword}
                            onChange={handleSearch}
                        />
                    </div>

                    <div className={cx('sortDropdown')} ref={sortRef}>
                        <button
                            type="button"
                            className={cx('sortWrap')}
                            onClick={() => setIsOpenSort((prev) => !prev)}
                        >
                            <span className={cx('sortLabel')}>Sắp xếp:</span>
                            <span className={cx('sortValue')}>{sortValue}</span>
                            <FiChevronDown
                                className={cx('sortArrow', {
                                    open: isOpenSort,
                                })}
                            />
                        </button>

                        {isOpenSort && (
                            <div className={cx('sortMenu')}>
                                {SORT_OPTIONS.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        className={cx('sortOption', {
                                            active: sortValue === item,
                                        })}
                                        onClick={() => {
                                            setSortValue(item);
                                            updatePage(1, { replace: true });
                                            setIsOpenSort(false);
                                        }}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        className={cx('trashBtn')}
                        onClick={handleOpenTrash}
                    >
                        <FiTrash2 />
                        <span>Thùng rác</span>
                    </button>

                    <Button
                        primary
                        type="button"
                        className={cx('createBtn')}
                        onClick={handleCreateCv}
                    >
                        <FiPlusCircle />
                        <span>Tạo CV mới</span>
                    </Button>
                </div>

                {errorMessage ? (
                    <div className={cx('stateCard')}>
                        <div className={cx('stateIcon', 'errorStateIcon')}>
                            <FiAlertCircle />
                        </div>

                        <h3 className={cx('stateTitle')}>
                            Không thể tải dữ liệu
                        </h3>

                        <p className={cx('stateText')}>{errorMessage}</p>

                        <Button
                            type="button"
                            className={cx('stateBtn')}
                            onClick={() =>
                                fetchMyCvs({
                                    page: currentPage,
                                    keywordValue: debouncedKeyword,
                                    sort: sortValue,
                                })
                            }
                        >
                            Thử lại
                        </Button>
                    </div>
                ) : isSearchingEmpty ? (
                    <div className={cx('stateCard')}>
                        <div className={cx('stateIcon')}>
                            <FiSearch />
                        </div>

                        <h3 className={cx('stateTitle')}>
                            Không tìm thấy CV phù hợp
                        </h3>

                        <p className={cx('stateText')}>
                            Không có kết quả nào khớp với từ khóa "
                            {debouncedKeyword}".
                        </p>

                        <Button
                            type="button"
                            className={cx('stateBtn')}
                            onClick={handleClearSearch}
                        >
                            Xóa tìm kiếm
                        </Button>
                    </div>
                ) : isDefaultEmpty ? (
                    <div className={cx('stateCard')}>
                        <div className={cx('stateIcon')}>
                            <LuFileText />
                        </div>

                        <h3 className={cx('stateTitle')}>
                            Bạn chưa có CV nào
                        </h3>

                        <p className={cx('stateText')}>
                            Hãy tạo CV đầu tiên để bắt đầu xây dựng hồ sơ
                            chuyên nghiệp của bạn.
                        </p>

                        <Button
                            primary
                            type="button"
                            className={cx('stateBtn')}
                            onClick={handleCreateCv}
                        >
                            <FiPlusCircle />
                            <span>Tạo CV mới</span>
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className={cx('grid')}>
                            {currentList.map((cv) => (
                                <CardItemCV
                                    key={cv.id}
                                    data={cv}
                                    onDelete={handleAskDelete}
                                />
                            ))}
                        </div>

                        <div className={cx('footer')}>
                            <p className={cx('note')}>
                                Hiển thị {startItem} - {endItem} trong số{' '}
                                <strong>{totalItems}</strong> CV
                            </p>

                            <div className={cx('pagination')}>
                                <button
                                    type="button"
                                    className={cx('pageBtn', 'navBtn')}
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1 || loading}
                                >
                                    <FiChevronLeft />
                                </button>

                                {renderPageNumbers()}

                                <button
                                    type="button"
                                    className={cx('pageBtn', 'navBtn')}
                                    onClick={handleNextPage}
                                    disabled={
                                        currentPage === totalPages || loading
                                    }
                                >
                                    <FiChevronRight />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Modal
                isOpen={!!deleteItem}
                onClose={() => {
                    if (!isConfirm) {
                        setDeleteItem(null);
                    }
                }}
                title="Xác nhận xóa CV"
                description={
                    deleteItem
                        ? `Bạn có chắc muốn xóa "${deleteItem.name}" không? CV sẽ được chuyển vào thùng rác.`
                        : ''
                }
                footer={deleteFooter}
                size="sm"
            >
                <div className={cx('modalBody')}>
                    <div className={cx('warningIcon')}>
                        <FiTrash2 />
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default MyCvs;