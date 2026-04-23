import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import styles from './Payment.module.scss';
import { config } from '~/config';

import { getDetailCheckout } from '~/services/payment.service';

import PackageCard from './components/PackageCard';
import QRCodeScreen from './components/QRCodeScreen';
import { GUIDE_STEPS } from './Payment.constants';

const cx = classNames.bind(styles);

function Payment() {
    const { payment_id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [reusltCheckout, setResultCheckout] = useState({});
    useEffect(() => {
        const fetchApi = async () => {
            const result = await getDetailCheckout(payment_id);
            if (!result.success) {
                // hiển thị thông báo lỗi
            }
            setResultCheckout(result.data);
        };
        fetchApi();
    }, [payment_id]);
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
                        <PackageCard pkg={reusltCheckout} />

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
                        <QRCodeScreen pkg={reusltCheckout} />
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
