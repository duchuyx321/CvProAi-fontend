import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { MdDeleteOutline, MdErrorOutline, MdWarningAmber } from 'react-icons/md';
import Button from '~/components/Button';
import Modal from '~/components/Modal';
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

    return (
        <Modal
            isOpen={open}
            onClose={handleClose}
            title="Xóa gói dịch vụ"
            description="Vui lòng kiểm tra kỹ trước khi xác nhận."
            size="sm"
            closeOnOverlayClick={!submitting}
            closeOnEsc={!submitting}
            footer={
                <div className={cx('footerActions')}>
                    <Button
                        outlineText
                        className={cx('compactButton')}
                        onClick={handleClose}
                        disabled={submitting}
                    >
                        Quay lại
                    </Button>

                    <Button
                        primary
                        className={cx('compactButton', 'dangerButton', {
                            dangerButtonConfirm: isConfirmStep,
                        })}
                        onClick={handleDeleteClick}
                        disabled={submitting}
                    >
                        {submitting
                            ? 'Đang xử lý...'
                            : isConfirmStep
                              ? 'Xác nhận xóa'
                              : 'Xóa vĩnh viễn'}
                    </Button>
                </div>
            }
        >
            <div className={cx('content')}>
                <div className={cx('hero')}>
                    <div className={cx('iconRing')}>
                        <span className={cx('iconBox')}>
                            <MdDeleteOutline />
                        </span>
                    </div>

                    <div className={cx('heroText')}>
                        <p className={cx('eyebrow')}>
                            <MdErrorOutline />
                            Hành động nguy hiểm
                        </p>

                        <p className={cx('message')}>
                            Bạn đang chuẩn bị xóa vĩnh viễn gói{' '}
                            <strong>{packageName}</strong>.
                        </p>
                    </div>
                </div>

                <div className={cx('warningBox')}>
                    <MdWarningAmber />
                    <span>
                        Hành động này không thể hoàn tác. Tất cả cấu hình liên quan
                        đến gói này sẽ bị gỡ bỏ khỏi hệ thống.
                    </span>
                </div>

                <div
                    className={cx('confirmHint', {
                        confirmHintVisible: isConfirmStep,
                    })}
                >
                    <span className={cx('confirmDot')} />
                    <span>
                        Bấm <strong>Xác nhận xóa</strong> thêm một lần nữa để hoàn tất.
                    </span>
                </div>
            </div>
        </Modal>
    );
}

export default DeletePackageModal;