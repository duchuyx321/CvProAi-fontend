import { useCallback, useEffect, useRef, useState } from 'react';
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
import Pagination from '~/components/Pagination';

const cx = classNames.bind(styles);

const PAGE_SIZE = 8;
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
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
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
function syncPageToUrl(nextPage, replace = false) {
    const params = new URLSearchParams(window.location.search);
    params.set('page', String(nextPage));

    const nextUrl = `${window.location.pathname}?${params.toString()}`;
    const method = replace ? 'replaceState' : 'pushState';

    window.history[method](null, '', nextUrl);
}
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
    const [loading, setLoading] = useState(false);
    const [firstLoading, setFirstLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [isConfirm, setIsConfirm] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [meta, setMeta] = useState({});
    const totalPages = Math.max(Number(meta?.total_pages) || 1, 1);
    const totalItems = Number(meta?.total_items) || cvList.length;
    const limit = Number(meta?.limit) || PAGE_SIZE;

    const startItem = totalItems ? (currentPage - 1) * limit + 1 : 0;
    const endItem = totalItems ? Math.min(currentPage * limit, totalItems) : 0;
    const sortRef = useRef(null);

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

                setErrorMessage(message);

                if (!silent) {
                    toast.error(message);
                }

                return;
            }
            const rawItems = res?.data?.data || res?.data || [];
            setMeta(res?.data?.meta);
            setCvList(rawItems.map(mapCvItem));

            setErrorMessage('');
        } catch {
            setCvList([]);

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

    const currentList = cvList;

    useEffect(() => {
        if (currentPage > meta.total_pages) {
            updatePage(meta.total_pages, { replace: true });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage]);

    const isEmpty = !loading && !errorMessage && currentList.length === 0;
    const isSearchingEmpty = isEmpty && debouncedKeyword.trim().length > 0;
    const isDefaultEmpty = isEmpty && !debouncedKeyword.trim();

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

    const handlePageChange = useCallback(
        (newPage) => {
            if (
                newPage < 1 ||
                newPage > totalPages ||
                newPage === currentPage
            ) {
                return;
            }

            setCurrentPage(newPage);
            syncPageToUrl(newPage);
        },
        [currentPage, totalPages],
    );
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
                        <h3 className={cx('stateTitle')}>Bạn chưa có CV nào</h3>
                        <p className={cx('stateText')}>
                            Hãy tạo CV đầu tiên để bắt đầu xây dựng hồ sơ chuyên
                            nghiệp của bạn.
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

                        <div className={cx('tableFooter')}>
                            <p>
                                Hiển thị {startItem} - {endItem} của{' '}
                                {totalItems} mẫu CV
                            </p>

                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                disabled={loading}
                                onPageChange={handlePageChange}
                            />
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
