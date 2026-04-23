import classNames from 'classnames/bind';
import { MdDeleteOutline, MdWarningAmber } from 'react-icons/md';
import styles from './PackageActionCards.module.scss';

const cx = classNames.bind(styles);

function PackageActionCards({
    packageData,
    submitting = false,
    onPauseOrActivate,
    onDelete,
    onCancel,
}) {
    const isActive = packageData?.status === 'ACTIVE';

    return (
        <div className={cx('grid')}>
            <section className={cx('card', 'pauseCard')}>
                <div className={cx('iconBox', 'warningIconBox')}>
                    <MdWarningAmber />
                </div>

                <div className={cx('content')}>
                    <div className={cx('headerGroup')}>
                        <h3 className={cx('title')}>
                            {isActive ? 'Tạm ngưng gói' : 'Kích hoạt gói'}
                        </h3>
                        <p className={cx('subTitle')}>Hành động cần xác nhận</p>
                    </div>

                    <p className={cx('description')}>
                        Bạn có chắc chắn muốn{' '}
                        <strong>
                            {isActive ? 'tạm ngưng' : 'kích hoạt lại'} "
                            {packageData?.name || 'gói dịch vụ'}"
                        </strong>
                        ? Người dùng sẽ{' '}
                        {isActive
                            ? 'không thể truy cập các tính năng nâng cao cho đến khi gói được kích hoạt lại. Việc này không ảnh hưởng đến dữ liệu hiện có.'
                            : 'được sử dụng lại toàn bộ tính năng của gói ngay sau khi kích hoạt. Các dữ liệu cũ vẫn được giữ nguyên.'}
                    </p>
                </div>

                <div className={cx('actions')}>
                    <button
                        type="button"
                        className={cx('btn', 'btnPrimary')}
                        onClick={onPauseOrActivate}
                        disabled={submitting}
                    >
                        {submitting
                            ? 'Đang xử lý...'
                            : isActive
                            ? 'Xác nhận tạm ngưng'
                            : 'Xác nhận kích hoạt'}
                    </button>

                    <button
                        type="button"
                        className={cx('btn', 'btnGhost')}
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        Hủy bỏ
                    </button>
                </div>
            </section>

            <section className={cx('card', 'deleteCard')}>
                <div className={cx('iconBox', 'dangerIconBox')}>
                    <MdDeleteOutline />
                </div>

                <div className={cx('content')}>
                    <div className={cx('headerGroup')}>
                        <h3 className={cx('title', 'dangerTitle')}>
                            Xóa gói dịch vụ
                        </h3>
                        <p className={cx('subTitle', 'dangerSubTitle')}>
                            Hành động nguy hiểm
                        </p>
                    </div>

                    <p className={cx('description')}>
                        Cảnh báo: Bạn đang thực hiện xóa vĩnh viễn{' '}
                        <strong>
                            "{packageData?.name || 'gói dịch vụ'}"
                        </strong>
                        .
                    </p>

                    <div className={cx('warningBox')}>
                        Hành động này không thể hoàn tác. Tất cả cấu hình liên
                        quan đến gói này sẽ bị gỡ bỏ khỏi hệ thống ngay lập tức.
                    </div>
                </div>

                <div className={cx('actions')}>
                    <button
                        type="button"
                        className={cx('btn', 'btnDanger')}
                        onClick={onDelete}
                        disabled={submitting}
                    >
                        {submitting ? 'Đang xử lý...' : 'Xóa vĩnh viễn'}
                    </button>

                    <button
                        type="button"
                        className={cx('btn', 'btnGhost')}
                        onClick={onCancel}
                        disabled={submitting}
                    >
                        Quay lại
                    </button>
                </div>
            </section>
        </div>
    );
}

export default PackageActionCards;