import { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

// import { getPaymentHistory } from '~/services/history.service';
import styles from './HistoryMain.module.scss';
import Button from '~/components/Button';

const cx = classNames.bind(styles);

const PAGE_SIZE = 10;

function HistoryMain() {
    const [historyList, setHistoryList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const totalItems = historyList.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

    const currentList = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;

        return historyList.slice(start, end);
    }, [historyList, currentPage]);

    const startItem = totalItems === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(currentPage * PAGE_SIZE, totalItems);

    useEffect(() => {
        setCurrentPage(1);
    }, [historyList]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const result = await getPaymentHistory();

                if (!result?.success) {
                    throw new Error(
                        result?.message || 'Không thể tải lịch sử giao dịch',
                    );
                }

                setHistoryList(result?.data || []);
            } catch (error) {
                toast.error(
                    error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
                );
            }
        };

        fetchHistory();
    }, []);

    const handlePrevPage = () => {
        if (currentPage === 1) return;
        setCurrentPage((prev) => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage === totalPages) return;
        setCurrentPage((prev) => prev + 1);
    };

    const renderStatus = (status, statusText) => {
        return (
            <span
                className={cx('status', {
                    success: status === 'success',
                    failed: status === 'failed',
                    pending: status === 'pending',
                })}
            >
                <span className={cx('dot')}></span>
                {statusText}
            </span>
        );
    };

    return (
        <div className={cx('wrapper')}>
            <section className={cx('card')}>
                <div className={cx('header')}>
                    <h1 className={cx('title')}>Lịch sử giao dịch</h1>
                    <p className={cx('desc')}>
                        Theo dõi các khoản thanh toán gia hạn của bạn.
                    </p>
                </div>

                <div className={cx('tableWrap')}>
                    <table className={cx('table')}>
                        <thead>
                            <tr>
                                <th>Mã GD</th>
                                <th>Ngày thanh toán</th>
                                <th>Gói dịch vụ</th>
                                <th>Số tiền</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>

                        <tbody>
                            {
                                currentList.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className={cx('empty')}>
                                            Chưa có giao dịch nào
                                        </td>
                                    </tr>
                                ) : (
                                    currentList.map((item) => (
                                        <tr key={item.id}>
                                            <td className={cx('id')}>
                                                #{item.code || item.id}
                                            </td>
                                            <td>{item.paid_at || item.paidAt}</td>
                                            <td>
                                                <div className={cx('package')}>
                                                    <span
                                                        className={cx('packageName')}
                                                    >
                                                        {item.package_name ||
                                                            item.packageName}
                                                    </span>
                                                    <span
                                                        className={cx('duration')}
                                                    >
                                                        {item.duration || ''}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                {item.amount_text ||
                                                    item.amount ||
                                                    '0đ'}
                                            </td>
                                            <td>
                                                {renderStatus(
                                                    item.status,
                                                    item.status_text ||
                                                    item.statusText,
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                        </tbody>
                    </table>
                </div>

                <div className={cx('footer')}>
                    <p className={cx('note')}>
                        Hiển thị {startItem} đến {endItem} trong số {totalItems}{' '}
                        giao dịch
                    </p>

                    <div className={cx('pagination')}>
                        <Button
                            type="button"
                            className={cx('pageBtn')}
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                        >
                            Trước
                        </Button>

                        <Button
                            type="button"
                            className={cx('pageBtn', 'active')}
                        >
                            {currentPage}
                        </Button>

                        <Button
                            type="button"
                            className={cx('pageBtn')}
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                        >
                            Sau
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default HistoryMain;