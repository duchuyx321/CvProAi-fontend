import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import styles from './Payment.module.scss';
import { config } from '~/config';
import useCheckoutData from '~/hooks/useCheckoutData';
import usePaymentRealtime from '~/hooks/usePaymentRealtime';
import { createPaymentOrder, getPaymentOrderStatus } from '~/services/payment.service';

import PackageCard from './components/PackageCard';
import QRCodeScreen from './components/QRCodeScreen';
import { GUIDE_STEPS, PAYMENT_METHOD } from './Payment.constants';
import { isSafeId, normalizeOrderForUi, toSafeNumber } from './Payment.utils';

const cx = classNames.bind(styles);

function Payment() {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const checkoutState = location.state?.checkout || {};
    const checkoutAddOnIdRaw = checkoutState?.addOnPackId || checkoutState?.addOn?.id || null;
    const checkoutAddOnId = isSafeId(checkoutAddOnIdRaw) ? checkoutAddOnIdRaw : null;
    const normalizedPackageId = isSafeId(packageId) ? packageId : null;

    const [isProcessing, setIsProcessing] = useState(false);
    const [isManualChecking, setIsManualChecking] = useState(false);
    const [qrCode, setQrCode] = useState(null);
    const [orderInfo, setOrderInfo] = useState(null);

    const isCheckingStatusRef = useRef(false);
    const autoCreateTriggeredRef = useRef(false);

    const autoStartEnabled = new URLSearchParams(location.search).get('autostart') !== '0';

    const { isCheckoutLoading, checkoutData } = useCheckoutData({
        normalizedPackageId,
        checkoutAddOnId,
        navigate,
    });

    const pkg = useMemo(() => {
        const plan = checkoutData?.plan;

        if (!plan?.id) {
            return null;
        }

        const basePrice = toSafeNumber(plan.price);
        const addOnRuns = toSafeNumber(checkoutData?.addOn?.runs ?? checkoutData?.addOn?.credits, 0);
        const addOnPrice = toSafeNumber(checkoutData?.addOn?.price);
        const totalPrice = basePrice + addOnPrice;

        const featureList = Array.isArray(plan.features)
            ? plan.features
                  .map((item) => (typeof item === 'string' ? item : item?.text))
                  .filter(Boolean)
            : [];

        return {
            ...plan,
            id: plan.id,
            name: checkoutData?.addOn ? `${plan.name} + ${addOnRuns} lượt AI` : plan.name,
            description: checkoutData?.addOn
                ? `${plan.description}. Kèm add-on mua lẻ ${addOnRuns} lượt AI.`
                : plan.description,
            price: totalPrice,
            basePrice,
            addOn: checkoutData?.addOn || null,
            features: checkoutData?.addOn
                ? [...featureList, `Mua thêm ${addOnRuns} lượt AI (one-time add-on)`]
                : featureList,
        };
    }, [checkoutData]);

    const formatCurrency = useCallback((amount) => `${new Intl.NumberFormat('vi-VN').format(Number(amount || 0))} đ`, []);

    const { realtimeState, startRealtime, stopRealtime } = usePaymentRealtime({ pkg });

    const resetPendingOrder = useCallback(() => {
        setQrCode(null);
        setOrderInfo(null);
        stopRealtime();
    }, [stopRealtime]);

    const handleResolvedStatus = useCallback(
        (status, targetOrderId) => {
            if (!status) {
                return false;
            }

            if (status === 'PAID') {
                stopRealtime();
                navigate(config.router.paymentSuccess.replace(':orderId', encodeURIComponent(targetOrderId)), {
                    replace: true,
                });
                return true;
            }

            if (status === 'FAILED' || status === 'EXPIRED') {
                resetPendingOrder();
                toast.error(status === 'EXPIRED' ? 'Mã QR đã hết hạn.' : 'Thanh toán thất bại.');
                return true;
            }

            return false;
        },
        [navigate, resetPendingOrder, stopRealtime],
    );

    const checkStatus = useCallback(
        async (orderId, options = {}) => {
            if (!orderId || isCheckingStatusRef.current) {
                return;
            }

            const isManual = Boolean(options?.manual);
            isCheckingStatusRef.current = true;

            try {
                const statusRes = await getPaymentOrderStatus(orderId);

                if (!statusRes?.success) {
                    throw new Error(statusRes?.message || 'Không thể kiểm tra trạng thái thanh toán');
                }

                const normalizedOrder = normalizeOrderForUi(statusRes?.data || {}, pkg);
                const finalOrderId = normalizedOrder?.orderId || orderId;

                setOrderInfo((prev) => ({
                    ...prev,
                    ...normalizedOrder,
                    orderId: finalOrderId,
                }));

                const handled = handleResolvedStatus(normalizedOrder?.status, finalOrderId);

                if (!handled && isManual) {
                    toast.info('Hệ thống chưa ghi nhận giao dịch. Vui lòng kiểm tra lại sau vài giây.');
                }
            } catch (error) {
                if (isManual) {
                    toast.error(error?.message || 'Không thể xác nhận thanh toán ở thời điểm này.');
                }
            } finally {
                isCheckingStatusRef.current = false;
            }
        },
        [handleResolvedStatus, pkg],
    );

    const handleCreateOrder = useCallback(
        async ({ force = false } = {}) => {
            if (isProcessing || isCheckoutLoading || !pkg?.id) {
                return;
            }

            if (!force && orderInfo?.status === 'PENDING' && qrCode) {
                toast.info('Đơn hàng hiện tại đang chờ thanh toán.');
                return;
            }

            setIsProcessing(true);

            try {
                const response = await createPaymentOrder({
                    packageId: pkg.id,
                    package_id: pkg.id,
                    method: PAYMENT_METHOD.apiValue,
                    payment_method: PAYMENT_METHOD.apiValue,
                    addOnPackId: pkg?.addOn?.id || null,
                    add_on_pack_id: pkg?.addOn?.id || null,
                    totalAmount: pkg.price,
                    total_amount: pkg.price,
                });

                if (!response?.success) {
                    throw new Error(response?.message || 'Không thể khởi tạo thanh toán.');
                }

                const normalizedOrder = normalizeOrderForUi(response?.data || {}, pkg);
                const createdOrderId = normalizedOrder?.orderId;
                const createdQrCode = normalizedOrder?.qrCodeUrl;

                if (!createdOrderId || !createdQrCode) {
                    throw new Error('Không nhận được thông tin QR hợp lệ.');
                }

                setOrderInfo({
                    ...normalizedOrder,
                    orderId: createdOrderId,
                    status: normalizedOrder?.status || 'PENDING',
                });
                setQrCode(createdQrCode);

                const connected = await startRealtime(normalizedOrder, {
                    onMessage: (nextOrder, latestOrderId) => {
                        setOrderInfo((prev) => ({
                            ...prev,
                            ...nextOrder,
                            orderId: latestOrderId,
                        }));
                        handleResolvedStatus(nextOrder?.status, latestOrderId);
                    },
                });

                if (!connected) {
                    toast.warning('Không kết nối được realtime. Bạn có thể bấm "Tôi đã thanh toán" để xác nhận.');
                }

                await checkStatus(createdOrderId);
            } catch (error) {
                toast.error(error?.message || 'Lỗi khi tạo thanh toán.');
            } finally {
                setIsProcessing(false);
            }
        },
        [checkStatus, handleResolvedStatus, isCheckoutLoading, isProcessing, orderInfo?.status, pkg, qrCode, startRealtime],
    );

    const handleManualCheck = useCallback(async () => {
        const activeOrderId = orderInfo?.orderId;

        if (!activeOrderId || isManualChecking) {
            return;
        }

        setIsManualChecking(true);
        try {
            await checkStatus(activeOrderId, { manual: true });
        } finally {
            setIsManualChecking(false);
        }
    }, [checkStatus, isManualChecking, orderInfo?.orderId]);

    const handleCancelOrder = useCallback(() => {
        const shouldCancel = window.confirm('Bạn có chắc chắn muốn hủy giao dịch không?');

        if (!shouldCancel) {
            return;
        }

        resetPendingOrder();
        toast.info('Đã hủy giao dịch thanh toán.');

        if (pkg?.id) {
            const optionPath = config.router.upgradeOptions.replace(':packageId', pkg.id);
            navigate(optionPath, {
                replace: true,
                state: { checkout: { addOnPackId: pkg?.addOn?.id || null } },
            });
            return;
        }

        navigate(config.router.upgradePremium, { replace: true });
    }, [navigate, pkg, resetPendingOrder]);

    useEffect(() => () => stopRealtime(), [stopRealtime]);

    useEffect(() => {
        autoCreateTriggeredRef.current = false;
    }, [packageId, location.search]);

    useEffect(() => {
        if (
            !autoStartEnabled ||
            autoCreateTriggeredRef.current ||
            qrCode ||
            isProcessing ||
            isCheckoutLoading ||
            !pkg?.id
        ) {
            return;
        }

        autoCreateTriggeredRef.current = true;
        handleCreateOrder();
    }, [autoStartEnabled, handleCreateOrder, isCheckoutLoading, isProcessing, pkg?.id, qrCode]);

    if (!pkg && isCheckoutLoading) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('container')}>
                    <div className={cx('page-head')}>
                        <div>
                            <h1 className={cx('title')}>Đang chuẩn bị thanh toán...</h1>
                            <p className={cx('subtitle')}>Vui lòng chờ trong giây lát.</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!pkg) {
        return null;
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                <div className={cx('page-head')}>
                    <div>
                        <h1 className={cx('title')}>Hoàn tất thanh toán.</h1>
                        <p className={cx('subtitle')}>
                            Kích hoạt tự động ngay sau khi chuyển khoản thành công. Không cần tải lại trang.
                        </p>
                    </div>

                    {qrCode ? (
                        <span className={cx('status-pill', realtimeState === 'connected' ? 'pending' : 'idle')}>
                            {realtimeState === 'connected'
                                ? 'Realtime đang kết nối'
                                : realtimeState === 'connecting'
                                  ? 'Đang kết nối realtime...'
                                  : 'Realtime tạm thời ngắt'}
                        </span>
                    ) : null}
                </div>

                <div className={cx('content-grid')}>
                    <aside className={cx('left-column')}>
                        <PackageCard pkg={pkg} formatCurrency={formatCurrency} />

                        <div className={cx('guide-card')}>
                            <h3 className={cx('guide-title')}>Hướng dẫn thanh toán</h3>
                            <div className={cx('guide-list')}>
                                {GUIDE_STEPS.map((step, index) => (
                                    <div key={step.title} className={cx('guide-item')}>
                                        <span className={cx('guide-index')}>{index + 1}</span>
                                        <div>
                                            <p className={cx('guide-item-title')}>{step.title}</p>
                                            <p className={cx('guide-item-desc')}>{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <section className={cx('right-column')}>
                        <QRCodeScreen
                            qrCode={qrCode}
                            orderInfo={orderInfo}
                            pkg={pkg}
                            formatCurrency={formatCurrency}
                            onCreateOrder={handleCreateOrder}
                            onManualCheck={handleManualCheck}
                            onCancelOrder={handleCancelOrder}
                            isProcessing={isProcessing}
                            isManualChecking={isManualChecking}
                            methodLabel={PAYMENT_METHOD.label}
                            methodHint={PAYMENT_METHOD.hint}
                        />
                    </section>
                </div>

                <div className={cx('footer')}>
                    <span>© 2026 CVPROAI. SECURELY PROCESSED VIA LEDGER PROTOCOL.</span>
                    <span>TERMS · PRIVACY · SECURITY · SUPPORT</span>
                </div>
            </div>
        </div>
    );
}

export default Payment;
