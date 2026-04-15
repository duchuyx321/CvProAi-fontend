import { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { FiFileText, FiDownload, FiEdit2 } from 'react-icons/fi';
import { IoRefreshOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import Button from '~/components/Button';
import styles from './Export.module.scss';

const cx = classNames.bind(styles);

const PAGE_SIZE = 4;

export const MOCK_DATA = {
    success: true,
    data: [
        {
            id: 1,
            fileName: 'CV_NguyenVanA_Frontend.pdf',
            fileSize: '2.4 MB',
            fileType: 'PDF Document',
            exportedAt: '08/04/2026 10:32',
            canRetry: false,
        },
        {
            id: 2,
            fileName: 'CV_Product_Manager.pdf',
            fileSize: '1.8 MB',
            fileType: 'PDF Document',
            exportedAt: '08/04/2026 09:12',
            canRetry: false,
        },
        {
            id: 3,
            fileName: 'CV_UX_Designer.pdf',
            fileSize: '1.8 MB',
            fileType: 'PDF Document',
            exportedAt: '07/04/2026 18:45',
            canRetry: true,
        },
        {
            id: 4,
            fileName: 'CV_Backend_Engineer.pdf',
            fileSize: '1.2 MB',
            fileType: 'PDF Document',
            exportedAt: '07/04/2026 14:20',
            canRetry: false,
        },
        {
            id: 5,
            fileName: 'CV_React_Developer.pdf',
            fileSize: '2.1 MB',
            fileType: 'PDF Document',
            exportedAt: '06/04/2026 16:10',
            canRetry: false,
        },
        {
            id: 6,
            fileName: 'CV_Business_Analyst.pdf',
            fileSize: '1.6 MB',
            fileType: 'PDF Document',
            exportedAt: '06/04/2026 11:08',
            canRetry: false,
        },
    ],
};

function Export() {
    const [exportList, setExportList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = exportList.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

    const currentList = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;

        return exportList.slice(start, end);
    }, [exportList, currentPage]);

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(currentPage * PAGE_SIZE, totalItems);

    useEffect(() => {
        setCurrentPage(1);
    }, [exportList]);

    useEffect(() => {
        const fetchExportHistory = async () => {
            try {
                const result = MOCK_DATA;

                if (!result?.success) {
                    throw new Error(
                        result?.message || 'Không thể tải lịch sử export',
                    );
                }

                setExportList(result?.data || []);
            } catch (error) {
                toast.error(
                    error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
                );
            }
        };

        fetchExportHistory();
    }, []);

    const handlePrevPage = () => {
        if (currentPage === 1) return;
        setCurrentPage((prev) => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage === totalPages) return;
        setCurrentPage((prev) => prev + 1);
    };

    const handleDownload = (item) => {
        toast.info(`Tải xuống: ${item.fileName}`);
    };

    const handleEdit = (item) => {
        toast.info(`Sửa export: ${item.fileName}`);
    };

    const handleRetry = (item) => {
        toast.info(`Thử lại export: ${item.fileName}`);
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
                <Button
                    key={page}
                    type="button"
                    className={cx('pageBtn', {
                        active: currentPage === page,
                    })}
                    onClick={() => setCurrentPage(page)}
                >
                    {page}
                </Button>
            );
        });
    };

    return (
        <div className={cx('wrapper')}>
            <section className={cx('card')}>
                <div className={cx('header')}>
                    <h1 className={cx('title')}>Lịch sử export</h1>
                    <p className={cx('desc')}>
                        Theo dõi các file CV đã xuất và trạng thái xử lý.
                    </p>
                </div>

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
                            {currentList.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className={cx('empty')}>
                                        Chưa có file nào được xuất
                                    </td>
                                </tr>
                            ) : (
                                currentList.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div className={cx('fileInfo')}>
                                                <div className={cx('fileIcon')}>
                                                    <FiFileText />
                                                </div>

                                                <div className={cx('fileMeta')}>
                                                    <h3 className={cx('fileName')}>
                                                        {item.fileName}
                                                    </h3>
                                                    <p className={cx('fileSub')}>
                                                        {item.fileSize} • {item.fileType}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className={cx('time')}>
                                            {item.exportedAt}
                                        </td>

                                        <td>
                                            <div className={cx('actions')}>
                                                {item.canRetry && (
                                                    <button
                                                        type="button"
                                                        className={cx('retryBtn')}
                                                        onClick={() => handleRetry(item)}
                                                    >
                                                        <IoRefreshOutline />
                                                        <span>Thử lại</span>
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    className={cx('iconBtn')}
                                                    onClick={() => handleDownload(item)}
                                                    aria-label="Tải xuống file"
                                                >
                                                    <FiDownload />
                                                </button>

                                                <button
                                                    type="button"
                                                    className={cx('iconBtn')}
                                                    onClick={() => handleEdit(item)}
                                                    aria-label="Sửa file export"
                                                >
                                                    <FiEdit2 />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className={cx('footer')}>
                    <p className={cx('note')}>
                        Hiển thị {startItem} đến {endItem} trên {totalItems} file đã xuất
                    </p>

                    <div className={cx('pagination')}>
                        <Button
                            type="button"
                            className={cx('pageBtn', 'navBtn')}
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            ‹
                        </Button>

                        {renderPageNumbers()}

                        <Button
                            type="button"
                            className={cx('pageBtn', 'navBtn')}
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            ›
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Export;