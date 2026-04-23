import classNames from 'classnames/bind';
import { useCallback, useState } from 'react';
import { MdAutorenew, MdOutlineSave } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { config } from '~/config';
import { createPackage } from '~/services/managePackageService';
import { BasicInfoSection, UsageSettingsSection } from './components';
import styles from './CreatePackage.module.scss';

const cx = classNames.bind(styles);

const INITIAL_FORM_DATA = {
    code: '',
    name: '',
    description: '',
    price: '0',
    currency: 'VND',
    durationUnit: 'year',
    durationValue: '1',
    status: 'ACTIVE',
    maxCv: '50',
    aiLimit: '100',
    premiumCv: true,
    removeWatermark: true,
    customDomain: false,
    support247: true,
    allowAiAddon: true,
    fullAiAnalysis: false,
};

const BENEFIT_LABELS = {
    premiumCv: 'Dùng template premium',
    removeWatermark: 'Xuất CV không watermark',
    customDomain: 'Tên miền tùy chỉnh',
    support247: 'Hỗ trợ 24/7',
    allowAiAddon: 'Cho phép mua thêm AI add-on',
    fullAiAnalysis: 'Xem full phân tích AI',
};

const FIELD_ORDER = [
    'name',
    'description',
    'price',
    'currency',
    'durationUnit',
    'maxCv',
    'aiLimit',
];

const sanitizeDigits = (value = '') => String(value).replace(/\D/g, '');

const buildBenefitList = (data) => {
    const nextBenefits = [];

    if (Number(data.maxCv) > 0) {
        nextBenefits.push(`${Number(data.maxCv)} CV`);
    }

    if (Number(data.aiLimit) > 0) {
        nextBenefits.push(`AI ${Number(data.aiLimit)} lượt`);
    }

    Object.entries(BENEFIT_LABELS).forEach(([key, label]) => {
        if (data[key]) {
            nextBenefits.push(label);
        }
    });

    return nextBenefits;
};

const buildPackageCode = (name, manualCode = '') => {
    const normalizedCode = manualCode.trim().toUpperCase();

    if (normalizedCode) {
        return normalizedCode;
    }

    const slug = name
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toUpperCase()
        .slice(0, 18);

    return `PKG-${slug || 'NEW'}-${Date.now().toString().slice(-6)}`;
};

const getErrorMessage = (error) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    'Không thể tạo gói dịch vụ. Vui lòng thử lại.';

function CreatePackage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleChangeField = useCallback((field, value) => {
        setFormData((prev) => {
            if (
                field === 'price' ||
                field === 'maxCv' ||
                field === 'aiLimit' ||
                field === 'durationValue'
            ) {
                return {
                    ...prev,
                    [field]: sanitizeDigits(value),
                };
            }

            return {
                ...prev,
                [field]: value,
            };
        });

        setErrors((prev) => {
            if (!prev[field]) {
                return prev;
            }

            return {
                ...prev,
                [field]: '',
            };
        });

        setSubmitError('');
    }, []);

    const handleToggleField = useCallback((field) => {
        setFormData((prev) => ({
            ...prev,
            [field]: !prev[field],
        }));

        setSubmitError('');
    }, []);

    const focusFirstError = useCallback((nextErrors) => {
        const firstField = FIELD_ORDER.find((field) => nextErrors[field]);

        if (!firstField) {
            return;
        }

        window.requestAnimationFrame(() => {
            const target = document.querySelector(`[data-field="${firstField}"]`);

            if (target && typeof target.focus === 'function') {
                target.focus();
            }
        });
    }, []);

    const validateForm = useCallback(() => {
        const nextErrors = {};
        const name = formData.name.trim();
        const description = formData.description.trim();
        const price = Number(formData.price);
        const maxCv = Number(formData.maxCv);
        const aiLimit = Number(formData.aiLimit);

        if (!name) {
            nextErrors.name = 'Vui lòng nhập tên gói dịch vụ.';
        }

        if (!description) {
            nextErrors.description = 'Vui lòng nhập mô tả gói.';
        }

        if (formData.price === '' || Number.isNaN(price) || price < 0) {
            nextErrors.price = 'Giá tiền phải lớn hơn hoặc bằng 0.';
        }

        if (!formData.currency) {
            nextErrors.currency = 'Vui lòng chọn đơn vị tiền tệ.';
        }

        if (!formData.durationUnit) {
            nextErrors.durationUnit = 'Vui lòng chọn chu kỳ thanh toán.';
        }

        if (formData.maxCv === '' || Number.isNaN(maxCv) || maxCv < 0) {
            nextErrors.maxCv = 'Số CV tối đa không hợp lệ.';
        }

        if (formData.aiLimit === '' || Number.isNaN(aiLimit) || aiLimit < 0) {
            nextErrors.aiLimit = 'Lượt phân tích AI không hợp lệ.';
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length > 0) {
            focusFirstError(nextErrors);
            return false;
        }

        return true;
    }, [focusFirstError, formData]);

    const handleBack = useCallback(() => {
        if (submitting) {
            return;
        }

        navigate(config.router.managePackages);
    }, [navigate, submitting]);

    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault();

            if (submitting) {
                return;
            }

            if (!validateForm()) {
                return;
            }

            setSubmitting(true);
            setSubmitError('');

            try {
                const payload = {
                    code: buildPackageCode(formData.name, formData.code),
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                    price: Number(formData.price) || 0,
                    currency: formData.currency,
                    durationUnit: formData.durationUnit,
                    durationValue:
                        formData.durationUnit === 'permanent'
                            ? null
                            : Number(formData.durationValue) || 1,
                    status: formData.status,
                    benefits: buildBenefitList(formData),
                    maxCv: Number(formData.maxCv) || 0,
                    aiLimit: Number(formData.aiLimit) || 0,
                    premiumCv: Boolean(formData.premiumCv),
                    removeWatermark: Boolean(formData.removeWatermark),
                    customDomain: Boolean(formData.customDomain),
                    support247: Boolean(formData.support247),
                    allowAiAddon: Boolean(formData.allowAiAddon),
                    fullAiAnalysis: Boolean(formData.fullAiAnalysis),
                };

                const response = await createPackage(payload);
                const result = response?.data ?? response;
                const failed =
                    result?.success === false || result?.status === false;

                if (failed) {
                    const message =
                        result?.message || 'Tạo gói dịch vụ thất bại.';
                    setSubmitError(message);
                    toast.error(message);
                    return;
                }

                toast.success(result?.message || 'Tạo gói dịch vụ thành công.');
                navigate(config.router.managePackages);
            } catch (error) {
                const message = getErrorMessage(error);
                setSubmitError(message);
                toast.error(message);
            } finally {
                setSubmitting(false);
            }
        },
        [formData, navigate, submitting, validateForm]
    );

    return (
        <div className={cx('wrapper')}>
            <div className={cx('heading')}>
    <h1 className={cx('title')}>Thêm gói dịch vụ mới</h1>
    <p className={cx('description')}>
        Thiết lập các thông số và tính năng cho gói dịch vụ dành cho người dùng.
    </p>
</div>

            <form className={cx('form')} onSubmit={handleSubmit} noValidate>
                <div className={cx('contentGrid')}>
                    <BasicInfoSection
                        formData={formData}
                        errors={errors}
                        disabled={submitting}
                        onChangeField={handleChangeField}
                    />

                    <UsageSettingsSection
                        formData={formData}
                        errors={errors}
                        disabled={submitting}
                        onChangeField={handleChangeField}
                        onToggleField={handleToggleField}
                    />
                </div>

                <div className={cx('footer')}>
                    <div className={cx('feedbackWrap')} aria-live="polite">
                        {submitError ? (
                            <p className={cx('feedback', 'errorFeedback')}>
                                {submitError}
                            </p>
                        ) : null}
                    </div>

                    <div className={cx('actionGroup')}>
                        <button
                            type="button"
                            className={cx('btn', 'btnGhost')}
                            onClick={handleBack}
                            disabled={submitting}
                        >
                            Hủy
                        </button>

                        <button
                            type="submit"
                            className={cx('btn', 'btnPrimary')}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <MdAutorenew className={cx('loadingIcon')} />
                            ) : (
                                <MdOutlineSave />
                            )}
                            {submitting ? 'Đang lưu...' : 'Lưu gói dịch vụ'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default CreatePackage;