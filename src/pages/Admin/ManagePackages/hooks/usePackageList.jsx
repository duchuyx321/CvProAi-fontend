import { useCallback, useEffect, useState } from 'react';
import { getPackages } from '~/services/managePackageService';
import { FALLBACK_PACKAGES } from '../constants';
import { normalizePackageList } from '../utils/normalizePackage';

export function usePackageList() {
    const [packageList, setPackageList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');

    const loadPackages = useCallback(async () => {
        setLoading(true);
        setLoadError('');

        try {
            const response = await getPackages();
            const apiItems = response?.data?.items ?? response?.data ?? [];
            const normalizedPackages = normalizePackageList(
                Array.isArray(apiItems) ? apiItems : []
            );

            setPackageList(normalizedPackages);
        } catch {
            setLoadError(
                'Không thể tải dữ liệu từ máy chủ. Đang hiển thị dữ liệu mẫu.'
            );
            setPackageList(FALLBACK_PACKAGES);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPackages();
    }, [loadPackages]);

    return {
        packageList,
        setPackageList,
        loading,
        loadError,
        loadPackages,
    };
}