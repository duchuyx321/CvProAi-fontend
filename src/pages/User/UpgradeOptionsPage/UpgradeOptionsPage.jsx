import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import { FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

import { config } from '~/config';
import { getUpgradeOptionsByPackageId } from '~/services/upgrade.service';
import styles from './UpgradeOptionsPage.module.scss';

const cx = classNames.bind(styles);
const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

const isSafeId = (value) => SAFE_ID_PATTERN.test(String(value || '').trim());

const toSafeNumber = (value, fallback = 0) => {
    const parsed = Number(String(value ?? '').replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : fallback;
};

const resolvePlanFeatures = (plan = {}) => {
    if (Array.isArray(plan?.features) && plan.features.length > 0) {
        return plan.features.map((feature) => (typeof feature === 'string' ? feature : feature?.text)).filter(Boolean);
    }

    const features = [];
    const aiLimit = toSafeNumber(plan?.ai_limit ?? plan?.aiLimit, 0);
    const cvLimit = toSafeNumber(plan?.cv_limit ?? plan?.cvLimit, 0);
    const exportLimit = toSafeNumber(plan?.export_limit ?? plan?.exportLimit, 0);

    if (aiLimit > 0) {
        features.push(`${aiLimit} lượt phân tích AI / kỳ`);
    }

    if (cvLimit > 0) {
        features.push(`Tối đa ${cvLimit} CV`);
    }

    if (exportLimit > 0) {
        features.push(`Tối đa ${exportLimit} lượt xuất file`);
    }

    if (plan?.view_full_ai_analysis) {
        features.push('Xem đầy đủ kết quả phân tích AI');
    }

    if (plan?.premium_template) {
        features.push('Sử dụng toàn bộ template cao cấp');
    }

    if (plan?.remove_watermark) {
        features.push('Xuất file không watermark');
    }

    if (plan?.priority_support) {
        features.push('Hỗ trợ ưu tiên');
    }

    if (plan?.can_purchase_ai_addon) {
        features.push('Mua thêm gói AI add-on');
    }

    return features;
};

const getAddOnRuns = (pack = {}) => toSafeNumber(pack?.runs ?? pack?.credits, 0);

function UpgradeOptionsPage() {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const initialAddOnId = location.state?.checkout?.addOnPackId || location.state?.checkout?.addOn?.id || null;
    const normalizedPackageId = useMemo(() => String(packageId || '').trim(), [packageId]);

    const [isLoading, setIsLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [addOnPacks, setAddOnPacks] = useState([]);
    const [selectedAddOnId, setSelectedAddOnId] = useState(isSafeId(initialAddOnId) ? initialAddOnId : null);

    useEffect(() => {
        let isMounted = true;

        const fetchUpgradeOptions = async () => {
            if (!isSafeId(normalizedPackageId)) {
                toast.error('Mã gói nâng cấp không hợp lệ.');
                navigate(config.router.upgradePremium, { replace: true });
                return;
            }

            setIsLoading(true);

            const result = await getUpgradeOptionsByPackageId(normalizedPackageId);

            if (!isMounted) {
                return;
            }

            const plan = result?.data?.plan || null;
            const addOns = Array.isArray(result?.data?.addOns) ? result.data.addOns : [];

            if (!plan?.id) {
                toast.error(result?.message || 'Không thể tải thông tin gói nâng cấp.');
                navigate(config.router.upgradePremium, { replace: true });
                return;
            }

            if (!result?.success) {
                toast.warning(result?.message || 'Không lấy được dữ liệu mới nhất, đang dùng dữ liệu dự phòng.');
            }

            const safeAddOns = addOns.map((item, index) => ({
                ...item,
                id: item?.id || `addon_${index + 1}`,
                runs: getAddOnRuns(item),
            }));

            setSelectedPlan(plan);
            setAddOnPacks(safeAddOns);
            setSelectedAddOnId((prev) => {
                if (prev && safeAddOns.some((pack) => pack.id === prev)) {
                    return prev;
                }
                return null;
            });
            setIsLoading(false);
        };

        fetchUpgradeOptions().catch((error) => {
            if (isMounted) {
                setIsLoading(false);
                toast.error(error?.message || 'Không thể tải tùy chọn nâng cấp.');
            }
        });

        return () => {
            isMounted = false;
        };
    }, [navigate, normalizedPackageId]);

    const planFeatures = useMemo(() => resolvePlanFeatures(selectedPlan || {}), [selectedPlan]);

    const selectedAddOn = useMemo(
        () => addOnPacks.find((pack) => pack.id === selectedAddOnId) || null,
        [addOnPacks, selectedAddOnId],
    );

    const totalAmount = toSafeNumber(selectedPlan?.price, 0) + toSafeNumber(selectedAddOn?.price, 0);
    const formatCurrency = (amount) => `${new Intl.NumberFormat('vi-VN').format(toSafeNumber(amount, 0))} đ`;

    const handleContinuePayment = () => {
        if (!selectedPlan?.id) {
            toast.error('Không tìm thấy thông tin gói để thanh toán.');
            return;
        }

        const paymentPath = config.router.payment.replace(':packageId', selectedPlan.id);

        navigate(`${paymentPath}?autostart=1`, {
            state: {
                checkout: {
                    packageId: selectedPlan.id,
                    addOnPackId: selectedAddOn?.id || null,
                },
            },
        });
    };

    if (isLoading) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('loading')}>Đang tải tùy chọn nâng cấp...</div>
            </div>
        );
    }

    if (!selectedPlan) {
        return null;
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('content-grid')}>
                <section className={cx('premium-section')}>
                    <div className={cx('section-head')}>
                        <p className={cx('eyebrow')}>Gói đã chọn</p>
                        <h1>{selectedPlan.name}</h1>
                    </div>

                    <article className={cx('premium-card')}>
                        <div className={cx('premium-price')}>
                            <strong>{formatCurrency(selectedPlan.price)}</strong>
                            <span>{selectedPlan.interval || '/ tháng'}</span>
                        </div>

                        <p className={cx('premium-desc')}>{selectedPlan.description}</p>

                        <ul className={cx('feature-list')}>
                            {planFeatures.map((feature) => (
                                <li key={feature}>
                                    <FiCheckCircle />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </article>
                </section>

                <section className={cx('addons-section')}>
                    <div className={cx('section-head')}>
                        <p className={cx('eyebrow')}>One-time Add-on</p>
                        <h2>Mua thêm lượt AI</h2>
                    </div>

                    <button
                        type="button"
                        className={cx('none-option', { active: !selectedAddOnId })}
                        onClick={() => setSelectedAddOnId(null)}
                    >
                        Không mua thêm lượt AI
                    </button>

                    <div className={cx('addon-list')}>
                        {addOnPacks.map((pack) => {
                            const runs = getAddOnRuns(pack);

                            return (
                                <button
                                    key={pack.id}
                                    type="button"
                                    className={cx('addon-card', {
                                        active: selectedAddOnId === pack.id,
                                        best: Boolean(pack.isBestValue),
                                    })}
                                    onClick={() => setSelectedAddOnId(pack.id)}
                                >
                                    <div className={cx('addon-badges')}>
                                        {toSafeNumber(pack?.discountPercent, 0) > 0 ? (
                                            <span className={cx('discount-badge')}>-{toSafeNumber(pack.discountPercent)}%</span>
                                        ) : (
                                            <span className={cx('discount-badge', 'invisible')}>-0%</span>
                                        )}

                                        {pack.isBestValue ? <span className={cx('best-badge')}>Giá trị tốt</span> : null}
                                    </div>

                                    <div className={cx('addon-main')}>
                                        <h3>{pack?.name || `${runs} lượt phân tích AI`}</h3>
                                        <strong>{formatCurrency(pack.price)}</strong>
                                    </div>

                                    <p className={cx('addon-label')}>{pack?.description || pack?.label || `${runs} lượt AI`}</p>
                                    {pack?.savingText ? <p className={cx('saving-text')}>{pack.savingText}</p> : null}
                                </button>
                            );
                        })}
                    </div>

                    <div className={cx('summary-card')}>
                        <div className={cx('summary-row')}>
                            <span>{selectedPlan.name}</span>
                            <strong>{formatCurrency(selectedPlan.price)}</strong>
                        </div>
                        <div className={cx('summary-row')}>
                            <span>Add-on AI</span>
                            <strong>
                                {selectedAddOn ? `${formatCurrency(selectedAddOn.price)} (${getAddOnRuns(selectedAddOn)} lượt)` : '0 đ'}
                            </strong>
                        </div>
                        <div className={cx('summary-row', 'summary-total')}>
                            <span>Tổng thanh toán</span>
                            <strong>{formatCurrency(totalAmount)}</strong>
                        </div>

                        <button type="button" className={cx('btn-continue')} onClick={handleContinuePayment}>
                            Tiếp tục thanh toán
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default UpgradeOptionsPage;
