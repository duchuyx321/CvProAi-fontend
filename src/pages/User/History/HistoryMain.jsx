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
                id: '6f3f2f70-9b51-4f14-b727-9c8d09d90001',
                user_id: 'test-user-id',
                order_type: 'SUBSCRIPTION',
                order_code: 'CVP-83921',
                plan_id: '5ec4f731-9b3b-46b7-9a62-76f261af9819',
                addon_package_id: null,
                amount_cents: '199000',
                currency: 'VND',
                status: 'PAID',
                provider: 'SEPAY',
                provider_transaction_id: 'SEPAY_TXN_83921',
                description: 'Thanh toán gói Premium 1 tháng',
                metadata: {
                    payment_method: 'BANK_TRANSFER',
                    bank_code: 'MB',
                    reference_code: 'CVPROAI83921',
                },
                paid_at: '2026-05-15T08:30:00.000Z',
                created_at: '2026-05-15T08:25:00.000Z',
                updated_at: '2026-05-15T08:30:00.000Z',
                plan: {
                    id: '5ec4f731-9b3b-46b7-9a62-76f261af9819',
                    name: 'Premium',
                    slug: 'premium',
                    billing_cycle: 'MONTH',
                },
                addon_package: null,
            },
            {
                id: '6f3f2f70-9b51-4f14-b727-9c8d09d90002',
                user_id: 'test-user-id',
                order_type: 'SUBSCRIPTION',
                order_code: 'CVP-72810',
                plan_id: '5ec4f731-9b3b-46b7-9a62-76f261af9819',
                addon_package_id: null,
                amount_cents: '199000',
                currency: 'VND',
                status: 'PAID',
                provider: 'SEPAY',
                provider_transaction_id: 'SEPAY_TXN_72810',
                description: 'Thanh toán gói Premium 1 tháng',
                metadata: {
                    payment_method: 'BANK_TRANSFER',
                    bank_code: 'VCB',
                    reference_code: 'CVPROAI72810',
                },
                paid_at: '2026-04-15T08:30:00.000Z',
                created_at: '2026-04-15T08:25:00.000Z',
                updated_at: '2026-04-15T08:30:00.000Z',
                plan: {
                    id: '5ec4f731-9b3b-46b7-9a62-76f261af9819',
                    name: 'Premium',
                    slug: 'premium',
                    billing_cycle: 'MONTH',
                },
                addon_package: null,
            },
            {
                id: '6f3f2f70-9b51-4f14-b727-9c8d09d90003',
                user_id: 'test-user-id',
                order_type: 'SUBSCRIPTION',
                order_code: 'CVP-72805',
                plan_id: '5ec4f731-9b3b-46b7-9a62-76f261af9819',
                addon_package_id: null,
                amount_cents: '199000',
                currency: 'VND',
                status: 'FAILED',
                provider: 'SEPAY',
                provider_transaction_id: null,
                description: 'Thanh toán gói Premium 1 tháng thất bại',
                metadata: {
                    payment_method: 'BANK_TRANSFER',
                    bank_code: 'TPB',
                    reference_code: 'CVPROAI72805',
                    failure_reason: 'Không nhận được xác nhận thanh toán',
                },
                paid_at: null,
                created_at: '2026-04-15T07:45:00.000Z',
                updated_at: '2026-04-15T07:50:00.000Z',
                plan: {
                    id: '5ec4f731-9b3b-46b7-9a62-76f261af9819',
                    name: 'Premium',
                    slug: 'premium',
                    billing_cycle: 'MONTH',
                },
                addon_package: null,
            },
            {
                id: '6f3f2f70-9b51-4f14-b727-9c8d09d90004',
                user_id: 'test-user-id',
                order_type: 'AI_ADDON',
                order_code: 'CVP-AI-70112',
                plan_id: null,
                addon_package_id: 'a1d5f1c2-98e6-4d2c-a16b-5db3f7a70001',
                amount_cents: '49000',
                currency: 'VND',
                status: 'PAID',
                provider: 'SEPAY',
                provider_transaction_id: 'SEPAY_TXN_70112',
                description: 'Mua thêm 10 lượt phân tích AI',
                metadata: {
                    payment_method: 'BANK_TRANSFER',
                    bank_code: 'ACB',
                    reference_code: 'CVPROAI70112',
                },
                paid_at: '2026-03-15T09:10:00.000Z',
                created_at: '2026-03-15T09:05:00.000Z',
                updated_at: '2026-03-15T09:10:00.000Z',
                plan: null,
                addon_package: {
                    id: 'a1d5f1c2-98e6-4d2c-a16b-5db3f7a70001',
                    name: 'Gói 10 lượt AI',
                    slug: 'ai-10-runs',
                    runs: 10,
                },
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
        let cancelled = false; 

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

                if (!cancelled) {
                    setHistoryData(result.data);
                }
            } catch (error) {
                if (!cancelled) {
                    toast.error(
                        error?.response?.data?.message ||
                            error?.message ||
                            'Có lỗi xảy ra, vui lòng thử lại sau',
                    );
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        fetchHistory();

        return () => {
            cancelled = true;
        };
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
                        Theo dõi các khoản thanh toán gói Premium và lượt AI mua thêm.
                    </p>
                </div>

                {items.length === 0 ? (
                    <p className={cx('empty')}>Chưa có giao dịch nào.</p>
                ) : (
                    <>
                        <div className={cx('tableWrapper')}>
                            <div className={cx('tableHeader')}>
                                <div className={cx('col', 'colCode')}>Mã đơn</div>
                                <div className={cx('col', 'colDate')}>
                                    Ngày thanh toán
                                </div>
                                <div className={cx('col', 'colPlan')}>
                                    Nội dung
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