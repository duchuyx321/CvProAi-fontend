import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import {
    FaCheckCircle,
    FaPrint,
    FaArrowRight,
    FaReceipt,
    FaSpinner,
    FaTimesCircle,
    FaClock,
} from 'react-icons/fa';
import { toast } from 'react-toastify';

import styles from './PaymentSuccess.module.scss';
import { config } from '~/config';
import { useAuth } from '~/context/AuthContext';
import { getPaymentOrderDetails } from '~/services/payment.service';

const cx = classNames.bind(styles);

const normalizePaymentState = (status) => {
    const normalizedStatus = String(status || '').toUpperCase();

    if (['PAID', 'SUCCESS', 'COMPLETED'].includes(normalizedStatus)) {
        return 'success';
    }

    if (
        ['FAILED', 'CANCELED', 'CANCELLED', 'EXPIRED', 'REFUNDED'].includes(
            normalizedStatus,
        )
    ) {
        return 'failed';
    }

    return 'pending';
};

const parseCustomDate = (value) => {
    const raw = String(value || '').trim();

    if (!raw) {
        return null;
    }

    const ddmmyyyy = raw.match(
        /^(\d{1,2}):(\d{1,2}):(\d{1,2})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    );
    if (ddmmyyyy) {
        const [, hour, minute, second, day, month, year] = ddmmyyyy;
        const parsed = new Date(
            Number(year),
            Number(month) - 1,
            Number(day),
            Number(hour),
            Number(minute),
            Number(second),
        );
        return Number.isNaN(parsed.getTime()) ? null : parsed;
    }

    const iso = new Date(raw);
    return Number.isNaN(iso.getTime()) ? null : iso;
};

const toSafeNumber = (value, fallback = 0) => {
    const parsed = Number(
        String(value ?? '')
            .replace(/,/g, '')
            .trim(),
    );
    return Number.isFinite(parsed) ? parsed : fallback;
};

function PaymentSuccess() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    useAuth();

    const [loading, setLoading] = useState(true);
    const [orderData, setOrderData] = useState(null);
    const [paymentState, setPaymentState] = useState('pending');

    const paymentStateConfig = {
        success: {
            badge: 'Thanh toán thành công',
            title: 'Thanh toán đã hoàn tất',
            subtitle:
                'Gói Premium của bạn đã được kích hoạt. Bạn có thể sử dụng ngay các tính năng nâng cao của CvProAI.',
            receiptStatus: 'Đã thanh toán',
            buttonText: 'Trải nghiệm Premium',
            supportText:
                'Biên lai giao dịch đã được gửi đến email của bạn. Cảm ơn bạn đã tin tưởng và lựa chọn dịch vụ của chúng tôi!',
        },
        pending: {
            badge: 'Chờ thanh toán',
            title: 'Giao dịch đang chờ xác nhận',
            subtitle:
                'Hệ thống chưa nhận được xác nhận thanh toán. Nếu bạn đã chuyển khoản, vui lòng chờ trong giây lát để SePay cập nhật giao dịch.',
            receiptStatus: 'Chờ thanh toán',
            buttonText: 'Quay lại trang thanh toán',
            supportText:
                'Nếu bạn đã thanh toán nhưng trạng thái chưa cập nhật, vui lòng chờ thêm hoặc liên hệ hỗ trợ.',
        },
        failed: {
            badge: 'Thanh toán thất bại',
            title: 'Giao dịch chưa hoàn tất',
            subtitle:
                'Giao dịch của bạn đã thất bại, bị hủy hoặc hết hạn. Vui lòng thử thanh toán lại.',
            receiptStatus: 'Thất bại',
            buttonText: 'Thử thanh toán lại',
            supportText:
                'Nếu bạn đã bị trừ tiền nhưng giao dịch thất bại, vui lòng liên hệ đội ngũ CSKH của CvProAI.',
        },
    };

    const currentView =
        paymentStateConfig[paymentState] || paymentStateConfig.pending;

    useEffect(() => {
        let isActive = true;

        const verifyAndLoadOrder = async () => {
            if (!orderId) {
                toast.error('Không tìm thấy mã giao dịch.');
                navigate(config.router.upgradePremium, { replace: true });
                return;
            }

            try {
                setLoading(true);

                const res = await getPaymentOrderDetails(orderId);

                if (!res?.success) {
                    throw new Error(
                        res?.message ||
                            res?.messsage ||
                            'Không thể kiểm tra giao dịch.',
                    );
                }

                const verifiedOrder = res?.data || null;

                if (!verifiedOrder) {
                    throw new Error('Giao dịch không tồn tại.');
                }

                const currentPaymentState = normalizePaymentState(
                    verifiedOrder?.status,
                );

                if (isActive) {
                    setPaymentState(currentPaymentState);
                    setOrderData({
                        ...verifiedOrder,
                        orderId:
                            verifiedOrder?.orderId ||
                            verifiedOrder?.orderCode ||
                            verifiedOrder?.order_code ||
                            orderId,
                    });
                }
            } catch (error) {
                if (isActive) {
                    setPaymentState('failed');
                    setOrderData({
                        orderId,
                        status: 'FAILED',
                        errorMessage:
                            error?.message ||
                            'Có lỗi xảy ra khi kiểm tra giao dịch.',
                    });

                    toast.error(
                        error?.message ||
                            'Có lỗi xảy ra khi kiểm tra giao dịch.',
                    );
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        verifyAndLoadOrder();

        return () => {
            isActive = false;
        };
    }, [orderId, navigate]);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        })
            .format(toSafeNumber(value, 0))
            .replace('₫', 'VNĐ');
    };

    const formatDate = (value) => {
        const parsedDate = parseCustomDate(value);
        if (!parsedDate) return '--';
        return `${parsedDate.toLocaleDateString('vi-VN')} ${parsedDate.toLocaleTimeString('vi-VN')}`;
    };

    const computedViewData = useMemo(() => {
        if (!orderData) {
            return null;
        }

        const planName =
            orderData?.packageName ||
            orderData?.plan?.name ||
            orderData?.plan_name ||
            '--';

        const addOnName =
            orderData?.addOn?.name ||
            orderData?.addon?.name ||
            orderData?.addon_package?.name ||
            '';

        const packageName = addOnName ? `${planName} + ${addOnName}` : planName;

        const baseAmount = toSafeNumber(
            orderData?.amount ??
                orderData?.amount_cents ??
                orderData?.total_amount,
            0,
        );

        const fallbackAmount =
            toSafeNumber(orderData?.plan?.price, 0) +
            toSafeNumber(
                orderData?.addOn?.price ||
                    orderData?.addon?.price ||
                    orderData?.addon_package?.price,
                0,
            );

        const amount = baseAmount > 0 ? baseAmount : fallbackAmount;

        const paidAt =
            orderData?.paidAt ||
            orderData?.paid_at ||
            orderData?.date ||
            orderData?.updatedAt ||
            orderData?.updated_at ||
            orderData?.createdAt ||
            orderData?.created_at;

        const orderCode =
            orderData?.orderCode ||
            orderData?.order_code ||
            orderData?.orderId ||
            orderId;

        return {
            packageName,
            amount,
            method: orderData?.method || orderData?.provider || 'SePay',
            paidAt,
            orderCode,
        };
    }, [orderData, orderId]);

    if (loading) {
        return (
            <div className={cx('loading-wrapper')}>
                <div className={cx('card')}>
                    <FaSpinner className={cx('icon') + ' fa-spin'} />
                    <h3>Đang xác thực giao dịch...</h3>
                    <p>Vui lòng không đóng trình duyệt lúc này</p>
                </div>
            </div>
        );
    }

    if (!orderData || !computedViewData) {
        return null;
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('card')}>
                <div className={cx('hero')}>
                    <div className={cx('icon-wrap')}>
                        {paymentState === 'success' && (
                            <FaCheckCircle className={cx('icon-success')} />
                        )}

                        {paymentState === 'pending' && (
                            <FaClock className={cx('icon-pending')} />
                        )}

                        {paymentState === 'failed' && (
                            <FaTimesCircle className={cx('icon-failed')} />
                        )}
                    </div>

                    <span className={cx('status-badge', paymentState)}>
                        {currentView.badge}
                    </span>
                    <h1 className={cx('title')}>{currentView.title}</h1>

                    <p className={cx('subtitle')}>{currentView.subtitle}</p>

                    <div className={cx('quick-info')}>
                        <div className={cx('info-chip')}>
                            <span className={cx('info-label')}>
                                Mã đơn hàng
                            </span>
                            <span className={cx('info-value')}>
                                {computedViewData.orderCode}
                            </span>
                        </div>
                        <div className={cx('info-chip')}>
                            <span className={cx('info-label')}>
                                Gói đã kích hoạt
                            </span>
                            <span className={cx('info-value')}>
                                {computedViewData.packageName}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={cx('receipt-box')}>
                    <div className={cx('receipt-header')}>
                        <FaReceipt className={cx('receipt-icon')} />
                        <h3 className={cx('receipt-title')}>
                            Chi tiết giao dịch
                        </h3>
                    </div>

                    <div className={cx('receipt-body')}>
                        <div className={cx('row')}>
                            <span className={cx('label')}>Thời gian</span>
                            <span className={cx('value')}>
                                {formatDate(computedViewData.paidAt)}
                            </span>
                        </div>

                        <div className={cx('row')}>
                            <span className={cx('label')}>Phương thức</span>
                            <span className={cx('value')}>
                                {computedViewData.method}
                            </span>
                        </div>

                        <div className={cx('row')}>
                            <span className={cx('label')}>Trạng thái</span>
                            <span
                                className={cx(
                                    'value',
                                    'highlight',
                                    paymentState,
                                )}
                            >
                                {currentView.receiptStatus}
                            </span>
                        </div>

                        <div className={cx('divider')}></div>

                        <div className={cx('row', 'total-row')}>
                            <span className={cx('label')}>Tổng tiền</span>
                            <span className={cx('value')}>
                                {formatCurrency(computedViewData.amount)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className={cx('actions')}>
                    {/* <button type="button" className={cx('btn-secondary')} onClick={() => window.print()}>
                        <FaPrint /> In bien lai
                    </button> */}

                    <button
                        type="button"
                        className={cx('btn-primary', paymentState)}
                        onClick={() => {
                            if (paymentState === 'success') {
                                navigate(config.router.upgradePremium, {
                                    replace: true,
                                });
                                return;
                            }

                            navigate(config.router.upgradePremium, {
                                replace: true,
                            });
                        }}
                    >
                        {currentView.buttonText} <FaArrowRight />
                    </button>
                </div>

                <p className={cx('support-note')}>{currentView.supportText}</p>
            </div>
        </div>
    );
}

export default PaymentSuccess;
