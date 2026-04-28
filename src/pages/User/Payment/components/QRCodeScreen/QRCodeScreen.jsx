import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { FaCopy, FaRegClock, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

import styles from '~/pages/User/Payment/Payment.module.scss';
import { PAYMENT_METHOD } from '../../Payment.constants';

const cx = classNames.bind(styles);

const EXPIRE_IN_SECONDS = 15 * 60;

const normalizeAccountNumber = (value) =>
    String(value || '')
        .replace(/\s+/g, '')
        .replace(/(.{4})/g, '$1 ')
        .trim();

const toSafeNumber = (value, fallback = 0) => {
    const parsed = Number(String(value ?? '').replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : fallback;
};

function QRCodeScreen({
    pkg,
    onCancelOrder,
    onManualCheck,
    isManualChecking = false,
}) {
    const [remainingSeconds, setRemainingSeconds] = useState(EXPIRE_IN_SECONDS);

    const qrCodeUrl = String(pkg?.qrCode || '').trim();

    useEffect(() => {
        if (!qrCodeUrl) {
            setRemainingSeconds(EXPIRE_IN_SECONDS);
            return;
        }

        setRemainingSeconds(EXPIRE_IN_SECONDS);

        const timerId = window.setInterval(() => {
            setRemainingSeconds((prev) => {
                if (prev <= 1) {
                    window.clearInterval(timerId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            window.clearInterval(timerId);
        };
    }, [qrCodeUrl]);

    const displayTimer = useMemo(() => {
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, [remainingSeconds]);

    const bankName =
        pkg?.bank || pkg?.bankName || 'MB Bank (Ngân hàng Quân Đội)';
    const accountNumberRaw =
        pkg?.acc || pkg?.accountNumber || pkg?.account_number || '';
    const accountNumber = normalizeAccountNumber(accountNumberRaw);
    const accountName =
        pkg?.accountName || pkg?.account_name || pkg?.receiver_name || 'CVPRO AI';
    const transferContent =
        pkg?.order_code ||
        pkg?.orderCode ||
        pkg?.transferContent ||
        pkg?.description ||
        '';
    const paymentAmount = toSafeNumber(pkg?.amount_cents ?? pkg?.amount, 0);
    const paymentAmountLabel = `${new Intl.NumberFormat('vi-VN').format(paymentAmount)} đ`;
    const isExpired = remainingSeconds <= 0;

    const copyText = async (value, label) => {
        try {
            if (!value) {
                return;
            }

            if (!navigator?.clipboard?.writeText) {
                throw new Error('Clipboard unavailable');
            }

            await navigator.clipboard.writeText(String(value));
            toast.success(`Đã sao chép ${label}`);
        } catch {
            toast.error('Không thể sao chép. Vui lòng thử lại.');
        }
    };

    if (!qrCodeUrl) {
        return (
            <div className={cx('gateway-card')}>
                <div className={cx('gateway-head')}>
                    <div className={cx('gateway-brand')}>
                        <span className={cx('brand-icon')}>P</span>
                        <div>
                            <h3>{PAYMENT_METHOD.hint}</h3>
                            <p>Xử lý qua {PAYMENT_METHOD.label}</p>
                        </div>
                    </div>
                    <span className={cx('status-pill', 'idle')}>
                        Chưa có mã QR
                    </span>
                </div>

                <div className={cx('empty-state')}>
                    <div className={cx('empty-qr')}></div>
                    <h4>Không tìm thấy mã QR</h4>
                    <p>
                        Giao dịch chưa sẵn sàng hoặc đã hết hạn. Vui lòng thử
                        tạo lại giao dịch.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('gateway-card')}>
            <div className={cx('gateway-head')}>
                <div className={cx('gateway-brand')}>
                    <span className={cx('brand-icon')}>P</span>
                    <div>
                        <h3>{PAYMENT_METHOD.hint}</h3>
                        <p>Xử lý qua {PAYMENT_METHOD.label}</p>
                    </div>
                </div>

                <span className={cx('status-pill', 'pending')}>
                    <span className={cx('status-dot')}></span>
                    {isExpired ? 'Mã QR đã hết hạn' : 'Đang chờ thanh toán...'}
                </span>
            </div>

            <div className={cx('gateway-body')}>
                <div>
                    <div className={cx('qr-shell')}>
                        <div className={cx('qr-frame')}>
                            <img src={qrCodeUrl} alt="QR thanh toán SePay" />
                            <span className={cx('scan-line')}></span>
                            <span className={cx('qr-corner', 'corner-top-left')}></span>
                            <span className={cx('qr-corner', 'corner-top-right')}></span>
                            <span className={cx('qr-corner', 'corner-bottom-left')}></span>
                            <span className={cx('qr-corner', 'corner-bottom-right')}></span>
                        </div>
                    </div>

                    <div className={cx('timer-chip')}>
                        <FaRegClock />
                        <span>{displayTimer}</span>
                    </div>
                </div>

                <div className={cx('bank-box')}>
                    <div className={cx('info-row')}>
                        <p>Ngân hàng</p>
                        <strong>{bankName}</strong>
                    </div>

                    <div className={cx('info-row')}>
                        <p>Số tài khoản</p>
                        <div className={cx('copy-line')}>
                            <strong>{accountNumber || '--'}</strong>
                            <button
                                type="button"
                                onClick={() =>
                                    copyText(
                                        String(accountNumberRaw || '').replace(
                                            /\s+/g,
                                            '',
                                        ),
                                        'số tài khoản',
                                    )
                                }
                            >
                                <FaCopy /> Copy
                            </button>
                        </div>
                    </div>

                    <div className={cx('info-row')}>
                        <p>Chủ tài khoản</p>
                        <strong>{accountName}</strong>
                    </div>

                    <div className={cx('amount-box')}>
                        <p>Số tiền</p>
                        <strong>{paymentAmountLabel}</strong>

                        <p>Nội dung</p>
                        <div className={cx('copy-line')}>
                            <strong>{transferContent || '--'}</strong>
                            <button
                                type="button"
                                onClick={() =>
                                    copyText(
                                        transferContent,
                                        'nội dung chuyển khoản',
                                    )
                                }
                            >
                                <FaCopy /> Copy
                            </button>
                        </div>

                        <span className={cx('warning-note')}>
                            Vui lòng nhập đúng nội dung để hệ thống xử lý tự
                            động.
                        </span>
                    </div>
                </div>
            </div>

            <div className={cx('gateway-foot')}>
                <div className={cx('secure-chip')}>
                    <FaShieldAlt /> Mã hóa đầu cuối SSL 256-bit
                </div>

                <div className={cx('gateway-actions')}>
                    <button
                        type="button"
                        className={cx('btn-inline', 'btn-cancel')}
                        onClick={onCancelOrder}
                        disabled={!onCancelOrder}
                    >
                        Hủy giao dịch
                    </button>

                    <button
                        type="button"
                        className={cx('btn-inline', 'btn-confirm')}
                        onClick={onManualCheck}
                        disabled={!onManualCheck || isManualChecking}
                    >
                        {isManualChecking
                            ? 'Đang kiểm tra...'
                            : 'Tôi đã thanh toán'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QRCodeScreen;
