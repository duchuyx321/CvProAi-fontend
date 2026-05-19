import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import styles from './Payment.module.scss';
import { config } from '~/config';
import { checkStatus, getDetailCheckout } from '~/services/payment.service';
import { GUIDE_STEPS } from './Payment.constants';
import { normalizeOrderForUi } from './Payment.utils';

import PackageCard from './components/PackageCard';
import QRCodeScreen from './components/QRCodeScreen';

const cx = classNames.bind(styles);

function toNumber(value) {
    return Number(value) || 0;
}

function normalizeText(value = '') {
    return String(value || '').trim();
}

function Payment() {
    const { payment_id } = useParams();
    const navigate = useNavigate();

    const [resultCheckout, setResultCheckout] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        let isMounted = true;

        const fetchCheckout = async () => {
            const safePaymentId = normalizeText(payment_id);

            if (!safePaymentId) {
                setErrorMessage('Không tìm thấy mã thanh toán hợp lệ.');
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setErrorMessage('');

            const result = await getDetailCheckout(safePaymentId);

            if (!isMounted) return;

            if (!result?.success || !result?.data) {
                const message =
                    result?.message || 'Không thể tải thông tin thanh toán.';

                setErrorMessage(message);
                setIsLoading(false);
                toast.error(message);
                return;
            }

            setResultCheckout(result.data || {});
            setIsLoading(false);
        };

        fetchCheckout().catch((error) => {
            if (!isMounted) return;

            const message =
                error?.message || 'Không thể tải thông tin thanh toán.';

            setErrorMessage(message);
            setIsLoading(false);
            toast.error(message);
        });

        return () => {
            isMounted = false;
        };
    }, [payment_id]);

    useEffect(() => {
        const safePaymentId = normalizeText(payment_id);

        if (!safePaymentId) return;

        let isMounted = true;
        let intervalId = null;

        const checkPaymentStatus = async () => {
            try {
                const result = await checkStatus(safePaymentId);

                if (!isMounted) return;

                if (!result?.success || !result?.data) {
                    return;
                }

                const status = normalizeText(result.data?.status).toUpperCase();

                setResultCheckout((prev) => ({
                    ...prev,

                    // Giữ data detail cũ để không mất plan/addon
                    ...result.data,

                    // Chuẩn hóa status
                    status,
                }));

                if (status === 'PAID') {
                    if (intervalId) {
                        clearInterval(intervalId);
                    }

                    toast.success(
                        'Thanh toán thành công. Tài khoản đã được kích hoạt.',
                    );

                    setTimeout(() => {
                        navigate(
                            config.router.paymentSuccess.replace(
                                ':orderId',
                                safePaymentId,
                            ),
                            {
                                replace: true,
                            },
                        );
                    }, 1200);
                }

                if (
                    status === 'FAILED' ||
                    status === 'CANCELED' ||
                    status === 'REFUNDED'
                ) {
                    if (intervalId) {
                        clearInterval(intervalId);
                    }

                    toast.error('Thanh toán thất bại hoặc đã bị hủy.');

                    setTimeout(() => {
                        navigate(
                            config.router.paymentSuccess.replace(
                                ':orderId',
                                safePaymentId,
                            ),
                            {
                                replace: true,
                            },
                        );
                    }, 1200);
                }
            } catch (error) {
                console.log('CHECK PAYMENT STATUS ERROR:', error);
            }
        };

        checkPaymentStatus();

        intervalId = setInterval(() => {
            checkPaymentStatus();
        }, 3000);

        return () => {
            isMounted = false;

            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [payment_id, navigate]);

    const checkoutForRender = useMemo(() => {
        const normalized = normalizeOrderForUi(resultCheckout || {});

        const plan =
            resultCheckout?.plan ||
            resultCheckout?.package ||
            resultCheckout?.paymentable ||
            resultCheckout?.subscription?.plan ||
            normalized?.plan ||
            normalized?.package ||
            null;

        const addon =
            resultCheckout?.addon ||
            resultCheckout?.addOn ||
            resultCheckout?.addon_package ||
            resultCheckout?.addonPackage ||
            resultCheckout?.ai_addon_package ||
            normalized?.addon ||
            normalized?.addOn ||
            null;

        const paymentableType = normalizeText(
            resultCheckout?.paymentable_type ||
                resultCheckout?.paymentableType ||
                normalized?.paymentable_type ||
                normalized?.paymentableType,
        ).toUpperCase();

        const displayItem = addon || plan || {};

        const displayName =
            displayItem?.name ||
            resultCheckout?.name ||
            resultCheckout?.title ||
            normalized?.name ||
            normalized?.title ||
            '';

        const displayDescription =
            displayItem?.description ||
            resultCheckout?.description ||
            normalized?.description ||
            '';

        const displayPrice =
            displayItem?.price ||
            resultCheckout?.amount ||
            resultCheckout?.amount_cents ||
            normalized?.amount ||
            0;

        const displayCurrency =
            displayItem?.currency ||
            resultCheckout?.currency ||
            normalized?.currency ||
            'VND';

        const displayBillingCycle = plan?.billing_cycle || '';

        const safeAmount = toNumber(
            normalized?.amount ||
                resultCheckout?.amount_cents ||
                resultCheckout?.amount ||
                displayPrice,
        );

        return {
            ...resultCheckout,
            ...normalized,

            plan,
            addon,
            paymentable_type: paymentableType,

            amount_cents: safeAmount > 0 ? safeAmount : 0,

            qrCode:
                resultCheckout?.qrCode ||
                resultCheckout?.qr_code ||
                normalized?.qrCode ||
                normalized?.qrCodeUrl ||
                '',

            bank:
                resultCheckout?.bank ||
                resultCheckout?.bankName ||
                normalized?.bank ||
                normalized?.bankName ||
                '',

            acc:
                resultCheckout?.acc ||
                resultCheckout?.accountNumber ||
                resultCheckout?.account_number ||
                normalized?.accountNumber ||
                normalized?.account_number ||
                '',

            order_code:
                resultCheckout?.order_code ||
                normalized?.orderCode ||
                normalized?.orderId ||
                '',

            status:
                resultCheckout?.status ||
                normalized?.status ||
                'PENDING',

            paid_at:
                resultCheckout?.paid_at ||
                normalized?.paid_at ||
                null,

            // Field an toàn cho UI, tránh undefined
            displayName,
            displayDescription,
            displayPrice,
            displayCurrency,
            displayBillingCycle,
            displayRuns: addon?.runs || null,

            // Field fallback để component cũ vẫn đọc được
            name: displayName,
            description: displayDescription,
            price: displayPrice,
            currency: displayCurrency,
            billing_cycle: displayBillingCycle,
            runs: addon?.runs || null,
        };
    }, [resultCheckout]);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                <div className={cx('page-head')}>
                    <div>
                        <h1 className={cx('title')}>Hoàn tất thanh toán.</h1>
                        <p className={cx('subtitle')}>
                            Kích hoạt tự động ngay sau khi chuyển khoản thành
                            công. Không cần tải lại trang.
                        </p>
                    </div>
                </div>

                <div className={cx('content-grid')}>
                    <aside className={cx('left-column')}>
                        {!isLoading && !errorMessage ? (
                            <PackageCard pkg={checkoutForRender} />
                        ) : null}

                        <div className={cx('guide-card')}>
                            <h3 className={cx('guide-title')}>
                                Hướng dẫn thanh toán
                            </h3>

                            <div className={cx('guide-list')}>
                                {GUIDE_STEPS.map((step, index) => (
                                    <div
                                        key={step.title}
                                        className={cx('guide-item')}
                                    >
                                        <span className={cx('guide-index')}>
                                            {index + 1}
                                        </span>

                                        <div>
                                            <p
                                                className={cx(
                                                    'guide-item-title',
                                                )}
                                            >
                                                {step.title}
                                            </p>
                                            <p
                                                className={cx(
                                                    'guide-item-desc',
                                                )}
                                            >
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                    <section className={cx('right-column')}>
                        {isLoading ? (
                            <div className={cx('security-note')}>
                                Đang tải thông tin thanh toán...
                            </div>
                        ) : errorMessage ? (
                            <>
                                <div className={cx('security-note')}>
                                    {errorMessage}
                                </div>

                                <button
                                    type="button"
                                    className={cx('btn-inline')}
                                    onClick={() =>
                                        navigate(config.router.upgradePremium, {
                                            replace: true,
                                        })
                                    }
                                >
                                    Quay lại trang nâng cấp
                                </button>
                            </>
                        ) : (
                            <QRCodeScreen pkg={checkoutForRender} />
                        )}
                    </section>
                </div>

                <div className={cx('footer')}>
                    <span>
                        © 2026 CVPROAI. SECURELY PROCESSED VIA LEDGER PROTOCOL.
                    </span>
                    <span>TERMS · PRIVACY · SECURITY · SUPPORT</span>
                </div>
            </div>
        </div>
    );
}

export default Payment;