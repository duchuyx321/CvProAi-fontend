import { useCallback, useEffect, useState } from 'react';
import { getPackages } from '~/services/managePackageService';
import { normalizePackageList } from '../utils/normalizePackage';

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
    },
    {
        id: 'PKG-002',
        code: 'PKG-002',
        name: 'Premium',
        price: 199000,
        durationUnit: 'month',
        durationValue: 1,
        benefits: ['Không giới hạn', 'Phân tích sâu'],
        totalUsers: 2850,
        status: 'PAUSED',
        createdAt: '2026-04-09T08:30:00.000Z',
    },
];

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

            setPackageList(
                normalizedPackages.length > 0
                    ? normalizedPackages
                    : FALLBACK_PACKAGES
            );
        } catch (error) {
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