import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import classNames from 'classnames/bind';
import { FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { GiAlliedStar } from 'react-icons/gi';

import { config } from '~/config';
import { useAuth } from '~/context/AuthContext';
// import { getUpgradeFaqs, getUpgradePackages } from '~/services/upgrade.service';
import styles from './UpgradePremium.module.scss';

const cx = classNames.bind(styles);

const normalizeTier = (value) =>
    String(value || '')
        .trim()
        .toLowerCase();

const resolveIsCurrentPlan = (pkg, userTier) => {
    const packageId = String(pkg?.id || '').toLowerCase();
    const tier = normalizeTier(userTier);

    if (!tier || tier.includes('free')) {
        return packageId === 'free_plan';
    }

    if (tier.includes('premium')) {
        return packageId === 'premium_plan';
    }

    return false;
};

function UpgradePremium() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [packages, setPackages] = useState([]);

    const userTier = useMemo(
        () => user?.tier ?? user?.planTier ?? user?.packageTier ?? 'free',
        [user?.packageTier, user?.planTier, user?.tier],
    );

    useEffect(() => {
        let isMounted = true;

        const fetchUpgradeData = async () => {
            try {
                setIsLoading(true);

                const [packageResult, faqResult] = await Promise.all([
                    getUpgradePackages(),
                    getUpgradeFaqs(),
                ]);

                if (!isMounted) {
                    return;
                }

                if (!packageResult?.success) {
                    toast.warning(
                        packageResult?.message ||
                            'Không thể tải danh sách gói dịch vụ mới nhất.',
                    );
                }

                if (!faqResult?.success) {
                    toast.warning(
                        faqResult?.message ||
                            'Không thể tải mục câu hỏi thường gặp mới nhất.',
                    );
                }

                const safePackages = Array.isArray(packageResult?.data)
                    ? packageResult.data
                    : [];
                const safeFaqs = Array.isArray(faqResult?.data)
                    ? faqResult.data
                    : [];

                setPackages(
                    safePackages.map((pkg) => ({
                        ...pkg,
                        isCurrentPlan: resolveIsCurrentPlan(pkg, userTier),
                    })),
                );
                setFaqs(safeFaqs);
            } catch (error) {
                if (isMounted) {
                    toast.error(
                        error?.message || 'Không thể tải dữ liệu nâng cấp.',
                    );
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchUpgradeData();

        return () => {
            isMounted = false;
        };
    }, [userTier]);

    const handleUpgrade = (packageId) => {
        if (packageId !== 'premium_plan') {
            return;
        }

        const optionPath = config.router.upgradeOptions.replace(
            ':packageId',
            packageId,
        );
        navigate(optionPath);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        })
            .format(Number(amount || 0))
            .replace('₫', 'đ');
    };

    if (isLoading) {
        return (
            <div className={cx('loading')}>
                Đang tải danh sách gói dịch vụ...
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('header-section')}>
                <h1 className={cx('title')}>Nâng cấp tài khoản của bạn</h1>
                <p className={cx('subtitle')}>
                    Mở khóa sức mạnh của AI để tạo ra bản CV hoàn hảo nhất và
                    nổi bật trước các nhà tuyển dụng hàng đầu.
                </p>
            </div>

            <div className={cx('packages-grid')}>
                {packages.map((pkg) => (
                    <div
                        key={pkg.id}
                        className={cx('package-card', {
                            'is-popular': pkg.isPopular,
                        })}
                    >
                        {pkg.isPopular && (
                            <div className={cx('ribbon')}>PHỔ BIẾN</div>
                        )}

                        <div className={cx('pkg-header')}>
                            <h3 className={cx('pkg-name')}>
                                {pkg.name}
                                {pkg.isPopular && (
                                    <GiAlliedStar className={cx('star-icon')} />
                                )}
                            </h3>
                            <p className={cx('pkg-desc')}>{pkg.description}</p>
                        </div>

                        <div className={cx('pkg-price-wrap')}>
                            <span className={cx('pkg-price')}>
                                {Number(pkg.price) === 0
                                    ? '0đ'
                                    : formatCurrency(pkg.price)}
                            </span>
                            <span className={cx('pkg-interval')}>
                                {pkg.interval}
                            </span>
                        </div>

                        <button
                            className={cx('btn-action', {
                                'btn-current': pkg.isCurrentPlan,
                                'btn-upgrade':
                                    !pkg.isCurrentPlan && pkg.isPopular,
                                'btn-standard':
                                    !pkg.isCurrentPlan && !pkg.isPopular,
                            })}
                            disabled={pkg.isCurrentPlan}
                            onClick={() => handleUpgrade(pkg.id)}
                        >
                            {pkg.isCurrentPlan
                                ? 'Đang sử dụng'
                                : 'Nâng cấp ngay'}
                        </button>

                        <ul className={cx('feature-list')}>
                            {(pkg.features || []).map((feature, index) => {
                                const text =
                                    typeof feature === 'string'
                                        ? feature
                                        : feature?.text;
                                const isActive =
                                    typeof feature === 'string'
                                        ? true
                                        : feature?.isActive !== false;

                                return (
                                    <li
                                        key={`${pkg.id}-${index}`}
                                        className={cx('feature-item', {
                                            inactive: !isActive,
                                        })}
                                    >
                                        {isActive ? (
                                            <FiCheckCircle
                                                className={cx('icon-check', {
                                                    blue: pkg.isPopular,
                                                })}
                                            />
                                        ) : (
                                            <FiXCircle
                                                className={cx('icon-cross')}
                                            />
                                        )}
                                        <span>{text}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            <div className={cx('faq-section')}>
                <h2 className={cx('faq-title')}>Câu hỏi thường gặp</h2>
                <div className={cx('faq-list')}>
                    {faqs.map((faq) => (
                        <div key={faq.id} className={cx('faq-item')}>
                            <h4 className={cx('faq-question')}>
                                {faq.question}
                            </h4>
                            <p className={cx('faq-answer')}>{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className={cx('page-footer')}>
                © 2026 CvProAI Platform. Mọi quyền được bảo lưu.
            </div>
        </div>
    );
}

export default UpgradePremium;
