import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import HistoryRow from './components/HistoryRow';
import styles from './HistoryMain.module.scss';
// import { getPaymentHistory } from '~/services/history.service';

const cx = classNames.bind(styles);

// eslint-disable-next-line react-refresh/only-export-components
export const HISTORY_MOCKS = {
    success: true,
    message: 'Lấy lịch sử giao dịch thành công',
    data: {
        items: [
            {
                id: 'txn_001',
                transaction_code: '#CVP-83921',
                paid_at: '2026-05-15T08:30:00.000Z',
                plan_name: 'Gói Premium',
                billing_cycle: 'MONTH',
                amount: '199000',
                currency: 'VND',
                status: 'SUCCESS',
                payment_method: 'SePay',
                provider: 'SEPAY',
                payment_channel: 'BANK_TRANSFER',
                bank_code: 'MB',
                reference_code: 'CVPROAI83921',
            },
            {
                id: 'txn_002',
                transaction_code: '#CVP-72810',
                paid_at: '2026-04-15T08:30:00.000Z',
                plan_name: 'Gói Premium',
                billing_cycle: 'MONTH',
                amount: '199000',
                currency: 'VND',
                status: 'SUCCESS',
                payment_method: 'SePay',
                provider: 'SEPAY',
                payment_channel: 'BANK_TRANSFER',
                bank_code: 'VCB',
                reference_code: 'CVPROAI72810',
            },
            {
                id: 'txn_003',
                transaction_code: '#CVP-72805',
                paid_at: '2026-04-15T07:45:00.000Z',
                plan_name: 'Gói Premium',
                billing_cycle: 'MONTH',
                amount: '199000',
                currency: 'VND',
                status: 'FAILED',
                payment_method: 'SePay',
                provider: 'SEPAY',
                payment_channel: 'BANK_TRANSFER',
                bank_code: 'TPB',
                reference_code: 'CVPROAI72805',
            },
            {
                id: 'txn_004',
                transaction_code: '#CVP-70112',
                paid_at: '2026-03-15T09:10:00.000Z',
                plan_name: 'Gói Premium',
                billing_cycle: 'MONTH',
                amount: '199000',
                currency: 'VND',
                status: 'SUCCESS',
                payment_method: 'SePay',
                provider: 'SEPAY',
                payment_channel: 'BANK_TRANSFER',
                bank_code: 'ACB',
                reference_code: 'CVPROAI70112',
            },
        ],
        pagination: {
            page: 1,
            limit: 10,
            total_items: 4,
            total_pages: 1,
        },
    },
    date: '08:39:35 21/04/2026',
    path: '/api/v1/users/me/payments',
};

function HistoryMain() {
    const [historyData, setHistoryData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);

            try {
                // const result = await getPaymentHistory({
                //     page: 1,
                //     limit: 10,
                // });
                const result = HISTORY_MOCKS;

                if (!result?.success) {
                    throw new Error(
                        result?.message || 'Không thể tải lịch sử giao dịch',
                    );
                }

                if (!Array.isArray(result?.data?.items)) {
                    throw new Error('Dữ liệu lịch sử giao dịch không hợp lệ');
                }

                setHistoryData(result.data);
            } catch (error) {
                toast.error(
                    error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (isLoading) {
        return (
            <div className={cx('wrapper')}>
                <p className={cx('loading')}>Đang tải lịch sử giao dịch...</p>
            </div>
        );
    }

    if (!historyData) {
        return (
            <div className={cx('wrapper')}>
                <p className={cx('empty')}>Không có dữ liệu giao dịch.</p>
            </div>
        );
    }

    const { items, pagination } = historyData;

    return (
        <div className={cx('wrapper')}>
            <section className={cx('card')}>
                <div className={cx('header')}>
                    <h2 className={cx('title')}>Lịch sử giao dịch</h2>
                    <p className={cx('desc')}>
                        Theo dõi các khoản thanh toán và gia hạn gói của bạn.
                    </p>
                </div>

                {items.length === 0 ? (
                    <p className={cx('empty')}>Chưa có giao dịch nào.</p>
                ) : (
                    <>
                        <div className={cx('tableWrapper')}>
                            <div className={cx('tableHeader')}>
                                <div className={cx('col', 'colCode')}>Mã GD</div>
                                <div className={cx('col', 'colDate')}>
                                    Ngày thanh toán
                                </div>
                                <div className={cx('col', 'colPlan')}>
                                    Gói dịch vụ
                                </div>
                                <div className={cx('col', 'colAmount')}>
                                    Số tiền
                                </div>
                                <div className={cx('col', 'colMethod')}>
                                    Phương thức
                                </div>
                                <div className={cx('col', 'colStatus')}>
                                    Trạng thái
                                </div>
                            </div>

                            <div className={cx('tableBody')}>
                                {items.map((item) => (
                                    <HistoryRow key={item.id} item={item} />
                                ))}
                            </div>
                        </div>

                        <div className={cx('footer')}>
                            <p className={cx('summary')}>
                                Hiển thị 1 đến {items.length} trong số{' '}
                                {pagination?.total_items || items.length} giao dịch
                            </p>

                            <div className={cx('pagination')}>
                                <button
                                    type="button"
                                    className={cx('pageBtn')}
                                    disabled
                                >
                                    Trước
                                </button>

                                <button
                                    type="button"
                                    className={cx('pageBtn', 'active')}
                                >
                                    {pagination?.page || 1}
                                </button>

                                <button
                                    type="button"
                                    className={cx('pageBtn')}
                                    disabled
                                >
                                    Sau
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </section>
        </div>
    );
}

export default HistoryMain;