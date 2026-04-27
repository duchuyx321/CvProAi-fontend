import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { getPackages, updatePackage } from '~/services/managePackageService';
import { DEFAULT_FORM_DATA, FALLBACK_PACKAGES } from '../constants';
import {
    buildBenefitsPreview,
    buildUpdatePayload,
    createFormSnapshot,
    findPackageById,
    getPackageCollection,
    normalizePackageDetail,
    toDigitsOnly,
    validatePackageDetailForm,
} from '../utils/packageDetailHelpers';

export function usePackageDetailForm({
    packageId,
    isReadOnly,
    onNotFound,
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
                onNotFound?.();
                return;
            }

            const normalizedPackage = normalizePackageDetail(foundPackage);
            const nextSnapshot = createFormSnapshot(normalizedPackage);

            setSavedSnapshot(nextSnapshot);
            setFormData(normalizedPackage);
        } catch (error) {
            const foundFallbackPackage = findPackageById(
                FALLBACK_PACKAGES,
                packageId
            );

            if (!foundFallbackPackage) {
                toast.error('Không thể tải chi tiết gói dịch vụ.');
                onNotFound?.();
                return;
            }

            const normalizedPackage = normalizePackageDetail(foundFallbackPackage);
            const nextSnapshot = createFormSnapshot(normalizedPackage);

            setSavedSnapshot(nextSnapshot);
            setFormData(normalizedPackage);
        } finally {
            setLoading(false);
        }
    }, [onNotFound, packageId]);

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