import classNames from 'classnames/bind';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { config } from '~/config';
import { getPackages, updatePackage } from '~/services/managePackageService';
import { BasicInfoCard, BenefitsCard } from './components';
import styles from './PackageDetail.module.scss';

const cx = classNames.bind(styles);

const FALLBACK_PACKAGES = [
    {
        id: 'PKG-001',
        code: 'PKG-001',
        name: 'Gói Miễn Phí',
        price: 0,
        durationUnit: 'permanent',
        durationValue: null,
        benefits: ['1 CV', 'AI cơ bản'],
        totalUsers: 15420,
        status: 'ACTIVE',
        createdAt: '2026-04-10T08:30:00.000Z',
        description: 'Gói miễn phí cho người dùng mới.',
        maxCv: 1,
        aiLimit: 10,
        premiumCv: false,
        removeWatermark: false,
        customDomain: false,
        support247: false,
        allowAiAddon: false,
        fullAiAnalysis: false,
    },
    {
        id: 'PKG-002',
        code: 'PKG-002',
        name: 'Gói Premium',
        price: 199000,
        durationUnit: 'year',
        durationValue: 1,
        benefits: [
            '50 CV',
            'AI 100 lượt',
            'Dùng template premium',
            'Xuất CV không watermark',
            'Hỗ trợ 24/7',
        ],
        totalUsers: 1284,
        status: 'ACTIVE',
        createdAt: '2026-04-09T08:30:00.000Z',
        description:
            'Gói tối ưu dành cho ứng viên chuyên nghiệp muốn nổi bật giữa đám đông với sức mạnh từ AI.',
        maxCv: 50,
        aiLimit: 100,
        premiumCv: true,
        removeWatermark: true,
        customDomain: true,
        support247: true,
        allowAiAddon: false,
        fullAiAnalysis: false,
    },
    {
        id: 'PKG-003',
        code: 'PKG-003',
        name: 'Doanh Nghiệp',
        price: 4990000,
        durationUnit: 'year',
        durationValue: 1,
        benefits: ['Hỗ trợ 24/7', 'White Label'],
        totalUsers: 142,
        status: 'PAUSED',
        createdAt: '2026-04-08T08:30:00.000Z',
        description: 'Gói doanh nghiệp với quản trị nâng cao.',
        maxCv: 200,
        aiLimit: 500,
        premiumCv: true,
        removeWatermark: true,
        customDomain: true,
        support247: true,
        allowAiAddon: true,
        fullAiAnalysis: true,
    },
];

const DEFAULT_FORM_DATA = {
    id: '',
    code: '',
    name: '',
    price: '',
    durationUnit: 'year',
    durationValue: '1',
    description: '',
    maxCv: '50',
    aiLimit: '100',
    premiumCv: true,
    removeWatermark: true,
    customDomain: true,
    support247: true,
    allowAiAddon: false,
    fullAiAnalysis: false,
    totalUsers: 0,
    status: 'ACTIVE',
};

function toSafeString(value = '') {
    return String(value ?? '').trim();
}

function toSafeNumber(value = 0) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function toDigitsOnly(value = '') {
    return String(value ?? '').replace(/\D/g, '');
}

function normalizeDurationUnit(value) {
    const normalizedValue = toSafeString(value).toLowerCase();

    if (
        ['permanent', 'lifetime', 'forever', 'vinh_vien', 'vĩnh viễn'].includes(
            normalizedValue
        )
    ) {
        return 'permanent';
    }

    if (['year', 'years', 'annual', 'yearly', 'năm'].includes(normalizedValue)) {
        return 'year';
    }

    return 'month';
}

function normalizeBoolean(value, fallback = false) {
    if (typeof value === 'boolean') {
        return value;
    }

    if (typeof value === 'number') {
        return value === 1;
    }

    const normalizedValue = toSafeString(value).toLowerCase();

    if (['true', '1', 'yes', 'y', 'on'].includes(normalizedValue)) {
        return true;
    }

    if (['false', '0', 'no', 'n', 'off'].includes(normalizedValue)) {
        return false;
    }

    return fallback;
}

function normalizeBenefits(value) {
    if (Array.isArray(value)) {
        return value.map((item) => toSafeString(item)).filter(Boolean);
    }

    if (typeof value === 'string') {
        return value
            .split(/[|,]/)
            .map((item) => item.trim())
            .filter(Boolean);
    }

    return [];
}

function extractFeatureFlags(packageItem) {
    const benefits = normalizeBenefits(
        packageItem?.benefits || packageItem?.features || packageItem?.privileges
    ).map((item) => item.toLowerCase());

    const hasBenefit = (matcher) => benefits.some((item) => matcher.test(item));

    return {
        premiumCv:
            normalizeBoolean(packageItem?.premiumCv, false) ||
            hasBenefit(/premium|template/),
        removeWatermark:
            normalizeBoolean(packageItem?.removeWatermark, false) ||
            hasBenefit(/watermark/),
        customDomain:
            normalizeBoolean(packageItem?.customDomain, false) ||
            hasBenefit(/tên\s*miền|domain/),
        support247:
            normalizeBoolean(packageItem?.support247, false) ||
            hasBenefit(/24\/7|hỗ\s*trợ/),
        allowAiAddon:
            normalizeBoolean(packageItem?.allowAiAddon, false) ||
            hasBenefit(/add[\s-]*on/),
        fullAiAnalysis:
            normalizeBoolean(packageItem?.fullAiAnalysis, false) ||
            hasBenefit(/full\s*phân\s*tích|phân\s*tích\s*ai/),
    };
}

function normalizePackageDetail(packageItem) {
    if (!packageItem) {
        return DEFAULT_FORM_DATA;
    }

    const featureFlags = extractFeatureFlags(packageItem);
    const normalizedDurationUnit = normalizeDurationUnit(
        packageItem?.durationUnit || packageItem?.cycle || packageItem?.billingUnit
    );

    return {
        id: toSafeString(
            packageItem?.id ||
                packageItem?._id ||
                packageItem?.packageId ||
                packageItem?.code
        ),
        code: toSafeString(packageItem?.code || packageItem?.packageCode),
        name: toSafeString(
            packageItem?.name || packageItem?.packageName || packageItem?.title
        ),
        price: String(
            packageItem?.price ?? packageItem?.amount ?? packageItem?.fee ?? ''
        ),
        durationUnit: normalizedDurationUnit,
        durationValue:
            normalizedDurationUnit === 'permanent'
                ? ''
                : String(
                      packageItem?.durationValue ??
                          packageItem?.duration ??
                          packageItem?.billingCycleValue ??
                          1
                  ),
        description: toSafeString(
            packageItem?.description || packageItem?.shortDescription
        ),
        maxCv: String(
            packageItem?.maxCv ??
                packageItem?.maxCV ??
                packageItem?.maxResume ??
                packageItem?.resumeLimit ??
                50
        ),
        aiLimit: String(
            packageItem?.aiLimit ??
                packageItem?.aiUsageLimit ??
                packageItem?.analysisLimit ??
                100
        ),
        premiumCv: featureFlags.premiumCv,
        removeWatermark: featureFlags.removeWatermark,
        customDomain: featureFlags.customDomain,
        support247: featureFlags.support247,
        allowAiAddon: featureFlags.allowAiAddon,
        fullAiAnalysis: featureFlags.fullAiAnalysis,
        totalUsers: toSafeNumber(
            packageItem?.totalUsers ||
                packageItem?.users ||
                packageItem?.subscribers ||
                packageItem?.totalSubscriptions
        ),
        status:
            toSafeString(packageItem?.status || packageItem?.state).toUpperCase() ||
            'ACTIVE',
    };
}

function getPackageCollection(response) {
    const primaryData = response?.data ?? response ?? {};
    const collections = [
        primaryData?.items,
        primaryData?.data,
        primaryData?.packages,
        primaryData?.results,
        primaryData,
    ];

    return collections.find((item) => Array.isArray(item)) || [];
}

function findPackageById(packageList = [], packageId) {
    const normalizedId = String(packageId);

    return packageList.find((item) =>
        [
            item?.id,
            item?._id,
            item?.packageId,
            item?.code,
            item?.packageCode,
        ].some((value) => String(value) === normalizedId)
    );
}

function buildBenefitsPreview(formData) {
    const benefits = [];

    if (toSafeNumber(formData.maxCv) > 0) {
        benefits.push(`${toSafeNumber(formData.maxCv)} CV`);
    }

    if (toSafeNumber(formData.aiLimit) > 0) {
        benefits.push(`AI ${toSafeNumber(formData.aiLimit)} lượt`);
    }

    if (formData.premiumCv) {
        benefits.push('Dùng template premium');
    }

    if (formData.removeWatermark) {
        benefits.push('Xuất CV không watermark');
    }

    if (formData.customDomain) {
        benefits.push('Tên miền tùy chỉnh');
    }

    if (formData.support247) {
        benefits.push('Hỗ trợ 24/7');
    }

    if (formData.allowAiAddon) {
        benefits.push('Cho phép mua thêm AI add-on');
    }

    if (formData.fullAiAnalysis) {
        benefits.push('Xem full phân tích AI');
    }

    return benefits;
}

function createFormSnapshot(formData) {
    return JSON.stringify({
        name: toSafeString(formData.name),
        price: String(formData.price),
        durationUnit: formData.durationUnit,
        durationValue: String(formData.durationValue),
        description: toSafeString(formData.description),
        maxCv: String(formData.maxCv),
        aiLimit: String(formData.aiLimit),
        premiumCv: Boolean(formData.premiumCv),
        removeWatermark: Boolean(formData.removeWatermark),
        customDomain: Boolean(formData.customDomain),
        support247: Boolean(formData.support247),
        allowAiAddon: Boolean(formData.allowAiAddon),
        fullAiAnalysis: Boolean(formData.fullAiAnalysis),
        status: formData.status || 'ACTIVE',
    });
}

function validateForm(formData) {
    const nextErrors = {};

    if (!toSafeString(formData.name)) {
        nextErrors.name = 'Vui lòng nhập tên gói dịch vụ.';
    }

    if (formData.price === '' || toSafeNumber(formData.price) < 0) {
        nextErrors.price = 'Giá tiền phải lớn hơn hoặc bằng 0.';
    }

    if (!formData.durationUnit) {
        nextErrors.durationUnit = 'Vui lòng chọn thời hạn.';
    }

    if (!toSafeString(formData.description)) {
        nextErrors.description = 'Vui lòng nhập mô tả ngắn.';
    }

    if (formData.maxCv === '' || toSafeNumber(formData.maxCv) < 0) {
        nextErrors.maxCv = 'Số CV tối đa không hợp lệ.';
    }

    if (formData.aiLimit === '' || toSafeNumber(formData.aiLimit) < 0) {
        nextErrors.aiLimit = 'Lượt dùng AI không hợp lệ.';
    }

    return nextErrors;
}

function buildUpdatePayload(formData, benefits) {
    return {
        code: toSafeString(formData.code),
        name: toSafeString(formData.name),
        price: toSafeNumber(formData.price),
        durationUnit: formData.durationUnit,
        durationValue:
            formData.durationUnit === 'permanent'
                ? null
                : toSafeNumber(formData.durationValue) || 1,
        description: toSafeString(formData.description),
        benefits,
        maxCv: toSafeNumber(formData.maxCv),
        aiLimit: toSafeNumber(formData.aiLimit),
        premiumCv: Boolean(formData.premiumCv),
        removeWatermark: Boolean(formData.removeWatermark),
        customDomain: Boolean(formData.customDomain),
        support247: Boolean(formData.support247),
        allowAiAddon: Boolean(formData.allowAiAddon),
        fullAiAnalysis: Boolean(formData.fullAiAnalysis),
        status: formData.status || 'ACTIVE',
    };
}

function PackageDetail() {
    const navigate = useNavigate();
    const { packageId } = useParams();
    const [searchParams] = useSearchParams();
    const initialSnapshotRef = useRef(createFormSnapshot(DEFAULT_FORM_DATA));

    const isReadOnly = searchParams.get('mode') === 'view';

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
    const [errors, setErrors] = useState({});

    const managePackagesRoute =
        config?.router?.managePackages || '/admin/packages';

    const previewBenefits = useMemo(
        () => buildBenefitsPreview(formData),
        [formData]
    );

    const isDirty = useMemo(
        () => createFormSnapshot(formData) !== initialSnapshotRef.current,
        [formData]
    );

    const handleBack = useCallback(() => {
        navigate(managePackagesRoute);
    }, [managePackagesRoute, navigate]);

    const loadPackageDetail = useCallback(async () => {
        setLoading(true);

        try {
            const response = await getPackages();
            const packageItems = getPackageCollection(response);
            const effectiveItems =
                Array.isArray(packageItems) && packageItems.length > 0
                    ? packageItems
                    : FALLBACK_PACKAGES;

            const foundPackage = findPackageById(effectiveItems, packageId);

            if (!foundPackage) {
                toast.error('Không tìm thấy gói dịch vụ.');
                navigate(managePackagesRoute);
                return;
            }

            const normalizedPackage = normalizePackageDetail(foundPackage);
            initialSnapshotRef.current = createFormSnapshot(normalizedPackage);
            setFormData(normalizedPackage);
        } catch (error) {
            const foundFallbackPackage = findPackageById(
                FALLBACK_PACKAGES,
                packageId
            );

            if (!foundFallbackPackage) {
                toast.error('Không thể tải chi tiết gói dịch vụ.');
                navigate(managePackagesRoute);
                return;
            }

            const normalizedPackage = normalizePackageDetail(foundFallbackPackage);
            initialSnapshotRef.current = createFormSnapshot(normalizedPackage);
            setFormData(normalizedPackage);
        } finally {
            setLoading(false);
        }
    }, [managePackagesRoute, navigate, packageId]);

    useEffect(() => {
        loadPackageDetail();
    }, [loadPackageDetail]);

    useEffect(() => {
        if (isReadOnly) {
            return undefined;
        }

        const handleBeforeUnload = (event) => {
            if (!isDirty || submitting) {
                return;
            }

            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty, isReadOnly, submitting]);

    const handleChangeField = useCallback(
        (field, value) => {
            if (isReadOnly) {
                return;
            }

            setErrors((previousState) => ({
                ...previousState,
                [field]: '',
            }));

            setFormData((previousState) => {
                if (
                    field === 'price' ||
                    field === 'maxCv' ||
                    field === 'aiLimit' ||
                    field === 'durationValue'
                ) {
                    return {
                        ...previousState,
                        [field]: toDigitsOnly(value),
                    };
                }

                if (field === 'durationUnit') {
                    return {
                        ...previousState,
                        durationUnit: value,
                        durationValue:
                            value === 'permanent'
                                ? ''
                                : previousState.durationValue || '1',
                    };
                }

                return {
                    ...previousState,
                    [field]: value,
                };
            });
        },
        [isReadOnly]
    );

    const handleToggleField = useCallback(
        (field) => {
            if (isReadOnly) {
                return;
            }

            setFormData((previousState) => ({
                ...previousState,
                [field]: !previousState[field],
            }));
        },
        [isReadOnly]
    );

    const handleCancel = useCallback(() => {
        if (isReadOnly) {
            navigate(managePackagesRoute);
            return;
        }

        if (submitting) {
            return;
        }

        if (isDirty) {
            const confirmed = window.confirm(
                'Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn rời trang?'
            );

            if (!confirmed) {
                return;
            }
        }

        navigate(managePackagesRoute);
    }, [isDirty, isReadOnly, managePackagesRoute, navigate, submitting]);

    const handleSubmit = useCallback(async () => {
        if (isReadOnly) {
            return;
        }

        const nextErrors = validateForm(formData);

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            toast.error('Vui lòng kiểm tra lại thông tin biểu mẫu.');
            return;
        }

        setSubmitting(true);

        try {
            const payload = buildUpdatePayload(formData, previewBenefits);
            const response = await updatePackage(packageId, payload);

            const isFailed =
                response?.success === false ||
                response?.data?.success === false;

            if (isFailed) {
                toast.error(
                    response?.message ||
                        response?.data?.message ||
                        'Cập nhật gói dịch vụ thất bại.'
                );
                return;
            }

            initialSnapshotRef.current = createFormSnapshot(formData);

            toast.success(
                response?.message ||
                    response?.data?.message ||
                    'Lưu thay đổi thành công.'
            );
        } catch (error) {
            toast.error('Không thể cập nhật gói dịch vụ.');
        } finally {
            setSubmitting(false);
        }
    }, [formData, isReadOnly, packageId, previewBenefits]);

    if (loading) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('container')}>
                    <div className={cx('loadingCard')}>
                        <div className={cx('loading')}>
                            Đang tải chi tiết gói dịch vụ...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                <header className={cx('pageHeader')}>
                    <div className={cx('headingRow')}>
                        <div className={cx('headingBlock')}>
                           <h1 className={cx('title')}>
    {isReadOnly
        ? 'Xem chi tiết gói dịch vụ'
        : 'Chỉnh sửa gói dịch vụ'}
</h1>
<p className={cx('description')}>
    {isReadOnly
        ? 'Xem thông tin, giá cả và quyền lợi của gói dịch vụ.'
        : 'Cập nhật thông tin, giá cả và quyền lợi cho người dùng trả phí.'}
</p>
                        </div>

                        <div className={cx('actions')}>
                            <button
                                type="button"
                                className={cx('btn', 'btnGhost')}
                                onClick={handleCancel}
                                disabled={submitting && !isReadOnly}
                            >
                                {isReadOnly ? 'Quay lại' : 'Hủy'}
                            </button>

                            {!isReadOnly ? (
                                <button
                                    type="button"
                                    className={cx('btn', 'btnPrimary')}
                                    onClick={handleSubmit}
                                    disabled={submitting || !isDirty}
                                >
                                    {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            ) : null}
                        </div>
                    </div>
                </header>

                <div className={cx('contentGrid')}>
                    <BasicInfoCard
                        formData={formData}
                        errors={errors}
                        onChangeField={handleChangeField}
                        isReadOnly={isReadOnly}
                    />

                    <BenefitsCard
                        formData={formData}
                        errors={errors}
                        onChangeField={handleChangeField}
                        onToggleField={handleToggleField}
                        isReadOnly={isReadOnly}
                    />
                </div>
            </div>
        </div>
    );
}

export default PackageDetail;