import classNames from 'classnames/bind';
import { useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Button from '~/components/Button';
import { config } from '~/config';
import { BasicInfoCard, BenefitsCard } from './components';
import { usePackageDetailForm } from './hooks/usePackageDetailForm';
import styles from './PackageDetail.module.scss';

const cx = classNames.bind(styles);

function PackageDetail() {
    const navigate = useNavigate();
    const { slug } = useParams();
    const [searchParams] = useSearchParams();

    const isReadOnly = searchParams.get('mode') === 'view';

    const managePackagesRoute =
        config?.router?.managePackages || '/admin/packages';

    const packageDetailRoute =
        config?.router?.packageDetail || '/admin/packages/:slug';

    const handleBackToList = useCallback(() => {
        navigate(managePackagesRoute);
    }, [managePackagesRoute, navigate]);

    const handleGoToEdit = useCallback(() => {
        navigate(packageDetailRoute.replace(':slug', slug));
    }, [navigate, packageDetailRoute, slug]);

    const {
        loading,
        submitting,
        formData,
        errors,
        isDirty,
        handleChangeField,
        handleToggleField,
        submitPackageDetail,
    } = usePackageDetailForm({
        slug,
        isReadOnly,
        onNotFound: handleBackToList,
    });

    const handleSubmit = useCallback(() => {
        submitPackageDetail();
    }, [submitPackageDetail]);

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
                            {isReadOnly ? (
                                <Button primary onClick={handleGoToEdit}>
                                    Chỉnh sửa
                                </Button>
                            ) : (
                                <Button
                                    primary
                                    onClick={handleSubmit}
                                    disabled={submitting || !isDirty}
                                >
                                    {submitting
                                        ? 'Đang lưu...'
                                        : 'Lưu thay đổi'}
                                </Button>
                            )}
                        </div>
                    </div>
                </header>

                <main className={cx('contentGrid')}>
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
                </main>
            </div>
        </div>
    );
}

export default PackageDetail;
