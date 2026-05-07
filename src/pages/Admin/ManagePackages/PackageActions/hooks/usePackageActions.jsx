import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    deletePackage,
    getPackageDetail,
    getPackages,
    togglePackageStatus,
} from '~/services/managePackageService';
import { normalizePackage } from '../../utils/normalizePackage';
import { FALLBACK_PACKAGES } from '../../constants';

const PACKAGE_BASE_PATH = '/admin/packages';

function extractDetailPayload(response) {
    return (
        response?.data?.item ??
        response?.data?.data ??
        response?.data ??
        response
    );
}

function extractListPayload(response) {
    return (
        response?.data?.items ??
        response?.data?.data ??
        response?.data ??
        []
    );
}

export function usePackageActions(packageId) {
    const navigate = useNavigate();

    const [packageData, setPackageData] = useState(null);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let active = true;

        const fetchData = async () => {
            setLoading(true);

            const [detailRes, listRes] = await Promise.allSettled([
                getPackageDetail(packageId),
                getPackages(),
            ]);

            if (!active) return;

            if (detailRes.status === 'fulfilled') {
                const raw = extractDetailPayload(detailRes.value);
                setPackageData(raw ? normalizePackage(raw, 0) : null);
            }

            if (listRes.status === 'fulfilled') {
                const rawItems = extractListPayload(listRes.value);
                const normalized = Array.isArray(rawItems)
                    ? rawItems.map((item, i) => normalizePackage(item, i))
                    : [];
                setPackages(normalized.length ? normalized : FALLBACK_PACKAGES);
            } else {
                setPackages(FALLBACK_PACKAGES);
            }

            setLoading(false);
        };

        fetchData();
        return () => { active = false; };
    }, [packageId]);

    const activeList = useMemo(() => {
        return packages
            .filter((item) => String(item.id) !== String(packageId))
            .slice(0, 2);
    }, [packageId, packages]);

    const goToList = useCallback(() => navigate(PACKAGE_BASE_PATH), [navigate]);

    const goToListAndReload = useCallback(() => {
        navigate(PACKAGE_BASE_PATH, { state: { shouldReload: true } });
    }, [navigate]);

    const handleToggleStatus = useCallback(async () => {
        if (!packageData?.id || submitting) return;
        setSubmitting(true);
        try {
            const enable = packageData.status !== 'ACTIVE';
            const res = await togglePackageStatus(packageData.id, enable);
            if (res?.success === false || res?.data?.success === false) {
                toast.error(res?.message || res?.data?.message || 'Cập nhật trạng thái thất bại.');
                return;
            }
            toast.success('Đã cập nhật trạng thái gói dịch vụ.');
            goToListAndReload();
        } catch {
            toast.error('Không thể cập nhật trạng thái gói dịch vụ.');
        } finally {
            setSubmitting(false);
        }
    }, [goToListAndReload, packageData, submitting]);

    const handleDelete = useCallback(async () => {
        if (!packageData?.id || submitting) return;
        setSubmitting(true);
        try {
            const res = await deletePackage(packageData.id);
            if (res?.success === false || res?.data?.success === false) {
                toast.error(res?.message || res?.data?.message || 'Xóa gói thất bại.');
                return;
            }
            toast.success('Đã xóa gói dịch vụ.');
            goToListAndReload();
        } catch {
            toast.error('Không thể xóa gói dịch vụ.');
        } finally {
            setSubmitting(false);
        }
    }, [goToListAndReload, packageData, submitting]);

    return {
        packageData,
        activeList,
        loading,
        submitting,
        goToList,
        handleToggleStatus,
        handleDelete,
    };
}
