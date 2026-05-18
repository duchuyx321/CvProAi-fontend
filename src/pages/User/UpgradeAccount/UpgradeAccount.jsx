import { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    History,
    Star,
    Brain,
    Download,
    ShieldCheck,
    Check,
} from 'lucide-react';
import { toast } from 'react-toastify';

import Button from '~/components/Button';
import { useAuth } from '~/context/AuthContext';
import { getPricing } from '~/services/pricing.service';
import {
    createPayment,
    getAiAddonPackages,
} from '~/services/upgrade.service';
import { config } from '~/config';

import CompareTable from './components/CompareTable';
import styles from './UpgradeAccount.module.scss';

const cx = classNames.bind(styles);

const PLAN_BENEFIT_CONFIG = [
    {
        key: 'cv_limit',
        icon: <FileText />,
        label: 'Giới hạn tạo CV',
        suffix: 'CV/tháng',
        tone: 'primary',
    },
    {
        key: 'ai_limit',
        icon: <Brain />,
        label: 'Phân tích bằng AI',
        suffix: 'lượt AI/tháng',
        tone: 'purple',
    },
    {
        key: 'export_limit',
        icon: <Download />,
        label: 'Xuất file PDF',
        suffix: 'lượt export/tháng',
        tone: 'info',
    },
    {
        key: 'remove_watermark',
        icon: <ShieldCheck />,
        label: 'Bản quyền',
        tone: 'success',
        format: (value) => (value ? 'Không Watermark' : 'Watermark cơ bản'),
    },
];

function normalizeSlug(value = '') {
    return String(value).trim().toLowerCase();
}

function toNumber(value) {
    return Number(value) || 0;
}

function formatPrice(value, currency = 'VND') {
    const amount = toNumber(value);

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(amount);
}

function getBillingText(value) {
    if (value === 'MONTH') return '/tháng';
    if (value === 'YEAR') return '/năm';

    return '';
}

function getPlanList(result) {
    return Array.isArray(result?.data?.data) ? result.data.data : [];
}

function getAddonList(result) {
    return Array.isArray(result?.data) ? result.data : [];
}

function buildPlanBenefits(plan = {}) {
    return PLAN_BENEFIT_CONFIG.map((item) => {
        const value = plan?.[item.key];

        return {
            ...item,
            value: item.format
                ? item.format(value)
                : `${toNumber(value)} ${item.suffix}`,
        };
    });
}

function buildPlanFeatures(plan = {}) {
    const features = [
        `${toNumber(plan.cv_limit)} CV/tháng`,
        `${toNumber(plan.ai_limit)} lượt AI phân tích/tháng`,
        `${toNumber(plan.export_limit)} lượt Export PDF`,
        plan.remove_watermark ? 'Không có Watermark' : 'Có Watermark',
        plan.view_full_ai_analysis
            ? 'Xem đầy đủ phân tích AI'
            : 'Phân tích AI cơ bản',
        plan.priority_support ? 'Hỗ trợ ưu tiên' : 'Hỗ trợ tiêu chuẩn',
    ];

    if (plan.can_purchase_ai_addon) {
        features.push('Được mua thêm lượt phân tích AI');
    }

    return features;
}

function UpgradeAccount() {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [plans, setPlans] = useState([]);
    const [addonPackages, setAddonPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addonLoading, setAddonLoading] = useState(true);
    const [buyingAddonId, setBuyingAddonId] = useState('');

    const authCurrentPlan = user?.planCurrent || null;

    const currentPlan = useMemo(() => {
        if (!authCurrentPlan) return null;

        const matchedPlan = plans.find((plan) => {
            const sameId = plan?.id && plan.id === authCurrentPlan.id;
            const sameSlug =
                normalizeSlug(plan?.slug) ===
                normalizeSlug(authCurrentPlan?.slug);

            return sameId || sameSlug;
        });

        if (!matchedPlan) return authCurrentPlan;

        return {
            ...authCurrentPlan,
            ...matchedPlan,
        };
    }, [authCurrentPlan, plans]);

    const currentPlanSlug = normalizeSlug(currentPlan?.slug);
    const currentPlanPrice = toNumber(currentPlan?.price);
    const canBuyAiAddon = Boolean(currentPlan?.can_purchase_ai_addon);

    useEffect(() => {
        let cancelled = false;

        const fetchPlans = async () => {
            try {
                setLoading(true);

                const result = await getPricing();

                if (result?.status >= 400 || result?.success === false) {
                    throw new Error(
                        result?.message ||
                        result?.messsage ||
                        'Không thể tải danh sách gói dịch vụ',
                    );
                }

                const activePlans = getPlanList(result)
                    .filter((plan) => plan?.is_active)
                    .sort((a, b) => toNumber(a.price) - toNumber(b.price));

                if (!cancelled) {
                    setPlans(activePlans);
                }
            } catch (error) {
                if (!cancelled) {
                    toast.error(
                        error?.response?.data?.message ||
                        error?.response?.data?.messsage ||
                        error?.message ||
                        'Có lỗi xảy ra khi tải danh sách gói dịch vụ',
                    );
                    setPlans([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchPlans();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;

        const fetchAddonPackages = async () => {
            try {
                setAddonLoading(true);

                const result = await getAiAddonPackages({
                    page: 1,
                    limit: 20,
                    search: '',
                    sort_by: 'createdAt',
                    sort_order: 'DESC',
                    // is_trash: false,
                });

                if (result?.status >= 400 || result?.success === false) {
                    throw new Error(
                        result?.message ||
                        result?.messsage ||
                        'Không thể tải danh sách gói mua thêm',
                    );
                }

                const activeAddons = getAddonList(result)
                    .filter((item) => item?.is_active)
                    .sort((a, b) => toNumber(a.price) - toNumber(b.price));

                if (!cancelled) {
                    setAddonPackages(activeAddons);
                }
            } catch (error) {
                if (!cancelled) {
                    toast.error(
                        error?.response?.data?.message ||
                        error?.response?.data?.messsage ||
                        error?.message ||
                        'Có lỗi xảy ra khi tải gói mua thêm',
                    );
                    setAddonPackages([]);
                }
            } finally {
                if (!cancelled) {
                    setAddonLoading(false);
                }
            }
        };

        fetchAddonPackages();

        return () => {
            cancelled = true;
        };
    }, []);

    const currentBenefits = useMemo(() => {
        return buildPlanBenefits(currentPlan || {});
    }, [currentPlan]);

    const upgradePlans = useMemo(() => {
        if (!currentPlan) return [];

        return plans.filter((plan) => {
            const planSlug = normalizeSlug(plan.slug);

            if (planSlug === currentPlanSlug) return false;

            return toNumber(plan.price) > currentPlanPrice;
        });
    }, [plans, currentPlan, currentPlanSlug, currentPlanPrice]);

    const handleGoHistory = () => {
        navigate(config.router.history);
    };

    const handleManagePlan = () => {
        navigate(config.router.package);
    };

    const handleUpgradePlan = (plan) => {
        if (!isAuthenticated) {
            navigate(config.router.login);
            return;
        }

        if (!plan?.slug) return;

        navigate(config.router.upgradeOptions.replace(':slug', plan.slug));
    };

    const handleBuyAddon = async (addon) => {
        if (!isAuthenticated) {
            navigate(config.router.login);
            return;
        }

        if (!canBuyAiAddon) {
            toast.warning(
                'Gói hiện tại của bạn chưa hỗ trợ mua thêm lượt phân tích AI.',
            );
            return;
        }

        if (!addon?.id) {
            toast.error('Không tìm thấy gói mua thêm.');
            return;
        }

        try {
            setBuyingAddonId(addon.id);

            const paymentPromise = createPayment(
                'AI_ADDON',
                undefined,
                addon.id,
            ).then((result) => {
                if (!result?.success) {
                    throw new Error(
                        result?.message ||
                        result?.messsage ||
                        'Hệ thống đang xảy ra lỗi, vui lòng thử lại sau vài phút.',
                    );
                }

                return result;
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
                            'Hệ thống đang xảy ra lỗi, vui lòng thử lại sau ít phút'
                        );
                    },
                },
            });

            const paymentId = result?.data?.payment_id;

            if (!paymentId) {
                toast.error('Không tìm thấy mã thanh toán.');
                return;
            }

            navigate(config.router.payment.replace(':payment_id', paymentId));
        } catch {
            // toast.promise đã hiển thị lỗi rồi
        } finally {
            setBuyingAddonId('');
        }
    };

    return (
        <main className={cx('wrapper')}>
            <div className={cx('inner')}>
                <header className={cx('pageHeader')}>
                    <div>
                        <h1>Trung tâm gói dịch vụ</h1>
                        <p>
                            Quản lý gói hiện tại, mua thêm lượt AI và nâng cấp
                            khi cần.
                        </p>
                    </div>

                    <Button
                        type="button"
                        className={cx('historyBtn')}
                        leftIcon={<History size={16} />}
                        onClick={handleGoHistory}
                    >
                        Lịch sử giao dịch
                    </Button>
                </header>

                {loading ? (
                    <div className={cx('loadingCard')}>
                        Đang tải thông tin gói...
                    </div>
                ) : (
                    <>
                        <section className={cx('currentPlanCard')}>
                            <div className={cx('currentLeft')}>
                                <span className={cx('planBadge')}>
                                    <Star size={14} />
                                    Gói hiện tại
                                </span>

                                <h2>{currentPlan?.name || '--'}</h2>

                                <div className={cx('priceLine')}>
                                    <strong>
                                        {formatPrice(
                                            currentPlan?.price,
                                            currentPlan?.currency,
                                        )}
                                    </strong>

                                    <span>
                                        {getBillingText(
                                            currentPlan?.billing_cycle,
                                        )}
                                    </span>
                                </div>

                                <p className={cx('activeText')}>
                                    {currentPlan?.is_active
                                        ? 'Gói đang được áp dụng cho tài khoản'
                                        : 'Gói hiện không còn hoạt động'}
                                </p>

                                <div className={cx('currentActions')}>
                                    <Button
                                        primary
                                        type="button"
                                        onClick={handleManagePlan}
                                    >
                                        Quản lý gói
                                    </Button>

                                    <Button
                                        type="button"
                                        className={cx('outlineBtn')}
                                    >
                                        Xem quyền lợi
                                    </Button>
                                </div>
                            </div>

                            <div className={cx('benefitPanel')}>
                                <h3>
                                    Quyền lợi Gói {currentPlan?.name || '--'}
                                </h3>

                                <div className={cx('benefitGrid')}>
                                    {currentBenefits.map((item) => (
                                        <div
                                            key={item.key}
                                            className={cx('benefitItem')}
                                        >
                                            <span
                                                className={cx(
                                                    'benefitIcon',
                                                    item.tone,
                                                )}
                                            >
                                                {item.icon}
                                            </span>

                                            <div>
                                                <p>{item.label}</p>
                                                <strong>{item.value}</strong>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section className={cx('section')}>
                            <h2 className={cx('sectionTitle')}>
                                Gói mở rộng (Add-on)
                            </h2>

                            {!canBuyAiAddon ? (
                                <div className={cx('addonLocked')}>
                                    Gói hiện tại của bạn chưa hỗ trợ mua thêm
                                    lượt phân tích AI. Vui lòng nâng cấp lên gói
                                    có hỗ trợ add-on để sử dụng tính năng này.
                                </div>
                            ) : addonLoading ? (
                                <div className={cx('addonLocked')}>
                                    Đang tải danh sách gói mua thêm...
                                </div>
                            ) : addonPackages.length === 0 ? (
                                <div className={cx('addonLocked')}>
                                    Hiện chưa có gói mua thêm nào.
                                </div>
                            ) : (
                                <div className={cx('addonGrid')}>
                                    {addonPackages.map((addon, index) => {
                                        const isBuying =
                                            buyingAddonId === addon.id;
                                        const isPopular = index === 1;

                                        return (
                                            <article
                                                key={addon.id}
                                                className={cx('addonCard', {
                                                    popular: isPopular,
                                                })}
                                            >
                                                {isPopular ? (
                                                    <span
                                                        className={cx(
                                                            'addonBadge',
                                                        )}
                                                    >
                                                        Phổ biến
                                                    </span>
                                                ) : null}

                                                <h3>{addon.name}</h3>

                                                <strong>
                                                    {formatPrice(
                                                        addon.price,
                                                        addon.currency || 'VND',
                                                    )}
                                                </strong>

                                                <p>
                                                    {addon.description ||
                                                        `+${addon.runs || 0} lượt phân tích CV bằng AI.`}
                                                </p>

                                                <Button
                                                    type="button"
                                                    primary={isPopular}
                                                    className={cx('addonBtn')}
                                                    disabled={
                                                        isBuying ||
                                                        Boolean(buyingAddonId)
                                                    }
                                                    onClick={() =>
                                                        handleBuyAddon(addon)
                                                    }
                                                >
                                                    {isBuying
                                                        ? 'Đang tạo đơn hàng...'
                                                        : 'Mua ngay'}
                                                </Button>
                                            </article>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {upgradePlans.length > 0 ? (
                            <section className={cx('section')}>
                                <h2 className={cx('sectionTitle')}>
                                    Nâng cấp để mở khóa nhiều quyền lợi hơn
                                </h2>

                                <div className={cx('upgradeList')}>
                                    {upgradePlans.map((plan) => {
                                        const features =
                                            buildPlanFeatures(plan);

                                        return (
                                            <article
                                                key={plan.id}
                                                className={cx('upgradeCard')}
                                            >
                                                <div
                                                    className={cx(
                                                        'upgradeInfo',
                                                    )}
                                                >
                                                    <span
                                                        className={cx(
                                                            'recommendBadge',
                                                        )}
                                                    >
                                                        Khuyên dùng
                                                    </span>

                                                    <h3>{plan.name}</h3>

                                                    <div
                                                        className={cx(
                                                            'upgradePrice',
                                                        )}
                                                    >
                                                        {formatPrice(
                                                            plan.price,
                                                            plan.currency,
                                                        )}
                                                        <span>
                                                            {getBillingText(
                                                                plan.billing_cycle,
                                                            )}
                                                        </span>
                                                    </div>

                                                    <p>{plan.description}</p>

                                                    <Button
                                                        primary
                                                        type="button"
                                                        onClick={() =>
                                                            handleUpgradePlan(
                                                                plan,
                                                            )
                                                        }
                                                    >
                                                        Nâng cấp lên {plan.name}
                                                    </Button>
                                                </div>

                                                <ul
                                                    className={cx(
                                                        'upgradeFeatures',
                                                    )}
                                                >
                                                    {features.map((feature) => (
                                                        <li key={feature}>
                                                            <Check size={16} />
                                                            <span>
                                                                {feature}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </article>
                                        );
                                    })}
                                </div>
                            </section>
                        ) : null}

                        <CompareTable
                            plans={plans}
                            currentPlanSlug={currentPlanSlug}
                        />
                    </>
                )}
            </div>
        </main>
    );
}

export default UpgradeAccount;