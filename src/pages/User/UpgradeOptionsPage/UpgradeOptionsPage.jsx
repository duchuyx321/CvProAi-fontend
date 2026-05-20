import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import { FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

import { config } from '~/config';
import { createPayment, getPackageBySlug } from '~/services/upgrade.service';
import styles from './UpgradeOptionsPage.module.scss';
import Button from '~/components/Button';

const cx = classNames.bind(styles);

const toSafeNumber = (value, fallback = 0) => {
    const parsed = Number(
        String(value ?? '')
            .replace(/,/g, '')
            .trim(),
    );
    return Number.isFinite(parsed) ? parsed : fallback;
};

const resolvePlanFeatures = (plan = {}) => {
    if (Array.isArray(plan?.features) && plan.features.length > 0) {
        return plan.features
            .map((feature) =>
                typeof feature === 'string' ? feature : feature?.text,
            )
            .filter(Boolean);
    }

    const features = [];
    const aiLimit = toSafeNumber(plan?.ai_limit ?? plan?.aiLimit, 0);
    const cvLimit = toSafeNumber(plan?.cv_limit ?? plan?.cvLimit, 0);
    const exportLimit = toSafeNumber(
        plan?.export_limit ?? plan?.exportLimit,
        0,
    );

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

const getAddOnRuns = (pack = {}) =>
    toSafeNumber(pack?.runs ?? pack?.credits, 0);
const formatCurrency = (amount) =>
    `${new Intl.NumberFormat('vi-VN').format(toSafeNumber(amount, 0))} đ`;

function UpgradeOptionsPage() {
    const { slug } = useParams();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [resultPackages, setResultPackages] = useState(null);
    const [selectedPlan, setSelectedPlan] = useState({
        plan: null,
        addon: null,
    });
    useEffect(() => {
        const fetchApi = async () => {
            const result = await getPackageBySlug(slug);
            if (result?.success) {
                setResultPackages(result.data);
                setSelectedPlan({
                    plan: result.data?.plan || null,
                    addon: null,
                });
                setIsLoading(false);
            }
        };
        fetchApi();
    }, [slug]);

    if (isLoading) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('loading')}>
                    Đang tải tùy chọn nâng cấp...
                </div>
            </div>
        );
    }
    const handleContinuePayment = async () => {
        setIsLoadingPayment(true);
        console.log(selectedPlan);
        try {
            const paymentPromise = fetchApi({
                plan_id: selectedPlan.plan?.id,
                addon_package_id: selectedPlan?.addon?.id || null,
            });
            const result = await toast.promise(paymentPromise, {
                pending: 'Đang tạo đơn hàng...',
                success: {
                    render() {
                        return 'Khởi tạo đơn hàng thành công.';
                    },
                },
                error: {
                    render({ data }) {
                        return (
                            data?.message ||
                            'Hệ thống đang xảy ra lỗi vui lòng thử lại sau ít phút'
                        );
                    },
                },
            });
            setTimeout(() => {
                navigate(
                    navigate(
                        config.router.payment.replace(
                            ':payment_id',
                            result?.data?.payment_id,
                        ),
                    ),
                ); //
            }, 800);
        } catch (error) {
            console.log('Login error:', error);
        } finally {
            setIsLoadingPayment(false);
        }
    };
    const fetchApi = async ({ plan_id, addon_package_id }) => {
        let paymentable_type = 'SUBSCRIPTION';
        if (plan_id && !addon_package_id) {
            paymentable_type = 'SUBSCRIPTION';
        }
        if (!plan_id && addon_package_id) {
            paymentable_type = 'AI_ADDON';
        }
        if (plan_id && addon_package_id) {
            paymentable_type = 'BOTH';
        }
        const result = await createPayment(
            paymentable_type,
            plan_id,
            addon_package_id,
        );
        if (!result?.success) {
            throw new Error(
                result?.message ||
                    'Hệ thống đang xảy ra lỗi vui lòng thử lại sau vài phút.',
            );
        }
        return result;
    };
    return (
        <div className={cx('wrapper')}>
            <div className={cx('content-grid')}>
                <section className={cx('premium-section')}>
                    <div className={cx('section-head')}>
                        <p className={cx('eyebrow')}>Gói đã chọn</p>
                        <h1>{resultPackages?.plan?.name}</h1>
                    </div>

                    <article className={cx('premium-card')}>
                        <div className={cx('premium-price')}>
                            <strong>
                                {formatCurrency(resultPackages?.plan?.price)}
                            </strong>
                            <span>
                                {resultPackages?.plan?.interval || '/ tháng'}
                            </span>
                        </div>

                        <p className={cx('premium-desc')}>
                            {resultPackages?.plan.description}
                        </p>

                        <ul className={cx('feature-list')}>
                            {resolvePlanFeatures(resultPackages?.plan).map(
                                (feature) => (
                                    <li key={feature}>
                                        <FiCheckCircle />
                                        <span>{feature}</span>
                                    </li>
                                ),
                            )}
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
                        className={cx('none-option', {
                            active: !selectedPlan,
                        })}
                        onClick={() =>
                            setSelectedPlan((prev) => ({
                                ...prev,
                                addon: null,
                            }))
                        }
                    >
                        Không mua thêm lượt AI
                    </button>

                    <div className={cx('addon-list')}>
                        {resultPackages?.addon.map((pack) => {
                            const runs = getAddOnRuns(pack);

                            return (
                                <button
                                    key={pack.id}
                                    type="button"
                                    className={cx('addon-card', {
                                        active:
                                            selectedPlan.addon?.id === pack.id,
                                        best: Boolean(pack.isBestValue),
                                    })}
                                    onClick={() =>
                                        setSelectedPlan((prev) => ({
                                            ...prev,
                                            addon: pack,
                                        }))
                                    }
                                >
                                    <div className={cx('addon-badges')}>
                                        {pack.isBestValue ? (
                                            <span className={cx('best-badge')}>
                                                Giá trị tốt
                                            </span>
                                        ) : null}
                                    </div>

                                    <div className={cx('addon-main')}>
                                        <h3>
                                            {pack?.name ||
                                                `${runs} lượt phân tích AI`}
                                        </h3>
                                        <strong>
                                            {formatCurrency(pack.price)}
                                        </strong>
                                    </div>

                                    <p className={cx('addon-label')}>
                                        {pack?.description ||
                                            pack?.label ||
                                            `${runs} lượt AI`}
                                    </p>
                                    {pack?.savingText ? (
                                        <p className={cx('saving-text')}>
                                            {pack.savingText}
                                        </p>
                                    ) : null}
                                </button>
                            );
                        })}
                    </div>

                    <div className={cx('summary-card')}>
                        <div className={cx('summary-row')}>
                            <span>{selectedPlan.plan?.name}</span>
                            <strong>
                                {formatCurrency(selectedPlan?.plan?.price)}
                            </strong>
                        </div>
                        <div className={cx('summary-row')}>
                            <span>Add-on AI</span>
                            <strong>
                                {selectedPlan
                                    ? `${formatCurrency(selectedPlan.addon?.price)}`
                                    : '0 đ'}
                            </strong>
                        </div>
                        <div className={cx('summary-row', 'summary-total')}>
                            <span>Tổng thanh toán</span>
                            <strong>
                                {formatCurrency(
                                    Number(selectedPlan.plan?.price ?? 0) +
                                        Number(selectedPlan.addon?.price ?? 0),
                                )}
                            </strong>
                        </div>

                        <Button
                            type="button"
                            className={cx('btn-continue')}
                            onClick={() => handleContinuePayment()}
                            disabled={isLoadingPayment}
                        >
                            Tiếp tục thanh toán
                        </Button>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default UpgradeOptionsPage;
