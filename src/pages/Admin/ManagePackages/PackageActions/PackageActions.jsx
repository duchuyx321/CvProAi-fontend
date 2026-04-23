import classNames from 'classnames/bind';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    deletePackage,
    getPackageDetail,
    getPackages,
    togglePackageStatus,
} from '~/services/managePackageService';
import ActivePackageList from './components/ActivePackageList/ActivePackageList';
import PackageActionCards from './components/PackageActionCards/PackageActionCards';
import styles from './PackageActions.module.scss';

const cx = classNames.bind(styles);
const PACKAGE_BASE_PATH = '/admin/packages';

const FALLBACK_PACKAGE = {
    id: 'PKG-001',
    code: 'PKG-001',
    name: 'Gói Premium Pro',
    status: 'ACTIVE',
};

const FALLBACK_LIST = [
    {
        id: 'PKG-001',
        name: 'Premium Pro',
        status: 'ACTIVE',
    },
    {
        id: 'PKG-002',
        name: 'Basic Start',
        status: 'DRAFT',
    },
];

function toSafeString(value = '') {
    return String(value ?? '').trim();
}

function normalizeStatus(value) {
    const normalized = toSafeString(value).toUpperCase();

    if (normalized === 'PAUSED') {
        return 'PAUSED';
    }

    if (normalized === 'DRAFT') {
        return 'DRAFT';
    }

    return 'ACTIVE';
}

function normalizePackageDetail(data) {
    if (!data) {
        return FALLBACK_PACKAGE;
    }

    return {
        id: toSafeString(data.id || data._id || data.packageId) || 'PKG-001',
        code:
            toSafeString(data.code || data.packageCode) ||
            toSafeString(data.id || data._id || data.packageId) ||
            'PKG-001',
        name:
            toSafeString(data.name || data.packageName || data.title) ||
            'Gói dịch vụ',
        status: normalizeStatus(data.status || data.state),
    };
}

function normalizePackageList(items = []) {
    if (!Array.isArray(items)) {
        return FALLBACK_LIST;
    }

    return items.map((item, index) => ({
        id:
            toSafeString(item?.id || item?._id || item?.packageId) ||
            `pkg-${index + 1}`,
        name:
            toSafeString(item?.name || item?.packageName || item?.title) ||
            `Gói ${index + 1}`,
        status: normalizeStatus(item?.status || item?.state),
    }));
}

function PackageActions() {
    const navigate = useNavigate();
    const { packageId } = useParams();

    const [packageData, setPackageData] = useState(FALLBACK_PACKAGE);
    const [packages, setPackages] = useState(FALLBACK_LIST);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            setLoading(true);

            try {
                const [detailResponse, listResponse] = await Promise.allSettled([
                    getPackageDetail(packageId),
                    getPackages(),
                ]);

                if (!isMounted) {
                    return;
                }

                if (detailResponse.status === 'fulfilled') {
                    const detailPayload =
                        detailResponse.value?.data?.data ||
                        detailResponse.value?.data ||
                        detailResponse.value;

                    setPackageData(normalizePackageDetail(detailPayload));
                } else {
                    setPackageData({
                        ...FALLBACK_PACKAGE,
                        id: packageId || FALLBACK_PACKAGE.id,
                        code: packageId || FALLBACK_PACKAGE.code,
                    });
                }

                if (listResponse.status === 'fulfilled') {
                    const listPayload =
                        listResponse.value?.data?.items ||
                        listResponse.value?.data?.data ||
                        listResponse.value?.data ||
                        [];

                    const normalizedList = normalizePackageList(listPayload);
                    setPackages(
                        normalizedList.length ? normalizedList : FALLBACK_LIST
                    );
                } else {
                    setPackages(FALLBACK_LIST);
                }
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setPackageData({
                    ...FALLBACK_PACKAGE,
                    id: packageId || FALLBACK_PACKAGE.id,
                    code: packageId || FALLBACK_PACKAGE.code,
                });
                setPackages(FALLBACK_LIST);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [packageId]);

    const activeList = useMemo(() => {
        const filtered = packages.filter(
            (item) => String(item.id) !== String(packageId)
        );

        return filtered.length ? filtered.slice(0, 2) : FALLBACK_LIST;
    }, [packageId, packages]);

    const handleBack = useCallback(() => {
        navigate(PACKAGE_BASE_PATH);
    }, [navigate]);

    const handleBackAndReload = useCallback(() => {
        navigate(PACKAGE_BASE_PATH, {
            state: { shouldReload: true },
        });
    }, [navigate]);

    const handleToggleStatus = useCallback(async () => {
        if (!packageData?.id) {
            return;
        }

        setSubmitting(true);

        try {
            const enable = packageData.status !== 'ACTIVE';
            const response = await togglePackageStatus(packageData.id, enable);

            if (response?.success === false || response?.data?.success === false) {
                toast.error(
                    response?.message ||
                        response?.data?.message ||
                        'Cập nhật trạng thái gói thất bại.'
                );
                return;
            }

            toast.success('Gói dịch vụ đã được cập nhật trạng thái.');
            handleBackAndReload();
        } catch (error) {
            toast.error('Không thể cập nhật trạng thái gói dịch vụ.');
        } finally {
            setSubmitting(false);
        }
    }, [handleBackAndReload, packageData]);

    const handleDeletePackage = useCallback(async () => {
        if (!packageData?.id) {
            return;
        }

        setSubmitting(true);

        try {
            const response = await deletePackage(packageData.id);

            if (response?.success === false || response?.data?.success === false) {
                toast.error(
                    response?.message ||
                        response?.data?.message ||
                        'Xóa gói dịch vụ thất bại.'
                );
                return;
            }

            toast.success('Gói dịch vụ đã được xóa khỏi hệ thống.');
            handleBackAndReload();
        } catch (error) {
            toast.error('Không thể xóa gói dịch vụ.');
        } finally {
            setSubmitting(false);
        }
    }, [handleBackAndReload, packageData]);

    return (
        <section className={cx('wrapper')}>
            <div className={cx('container')}>
                <div className={cx('headingBlock')}>
                    <h1 className={cx('title')}>Quản lý gói dịch vụ</h1>
                    <p className={cx('description')}>
                        Cấu hình và cập nhật trạng thái các gói đăng ký SaaS
                        của bạn
                    </p>
                </div>

                {loading ? (
                    <div className={cx('placeholderBox')}>
                        Đang tải dữ liệu gói dịch vụ...
                    </div>
                ) : (
                    <>
                        <PackageActionCards
                            packageData={packageData}
                            submitting={submitting}
                            onPauseOrActivate={handleToggleStatus}
                            onDelete={handleDeletePackage}
                            onCancel={handleBack}
                        />

                        <ActivePackageList items={activeList} />
                    </>
                )}
            </div>
        </section>
    );
}

export default PackageActions;