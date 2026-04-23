import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { FaCheckCircle, FaCopy, FaRegClock, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import styles from '~/pages/User/Payment/Payment.module.scss';
import { PAYMENT_METHOD } from '../../Payment.constants';

const cx = classNames.bind(styles);

const EXPIRE_IN_SECONDS = 15 * 60;

const normalizeAccountNumber = (value) => {
    return String(value || '')
        .replace(/\s+/g, '')
        .replace(/(.{4})/g, '$1 ')
        .trim();
};

function QRCodeScreen({ pkg }) {
    const [remainingSeconds, setRemainingSeconds] = useState(EXPIRE_IN_SECONDS);

    const displayTimer = `${String(Math.floor(remainingSeconds / 60)).padStart(2, '0')}:${String(
        remainingSeconds % 60,
    ).padStart(2, '0')}`;

    const bankName = pkg?.bank || 'MB Bank (Ngân hàng Quân Đội)';
    const accountName = pkg?.acc || 'CVPRO AI';
    const order_code = pkg?.order_code;

    const copyText = async (value, label) => {
        try {
            if (!value) {
                return;
            }

            await navigator.clipboard.writeText(String(value));
            toast.success(`Đã sao chép ${label}`);
        } catch {
            toast.error('Không thể sao chép. Vui lòng thử lại.');
        }
    };

    if (!pkg?.qrCode) {
        return (
            <div className={cx('gateway-card')}>
                <div className={cx('gateway-head')}>
                    <div className={cx('gateway-brand')}>
                        <span className={cx('brand-icon')}>P</span>
                        <div>
                            <h3>{}</h3>
                            <p>Xử lý qua {}</p>
                        </div>
                    </div>
                    {/* 
                    <span className={cx('status-pill', 'idle')}>
                        {isProcessing
                            ? 'Đang tạo giao dịch...'
                            : 'Sẵn sàng tạo giao dịch'}
                    </span> */}
                </div>

                {/* <div className={cx('empty-state')}>
                    <div className={cx('empty-qr')}></div>
                    <h4>
                        {isProcessing
                            ? 'Đang khởi tạo mã QR...'
                            : 'Không thể tạo mã QR'}
                    </h4>
                    <p>
                        {isProcessing
                            ? 'Vui lòng chờ trong giây lát, hệ thống đang tự động tạo giao dịch SePay cho bạn.'
                            : 'Vui lòng tạo lại giao dịch để nhận mã QR mới.'}
                    </p>
                </div>

                {!isProcessing && (
                    <button
                        type="button"
                        className={cx('btn-inline')}
                        onClick={() => onCreateOrder({ force: true })}
                    >
                        Tạo lại mã QR
                    </button>
                )} */}
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
                    Đang chờ thanh toán...
                </span>
            </div>

            <div className={cx('gateway-body')}>
                <div>
                    <div className={cx('qr-shell')}>
                        <div className={cx('qr-frame')}>
                            <img src={pkg?.qrCode} alt="QR thanh toán SePay" />
                            <span className={cx('scan-line')}></span>
                            <span
                                className={cx('qr-corner', 'corner-top-left')}
                            ></span>
                            <span
                                className={cx('qr-corner', 'corner-top-right')}
                            ></span>
                            <span
                                className={cx(
                                    'qr-corner',
                                    'corner-bottom-left',
                                )}
                            ></span>
                            <span
                                className={cx(
                                    'qr-corner',
                                    'corner-bottom-right',
                                )}
                            ></span>
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
                            <strong>{accountName}</strong>
                            <button
                                type="button"
                                onClick={() =>
                                    copyText(
                                        accountName.replace(/\s+/g, ''),
                                        'số tài khoản',
                                    )
                                }
                            >
                                <FaCopy /> Copy
                            </button>
                        </div>
                    </div>

                    <div className={cx('amount-box')}>
                        <p>Số tiền</p>
                        <strong>{pkg?.amount_cents ?? 0}</strong>

                        <p>Nội dung</p>
                        <div className={cx('copy-line')}>
                            <strong>{order_code}</strong>
                            <button
                                type="button"
                                onClick={() =>
                                    copyText(
                                        order_code,
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
                        // onClick={onCancelOrder}
                    >
                        Hủy giao dịch
                    </button>

                    <button
                        type="button"
                        className={cx('btn-inline', 'btn-confirm')}
                        // onClick={onManualCheck}
                        // disabled={isManualChecking}
                    >
                        Tôi đã thanh toán
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QRCodeScreen;
