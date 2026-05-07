// src/pages/Admin/ManageTemplates/components/DeleteTemplateModal/DeleteTemplateModal.jsx

import { useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { FiAlertTriangle, FiInfo, FiTrash2 } from 'react-icons/fi';

import Button from '~/components/Button';
import Modal from '~/components/Modal';

import {
    formatNumber,
    getTemplateIdLabel,
    getTemplateRecordId,
    getTemplateUsageCount,
} from '../../utils';

import styles from './DeleteTemplateModal.module.scss';

const cx = classNames.bind(styles);

function DeleteTemplateModal({
    template,
    submitting = false,
    onClose,
    onConfirm,
}) {
    const [confirmState, setConfirmState] = useState({
        templateId: null,
        value: '',
    });

    const templateId = useMemo(() => getTemplateRecordId(template), [template]);
    const isOpen = Boolean(template);
    const confirmText =
        confirmState.templateId === templateId ? confirmState.value : '';
    const canDelete = confirmText.trim().toUpperCase() === 'DELETE';

    const handleConfirmChange = (event) => {
        setConfirmState({
            templateId,
            value: event.target.value,
        });
    };

    const handleClose = () => {
        if (submitting) return;
        setConfirmState({ templateId: null, value: '' });
        onClose?.();
    };

    const handleConfirm = () => {
        if (!canDelete || submitting) return;
        onConfirm?.();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            size="sm"
            showCloseButton={false}
            closeOnOverlayClick={!submitting}
            closeOnEsc={!submitting}
            className={cx('deleteModal')}
        >
            <div className={cx('wrapper')}>
                <div className={cx('iconWrap')}>
                    <FiTrash2 />
                </div>

                <h3>Xóa mẫu CV?</h3>

                <p className={cx('description')}>
                    Hành động này sẽ ẩn mẫu khỏi danh sách lựa chọn của người
                    dùng mới. Vui lòng xác nhận trước khi tiếp tục.
                </p>

                <div className={cx('templateCard')}>
                    <div
                        className={cx(
                            'thumbnail',
                            template?.thumbnail_variant || 'classic',
                        )}
                    >
                        <span />
                    </div>

                    <div className={cx('templateInfo')}>
                        <strong>
                            {template?.name || 'Mẫu CV chưa đặt tên'}
                        </strong>

                        <p>
                            {getTemplateIdLabel(template)} •{' '}
                            {template?.category || 'IT & Software'}
                        </p>

                        <small>
                            ↗ {formatNumber(getTemplateUsageCount(template))}{' '}
                            lượt dùng
                        </small>
                    </div>

                    <span
                        className={cx('statusBadge', {
                            inactive: template?.is_active === false,
                        })}
                    >
                        {template?.is_active === false
                            ? 'Tạm ngưng'
                            : 'Hoạt động'}
                    </span>
                </div>

                <div className={cx('warningBox')}>
                    <FiAlertTriangle />
                    <div>
                        <strong>
                            Mẫu này đang được sử dụng bởi{' '}
                            {formatNumber(getTemplateUsageCount(template))}{' '}
                            người dùng
                        </strong>
                        <p>
                            Người dùng đang dùng mẫu này vẫn có thể giữ CV hiện
                            tại, nhưng người dùng mới sẽ không chọn được mẫu.
                        </p>
                    </div>
                </div>

                <label className={cx('confirmLabel')}>
                    Nhập DELETE để xác nhận
                    <input
                        value={confirmText}
                        onChange={handleConfirmChange}
                        placeholder="DELETE"
                        disabled={submitting}
                    />
                </label>

                <p className={cx('note')}>
                    <FiInfo />
                    Yêu cầu xác nhận để tránh thao tác nhầm dữ liệu.
                </p>

                <div className={cx('actions')}>
                    <Button
                        outline
                        type="button"
                        onClick={handleClose}
                        disabled={submitting}
                        className={cx('cancelButton')}
                    >
                        Hủy bỏ
                    </Button>

                    <Button
                        primary
                        type="button"
                        onClick={handleConfirm}
                        disabled={!canDelete || submitting}
                        leftIcon={<FiTrash2 />}
                        className={cx('deleteButton', {
                            disabled: !canDelete,
                        })}
                    >
                        {submitting ? 'Đang xóa...' : 'Xác nhận xóa'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default DeleteTemplateModal;
