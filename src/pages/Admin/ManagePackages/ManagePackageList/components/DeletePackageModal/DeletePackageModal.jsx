import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { MdClose, MdDeleteOutline } from 'react-icons/md';
import styles from './DeletePackageModal.module.scss';

const cx = classNames.bind(styles);

function DeletePackageModal({
    open = false,
    packageItem = null,
    submitting = false,
    onClose,
    onConfirm,
}) {
    const [isConfirmStep, setIsConfirmStep] = useState(false);

    useEffect(() => {
        if (!open) {
            setIsConfirmStep(false);
        }
    }, [open]);

    const packageName = packageItem?.name || 'Gói dịch vụ';

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget && !submitting) {
            setIsConfirmStep(false);
            onClose?.();
        }
    };

    const handleClose = () => {
        if (submitting) {
            return;
        }

        setIsConfirmStep(false);
        onClose?.();
    };

    const handleDeleteClick = () => {
        if (submitting) {
            return;
        }

        if (!isConfirmStep) {
            setIsConfirmStep(true);
            return;
        }

        onConfirm?.();
    };

    if (!open) {
        return null;
    }

    return (
        <div
            className={cx('overlay')}
            onMouseDown={handleOverlayClick}
            role="presentation"
        >
            <div
                className={cx('modal')}
                role="dialog"
                aria-modal="true"
                aria-labelledby="delete-package-title"
            >
                <button
                    type="button"
                    className={cx('closeBtn')}
                    onClick={handleClose}
                    disabled={submitting}
                    aria-label="Đóng modal"
                >
                    <MdClose />
                </button>

                <div className={cx('iconBox')}>
                    <MdDeleteOutline />
                </div>

                <div className={cx('content')}>
                    <h2 id="delete-package-title" className={cx('title')}>
                        Xóa gói dịch vụ
                    </h2>

                    <p className={cx('subTitle')}>HÀNH ĐỘNG NGUY HIỂM</p>

                    <p className={cx('description')}>
                        Cảnh báo: Bạn đang thực hiện xóa vĩnh viễn{' '}
                        <strong>"{packageName}"</strong>.
                    </p>

                    <div className={cx('warningBox')}>
                        Hành động này không thể hoàn tác. Tất cả cấu hình liên quan
                        đến gói này sẽ bị gỡ bỏ khỏi hệ thống ngay lập tức.
                    </div>

                    {isConfirmStep ? (
                        <div className={cx('confirmHint')}>
                            Bạn sắp xóa vĩnh viễn gói này. Bấm thêm lần nữa để xác nhận.
                        </div>
                    ) : null}
                </div>

                <div className={cx('actions')}>
                    <button
                        type="button"
                        className={cx('btn', 'btnDanger', {
                            btnDangerConfirm: isConfirmStep,
                        })}
                        onClick={handleDeleteClick}
                        disabled={submitting}
                    >
                        {submitting
                            ? 'Đang xử lý...'
                            : isConfirmStep
                              ? 'Bấm lần nữa để xác nhận'
                              : 'Xóa vĩnh viễn'}
                    </button>

                    <button
                        type="button"
                        className={cx('btn', 'btnGhost')}
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        Quay lại
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeletePackageModal;