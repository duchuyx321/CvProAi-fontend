import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { config } from '~/config';
import { createPackage } from '~/services/managePackageService';

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

const FIELD_ORDER = ['name', 'description', 'price', 'currency', 'durationUnit', 'maxCv', 'aiLimit'];

const sanitizeDigits = (value = '') => String(value).replace(/\D/g, '');

const toBillingCycle = (durationUnit) => {
    const billingCycleMap = {
        year: 'YEAR',
        month: 'MONTH',
        permanent: 'LIFETIME',
    };

    return billingCycleMap[durationUnit] || 'MONTH';
};

const validate = (formData) => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Vui lòng nhập tên gói dịch vụ.';
    if (!formData.description.trim()) errs.description = 'Vui lòng nhập mô tả gói.';
    const price = Number(formData.price);
    if (formData.price === '' || Number.isNaN(price) || price < 0) errs.price = 'Giá tiền phải lớn hơn hoặc bằng 0.';
    if (!formData.currency) errs.currency = 'Vui lòng chọn đơn vị tiền tệ.';
    if (!formData.durationUnit) errs.durationUnit = 'Vui lòng chọn chu kỳ thanh toán.';
    const maxCv = Number(formData.maxCv);
    if (formData.maxCv === '' || Number.isNaN(maxCv) || maxCv < 0) errs.maxCv = 'Số CV tối đa không hợp lệ.';
    const aiLimit = Number(formData.aiLimit);
    if (formData.aiLimit === '' || Number.isNaN(aiLimit) || aiLimit < 0) errs.aiLimit = 'Lượt phân tích AI không hợp lệ.';
    return errs;
};

export function useCreatePackageForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');

    const handleChangeField = useCallback((field, value) => {
        const numericFields = ['price', 'maxCv', 'aiLimit', 'durationValue'];
        setFormData((prev) => ({
            ...prev,
            [field]: numericFields.includes(field) ? sanitizeDigits(value) : value,
        }));
        setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));
        setSubmitError('');
    }, []);

    const handleToggleField = useCallback((field) => {
        setFormData((prev) => ({ ...prev, [field]: !prev[field] }));
        setSubmitError('');
    }, []);

    const handleBack = useCallback(() => {
        if (!submitting) navigate(config.router.managePackages);
    }, [navigate, submitting]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (submitting) return;

        const nextErrors = validate(formData);
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            const firstField = FIELD_ORDER.find((f) => nextErrors[f]);
            if (firstField) {
                window.requestAnimationFrame(() => {
                    document.querySelector(`[data-field="${firstField}"]`)?.focus();
                });
            }
            return;
        }

        setSubmitting(true);
        setSubmitError('');

        try {
            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: Number(formData.price) || 0,
                currency: formData.currency,
                billing_cycle: toBillingCycle(formData.durationUnit),
                cv_limit: Number(formData.maxCv) || 0,
                export_limit: Number(formData.maxCv) || 0,
                ai_limit: Number(formData.aiLimit) || 0,
                premium_template: Boolean(formData.premiumCv),
                remove_watermark: Boolean(formData.removeWatermark),
                custom_domain: Boolean(formData.customDomain),
                priority_support: Boolean(formData.support247),
                can_purchase_ai_addon: Boolean(formData.allowAiAddon),
                view_full_ai_analysis: Boolean(formData.fullAiAnalysis),
                is_active: formData.status !== 'PAUSED',
            };

            const response = await createPackage(payload);
            const result = response?.data ?? response;

            if (result?.success === false || result?.status === false) {
                const msg = result?.message || 'Tạo gói dịch vụ thất bại.';
                setSubmitError(msg);
                toast.error(msg);
                return;
            }

            toast.success(result?.message || 'Tạo gói dịch vụ thành công.');
            navigate(config.router.managePackages);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Không thể tạo gói dịch vụ.';
            setSubmitError(msg);
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    }, [formData, navigate, submitting]);

    return { formData, errors, submitting, submitError, handleChangeField, handleToggleField, handleBack, handleSubmit };
}
