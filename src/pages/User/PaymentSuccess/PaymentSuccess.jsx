import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { FaCheckCircle, FaPrint, FaArrowRight, FaReceipt, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';

import styles from './PaymentSuccess.module.scss';
import { config } from '~/config';
import { useAuth } from '~/context/AuthContext';
import { getPaymentOrderDetails } from '~/services/payment.service';

const cx = classNames.bind(styles);

const parseCustomDate = (value) => {
    const raw = String(value || '').trim();

    if (!raw) {
        return null;
    }

    const ddmmyyyy = raw.match(/^(\d{1,2}):(\d{1,2}):(\d{1,2})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
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
    const parsed = Number(String(value ?? '').replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : fallback;
};

function PaymentSuccess() {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [orderData, setOrderData] = useState(null);

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
                    throw new Error(res?.message || 'Không thể xác thực giao dịch');
                }

                const verifiedOrder = res?.data || null;
                if (!verifiedOrder) {
                    throw new Error('Giao dịch không tồn tại.');
                }

                const status = String(verifiedOrder?.status || '').toUpperCase();

                if (status === 'FAILED' || status === 'EXPIRED') {
                    throw new Error(status === 'EXPIRED' ? 'Mã giao dịch đã hết hạn.' : 'Giao dịch đã thất bại.');
                }

                if (status === 'PENDING') {
                    throw new Error('Giao dịch đang được xử lý. Vui lòng quay lại trang thanh toán.');
                }

                if (isActive) {
                    setOrderData({
                        ...verifiedOrder,
                        orderId: verifiedOrder?.orderId || verifiedOrder?.orderCode || orderId,
                    });
                }
            } catch (error) {
                if (isActive) {
                    toast.error(error?.message || 'Có lỗi xảy ra khi kiểm tra giao dịch.');
                    navigate(config.router.upgradePremium, { replace: true });
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
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
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

        const planName = orderData?.packageName || orderData?.plan?.name || '--';
        const addOnName = orderData?.addOn?.name || '';
        const packageName = addOnName ? `${planName} + ${addOnName}` : planName;

        const baseAmount = toSafeNumber(orderData?.amount, 0);
        const fallbackAmount = toSafeNumber(orderData?.plan?.price, 0) + toSafeNumber(orderData?.addOn?.price, 0);
        const amount = baseAmount > 0 ? baseAmount : fallbackAmount;

        const paidAt = orderData?.paidAt || orderData?.date || orderData?.updatedAt;
        const orderCode = orderData?.orderCode || orderData?.order_code || orderData?.orderId || orderId;

        return {
            packageName,
            amount,
            method: orderData?.method || 'SePay',
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
                        <FaCheckCircle className={cx('icon-success')} />
                    </div>

                    <span className={cx('status-badge')}>Kích hoạt Premium thành công</span>
                    <h1 className={cx('title')}>Thanh toán đã hoàn tất</h1>

                    <p className={cx('subtitle')}>
                        Biên lai giao dịch đã được gửi đến email <strong>{user?.email || 'của bạn'}</strong>. Bạn có thể sử dụng ngay tất cả các tính năng Premium của CVPro AI. Cảm ơn bạn đã tin tưởng và lựa chọn dịch vụ của chúng tôi!
                    </p>

                    <div className={cx('quick-info')}>
                        <div className={cx('info-chip')}>
                            <span className={cx('info-label')}>Mã đơn hàng</span>
                            <span className={cx('info-value')}>{computedViewData.orderCode}</span>
                        </div>
                        <div className={cx('info-chip')}>
                            <span className={cx('info-label')}>Gói đã kích hoạt</span>
                            <span className={cx('info-value')}>{computedViewData.packageName}</span>
                        </div>
                    </div>
                </div>

                <div className={cx('receipt-box')}>
                    <div className={cx('receipt-header')}>
                        <FaReceipt className={cx('receipt-icon')} />
                        <h3 className={cx('receipt-title')}>Chi tiết giao dịch</h3>
                    </div>

                    <div className={cx('receipt-body')}>
                        <div className={cx('row')}>
                            <span className={cx('label')}>Thời gian</span>
                            <span className={cx('value')}>{formatDate(computedViewData.paidAt)}</span>
                        </div>

                        <div className={cx('row')}>
                            <span className={cx('label')}>Phương thức</span>
                            <span className={cx('value')}>{computedViewData.method}</span>
                        </div>

                        <div className={cx('row')}>
                            <span className={cx('label')}>Trạng thái</span>
                            <span className={cx('value', 'highlight')}>Đã thanh toán</span>
                        </div>

                        <div className={cx('divider')}></div>

                        <div className={cx('row', 'total-row')}>
                            <span className={cx('label')}>Tổng tiền</span>
                            <span className={cx('value')}>{formatCurrency(computedViewData.amount)}</span>
                        </div>
                    </div>
                </div>

                <div className={cx('actions')}>
                    {/* <button type="button" className={cx('btn-secondary')} onClick={() => window.print()}>
                        <FaPrint /> In bien lai
                    </button> */}

                    <button
                        type="button"
                        className={cx('btn-primary')}
                        onClick={() => navigate(config.router.upgradePremium, { replace: true })}
                    >
                        Trải nghiệm Premium <FaArrowRight />
                    </button>
                </div>

                <p className={cx('support-note')}>
                    Cần hỗ trợ giao dịch? Liên hệ đội ngũ CSKH của CVPro AI trong mục trợ giúp.
                </p>
            </div>
        </div>
    );
}

export default PaymentSuccess;
