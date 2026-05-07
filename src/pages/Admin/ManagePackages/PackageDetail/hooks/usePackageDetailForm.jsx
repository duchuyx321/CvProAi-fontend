import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { getPackageDetail, updatePackage } from '~/services/managePackageService';
import { DEFAULT_FORM_DATA, FALLBACK_PACKAGES } from '../../constants';
import {
    buildBenefitsPreview,
    buildUpdatePayload,
    createFormSnapshot,
    findPackageById,
    normalizePackageDetail,
    toDigitsOnly,
    validatePackageDetailForm,
} from '../utils/packageDetailHelpers';

export function usePackageDetailForm({
    packageId,
    isReadOnly,
    onNotFound,
    routePackage,
}) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
    const [errors, setErrors] = useState({});
    const [savedSnapshot, setSavedSnapshot] = useState(
        createFormSnapshot(DEFAULT_FORM_DATA)
    );

    const previewBenefits = useMemo(
        () => buildBenefitsPreview(formData),
        [formData]
    );

    const currentSnapshot = useMemo(
        () => createFormSnapshot(formData),
        [formData]
    );

    const isDirty = currentSnapshot !== savedSnapshot;

    const loadPackageDetail = useCallback(async () => {
        if (routePackage) {
            const normalizedPackage = normalizePackageDetail(routePackage);
            const nextSnapshot = createFormSnapshot(normalizedPackage);
            setSavedSnapshot(nextSnapshot);
            setFormData(normalizedPackage);
            setLoading(false);
        }

        try {
            if (!routePackage) setLoading(true);
            const response = await getPackageDetail(packageId);
            const raw =
                response?.data?.item ??
                response?.data?.data ??
                response?.data ??
                response;

            if (!raw || response?.success === false) {
                const fallback = findPackageById(FALLBACK_PACKAGES, packageId);
                if (!fallback) {
                    if (!routePackage) {
                        toast.error('Không tìm thấy gói dịch vụ.');
                        onNotFound?.();
                    }
                    return;
                }
                const normalizedPackage = normalizePackageDetail(fallback);
                const nextSnapshot = createFormSnapshot(normalizedPackage);
                setSavedSnapshot(nextSnapshot);
                setFormData(normalizedPackage);
                return;
            }

            const normalizedPackage = normalizePackageDetail(raw);
            const nextSnapshot = createFormSnapshot(normalizedPackage);
            setSavedSnapshot(nextSnapshot);
            setFormData(normalizedPackage);
        } catch {
            const fallback = findPackageById(FALLBACK_PACKAGES, packageId);
            if (fallback) {
                const normalizedPackage = normalizePackageDetail(fallback);
                const nextSnapshot = createFormSnapshot(normalizedPackage);
                setSavedSnapshot(nextSnapshot);
                setFormData(normalizedPackage);
            } else if (!routePackage) {
                toast.error('Không thể tải chi tiết gói dịch vụ.');
                onNotFound?.();
            }
        } finally {
            setLoading(false);
        }
    }, [onNotFound, packageId, routePackage]);

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

    const submitPackageDetail = useCallback(async () => {
        if (isReadOnly || !isDirty || submitting) {
            return false;
        }

        const nextErrors = validatePackageDetailForm(formData);

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            toast.error('Vui lòng kiểm tra lại thông tin biểu mẫu.');
            return false;
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
                return false;
            }

            setSavedSnapshot(createFormSnapshot(formData));

            toast.success(
                response?.message ||
                    response?.data?.message ||
                    'Lưu thay đổi thành công.'
            );

            return true;
        } catch (error) {
            toast.error('Không thể cập nhật gói dịch vụ.');
            return false;
        } finally {
            setSubmitting(false);
        }
    }, [
        formData,
        isDirty,
        isReadOnly,
        packageId,
        previewBenefits,
        submitting,
    ]);

    return {
        loading,
        submitting,
        formData,
        errors,
        isDirty,
        handleChangeField,
        handleToggleField,
        submitPackageDetail,
    };
}