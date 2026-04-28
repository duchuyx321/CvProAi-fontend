import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import {
    FiAlertCircle,
    FiArrowLeft,
    FiChevronDown,
    FiChevronLeft,
    FiChevronRight,
    FiLoader,
    FiSearch,
    FiTrash2,
    FiRotateCcw,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import Button from '~/components/Button';
import Modal from '~/components/Modal';
import { config } from '~/config';
import useDebounce from '~/hooks/useDebounce';
import CardItemCV from '../MyCvs/components/CardItemCV';
import {
    forceDeleteMyCv,
    getTrashCvs,
    resotreMyCv,
} from '~/services/trash-cv.service';
import styles from './TrashCvs.module.scss';

const cx = classNames.bind(styles);

const PAGE_SIZE = 4;
const SORT_OPTIONS = ['Mới nhất', 'Cũ nhất', 'A -> Z', 'Z -> A'];

const getSortParam = (value) => {
    if (value === 'Cũ nhất') {
        return {
            sort_by: 'created_at',
            sort_order: 'ASC',
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
        sort_by: 'created_at',
        sort_order: 'DESC',
    };
};

const formatDateTime = (value) => {
    if (!value) return '';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const mapTrashItem = (cv) => ({
    id: cv.id,
    name: cv.title,
    deletedAt: formatDateTime(cv.deletedAt || cv.updatedAt || cv.createdAt),
    image:
        cv.preview_url ||
        'https://via.placeholder.com/400x520/334155/ffffff?text=CV',
    slug: cv.slug,
});

function TrashCvs() {
    const navigate = useNavigate();

    const [keyword, setKeyword] = useState('');
    const debouncedKeyword = useDebounce(keyword, 500);

    const [currentPage, setCurrentPage] = useState(1);
    const [sortValue, setSortValue] = useState('Mới nhất');
    const [isOpenSort, setIsOpenSort] = useState(false);

    const [trashList, setTrashList] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [restoreItem, setRestoreItem] = useState(null);
    const [deleteForeverItem, setDeleteForeverItem] = useState(null);

    const sortRef = useRef(null);

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

    const fetchTrashCvs = async ({
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

            const res = await getTrashCvs({
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
                    'Không tải được danh sách thùng rác';

                setTrashList([]);
                setTotalItems(0);
                setErrorMessage(message);

                if (!silent) {
                    toast.error(message);
                }
                return;
            }

            const rawItems = Array.isArray(res?.data) ? res.data : [];
            const total =
                res?.pagination?.total ||
                res?.meta?.total ||
                res?.total ||
                rawItems.length;

            setTrashList(rawItems.map(mapTrashItem));
            setTotalItems(total);
            setErrorMessage('');
        } catch {
            setTrashList([]);
            setTotalItems(0);
            setErrorMessage('Có lỗi xảy ra khi tải thùng rác');

            if (!silent) {
                toast.error('Có lỗi xảy ra khi tải thùng rác');
            }
        } finally {
            setLoading(false);

            setTimeout(() => {
                setSearching(false);
            }, 400);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedKeyword]);

    useEffect(() => {
        fetchTrashCvs({
            page: currentPage,
            keywordValue: debouncedKeyword,
            sort: sortValue,
            silent: debouncedKeyword.trim().length > 0,
        });
    }, [currentPage, sortValue, debouncedKeyword]);

    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const currentList = trashList;

    const isEmpty = !loading && !errorMessage && currentList.length === 0;
    const isSearchingEmpty = isEmpty && debouncedKeyword.trim().length > 0;
    const isDefaultEmpty = isEmpty && !debouncedKeyword.trim();

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(currentPage * PAGE_SIZE, totalItems);

    const handleSearch = (event) => {
        setKeyword(event.target.value);
    };

    const handleRestore = (cv) => {
        setRestoreItem(cv);
    };

    const handleConfirmRestore = async () => {
        if (!restoreItem) return;

        try {
            const res = await resotreMyCv(restoreItem.id);

            if (!res?.success) {
                toast.error(
                    res?.message || res?.messsage || 'Khôi phục CV thất bại',
                );
                return;
            }

            toast.success(`Đã khôi phục "${restoreItem.name}"`);
            setRestoreItem(null);

            const nextPage =
                currentList.length === 1 && currentPage > 1
                    ? currentPage - 1
                    : currentPage;

            if (nextPage !== currentPage) {
                setCurrentPage(nextPage);
            } else {
                await fetchTrashCvs({
                    page: nextPage,
                    keywordValue: debouncedKeyword,
                    sort: sortValue,
                });
            }
        } catch {
            toast.error('Có lỗi xảy ra khi khôi phục CV');
        }
    };

    const handleAskDeleteForever = (cv) => {
        setDeleteForeverItem(cv);
    };

    const handleConfirmDeleteForever = async () => {
        if (!deleteForeverItem) return;

        try {
            const res = await forceDeleteMyCv(deleteForeverItem.id);

            if (!res?.success) {
                toast.error(
                    res?.message || res?.messsage || 'Xóa vĩnh viễn thất bại',
                );
                return;
            }

            toast.success(`Đã xóa vĩnh viễn "${deleteForeverItem.name}"`);
            setDeleteForeverItem(null);

            const nextPage =
                currentList.length === 1 && currentPage > 1
                    ? currentPage - 1
                    : currentPage;

            if (nextPage !== currentPage) {
                setCurrentPage(nextPage);
            } else {
                await fetchTrashCvs({
                    page: nextPage,
                    keywordValue: debouncedKeyword,
                    sort: sortValue,
                });
            }
        } catch {
            toast.error('Có lỗi xảy ra khi xóa vĩnh viễn CV');
        }
    };

    const handlePrevPage = () => {
        if (currentPage === 1) return;
        setCurrentPage((prev) => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage === totalPages) return;
        setCurrentPage((prev) => prev + 1);
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
                    onClick={() => setCurrentPage(page)}
                >
                    {page}
                </button>
            );
        });
    };

    const restoreFooter = (
        <div className={cx('modalActions')}>
            <Button
                type="button"
                className={cx('modalCancelBtn')}
                onClick={() => setRestoreItem(null)}
            >
                Hủy
            </Button>

            <Button
                primary
                type="button"
                className={cx('modalRestoreBtn')}
                onClick={handleConfirmRestore}
            >
                Khôi phục
            </Button>
        </div>
    );

    const modalFooter = (
        <div className={cx('modalActions')}>
            <Button
                type="button"
                className={cx('modalCancelBtn')}
                onClick={() => setDeleteForeverItem(null)}
            >
                Hủy
            </Button>

            <Button
                primary
                type="button"
                className={cx('modalDeleteBtn')}
                onClick={handleConfirmDeleteForever}
            >
                Xóa vĩnh viễn
            </Button>
        </div>
    );

    if (loading) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('loading')}>
                    Đang tải danh sách thùng rác...
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={cx('wrapper')}>
                <div className={cx('header')}>
                    <div className={cx('heading')}>
                        <div className={cx('titleRow')}>
                            <h1 className={cx('title')}>Thùng rác</h1>
                            <span className={cx('countBadge')}>
                                {totalItems}
                            </span>
                        </div>

                        <p className={cx('desc')}>
                            Các CV đã xóa được lưu tạm tại đây trước khi bị xóa
                            vĩnh viễn.
                        </p>
                    </div>

                    <Button
                        type="button"
                        className={cx('backBtn')}
                        onClick={() => navigate(config.router.myCvs)}
                    >
                        <FiArrowLeft />
                        <span>CV của tôi</span>
                    </Button>
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
                            placeholder="Tìm kiếm CV trong thùng rác..."
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
                                            setCurrentPage(1);
                                            setIsOpenSort(false);
                                        }}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {errorMessage ? (
                    <div className={cx('stateCard')}>
                        <div className={cx('stateIcon', 'errorStateIcon')}>
                            <FiAlertCircle />
                        </div>
                        <h3 className={cx('stateTitle')}>
                            Không thể tải thùng rác
                        </h3>
                        <p className={cx('stateText')}>{errorMessage}</p>
                        <Button
                            type="button"
                            className={cx('stateBtn')}
                            onClick={() =>
                                fetchTrashCvs({
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
                            Không tìm thấy CV trong thùng rác
                        </h3>
                        <p className={cx('stateText')}>
                            Không có kết quả nào khớp với từ khóa "
                            {debouncedKeyword}".
                        </p>
                        <Button
                            type="button"
                            className={cx('stateBtn')}
                            onClick={() => setKeyword('')}
                        >
                            Xóa tìm kiếm
                        </Button>
                    </div>
                ) : isDefaultEmpty ? (
                    <div className={cx('emptyState')}>
                        <div className={cx('emptyIcon')}>
                            <FiTrash2 />
                        </div>
                        <h3 className={cx('emptyTitle')}>
                            Thùng rác đang trống
                        </h3>
                        <p className={cx('emptyText')}>
                            Các CV bạn xóa sẽ xuất hiện tại đây để có thể khôi
                            phục khi cần.
                        </p>
                        <Button
                            type="button"
                            className={cx('emptyBackBtn')}
                            onClick={() => navigate(config.router.myCvs)}
                        >
                            Quay lại CV của tôi
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className={cx('grid')}>
                            {currentList.map((cv) => (
                                <CardItemCV
                                    key={cv.id}
                                    data={cv}
                                    disableLink
                                    onRestore={handleRestore}
                                    onDeleteForever={handleAskDeleteForever}
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
                                    disabled={currentPage === 1}
                                >
                                    <FiChevronLeft />
                                </button>

                                {renderPageNumbers()}

                                <button
                                    type="button"
                                    className={cx('pageBtn', 'navBtn')}
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                >
                                    <FiChevronRight />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <Modal
                isOpen={!!restoreItem}
                onClose={() => setRestoreItem(null)}
                title="Xác nhận khôi phục CV"
                description={
                    restoreItem
                        ? `Bạn có chắc muốn khôi phục "${restoreItem.name}" không? CV sẽ quay lại danh sách CV của tôi.`
                        : ''
                }
                footer={restoreFooter}
                size="sm"
            >
                <div className={cx('modalBody')}>
                    <div className={cx('restoreIcon')}>
                        <FiRotateCcw />
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={!!deleteForeverItem}
                onClose={() => setDeleteForeverItem(null)}
                title="Xóa vĩnh viễn CV"
                description={
                    deleteForeverItem
                        ? `Bạn có chắc muốn xóa vĩnh viễn "${deleteForeverItem.name}" không? Hành động này không thể hoàn tác.`
                        : ''
                }
                footer={modalFooter}
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

export default TrashCvs;
