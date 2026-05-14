import classNames from 'classnames/bind';
import { useParams } from 'react-router-dom';
import ActivePackageList from './components/ActivePackageList/ActivePackageList';
import PackageActionCards from './components/PackageActionCards/PackageActionCards';
import { usePackageActions } from './hooks/usePackageActions';
import styles from './PackageActions.module.scss';

const cx = classNames.bind(styles);

function PackageActions() {
    const { packageId } = useParams();

    const {
        packageData,
        activeList,
        loading,
        submitting,
        goToList,
        handleToggleStatus,
        handleDelete,
    } = usePackageActions(packageId);

    return (
        <section className={cx('wrapper')}>
            <div className={cx('container')}>
                <div className={cx('headingBlock')}>
                    <h1 className={cx('title')}>Quản lý gói dịch vụ</h1>
                    <p className={cx('description')}>
                        Cấu hình và cập nhật trạng thái các gói đăng ký SaaS của bạn
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
                            onDelete={handleDelete}
                            onCancel={goToList}
                        />
                        <ActivePackageList items={activeList} />
                    </>
                )}
            </div>
        </section>
    );
}

export default PackageActions;
