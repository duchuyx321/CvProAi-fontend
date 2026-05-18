import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { getPackageDetail, updatePackage } from '~/services/managePackageService';
import { DEFAULT_FORM_DATA, getApiMessage } from '../../../managePackages.utils';
import {
    buildUpdatePayload,
    createFormSnapshot,
    normalizePackageDetail,
    toDigitsOnly,
    validatePackageDetailForm,
} from '../utils/packageDetailHelpers';

function getPackageDetailPayload(response) {
    const payload = response?.data ?? response;

    return payload?.data ?? payload?.plan ?? payload?.item ?? payload;
}

export function usePackageDetailForm({ slug, isReadOnly, onNotFound }) {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
    const [errors, setErrors] = useState({});
    const [savedSnapshot, setSavedSnapshot] = useState(
        createFormSnapshot(DEFAULT_FORM_DATA),
    );

    const currentSnapshot = useMemo(
        () => createFormSnapshot(formData),
        [formData],
    );

    const isDirty = currentSnapshot !== savedSnapshot;

    const loadPackageDetail = useCallback(async () => {
        if (!slug) {
            toast.error('Không tìm thấy gói dịch vụ.');
            onNotFound?.();
            return;
        }

        try {
            setLoading(true);
            const response = await getPackageDetail(slug);

            if (response?.success === false) {
                toast.error(getApiMessage(response, 'Không tìm thấy gói dịch vụ.'));
                onNotFound?.();
                return;
            }

            const rawPackage = getPackageDetailPayload(response);

            if (!rawPackage) {
                toast.error('Không tìm thấy gói dịch vụ.');
                onNotFound?.();
                return;
            }

            const normalizedPackage = normalizePackageDetail(rawPackage);
            const nextSnapshot = createFormSnapshot(normalizedPackage);

            setSavedSnapshot(nextSnapshot);
            setFormData(normalizedPackage);
        } catch {
            toast.error('Không thể tải chi tiết gói dịch vụ.');
            onNotFound?.();
        } finally {
            setLoading(false);
        }
    }, [onNotFound, slug]);

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
        [isReadOnly],
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
        [isReadOnly],
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
            const payload = buildUpdatePayload(formData);
            const response = await updatePackage(formData.id || slug, payload);

            const isFailed =
                response?.success === false ||
                response?.data?.success === false;

            if (isFailed) {
                toast.error(
                    getApiMessage(response, 'Cập nhật gói dịch vụ thất bại.'),
                );
                return false;
            }

            setSavedSnapshot(createFormSnapshot(formData));

            toast.success(
                getApiMessage(response, 'Lưu thay đổi thành công.'),
            );

            return true;
        } catch {
            toast.error('Không thể cập nhật gói dịch vụ.');
            return false;
        } finally {
            setSubmitting(false);
        }
    }, [formData, isDirty, isReadOnly, slug, submitting]);

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
