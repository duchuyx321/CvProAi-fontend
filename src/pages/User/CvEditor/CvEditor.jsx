import { useState } from 'react';
import classNames from 'classnames/bind';
import { ToastContainer } from 'react-toastify';
import { FiMenu } from 'react-icons/fi';

import Modal from '~/components/Modal';
import Button from '~/components/Button';
import Input from '~/components/Input';

import LeftEditor from './components/LeftEditor';
import RightPreview from './components/RightPreview';
import styles from './CvEditor.module.scss';

const cx = classNames.bind(styles);

function CvEditor({
    canDownloadPdf = false,
    cvData = {},
    isDirty = false,
    loading = false,
    namePrompt = null,
    onChangeArrayField,
    onChangeConfig,
    onChangeCvName,
    onChangeField,
    onChangeObjectInArray,
    onDownloadPdf,
    onGeneratePreview,
    onRemoveSection,
    onResetData,
    onSaveCv,
    pageRef = null,
    resumeData = {},
    submitting = false,
}) {
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);

    if (loading) {
        return (
            <section className={cx('wrapper')}>
                <div className={cx('loading')}>
                    <p>Đang tải dữ liệu CV...</p>
                </div>
            </section>
        );
    }

    return (
        <>
            <ToastContainer position="top-right" autoClose={2500} />

            <section className={cx('wrapper')}>
                <div
                    className={cx('inner', {
                        panelClosed: !isLeftPanelOpen,
                    })}
                >
                    {!isLeftPanelOpen && (
                        <button
                            type="button"
                            className={cx('open-panel-btn')}
                            onClick={() => setIsLeftPanelOpen(true)}
                            title="Mở bảng điều khiển"
                        >
                            <FiMenu />
                        </button>
                    )}

                    <LeftEditor
                        isOpen={isLeftPanelOpen}
                        onTogglePanel={() => setIsLeftPanelOpen(false)}
                        resumeData={resumeData}
                        onChangeField={onChangeField}
                        onChangeArrayField={onChangeArrayField}
                        onChangeObjectInArray={onChangeObjectInArray}
                        onRemoveSection={onRemoveSection}
                        onChangeConfig={onChangeConfig}
                        templateConfig={cvData?.config || {}}
                        onResetData={onResetData}
                        onSaveCv={onSaveCv}
                        onDownloadPdf={onDownloadPdf}
                        onGeneratePreview={onGeneratePreview}
                        canDownloadPdf={canDownloadPdf}
                        submitting={submitting}
                        cvName={cvData?.name || ''}
                        onChangeCvName={onChangeCvName}
                        isDirty={isDirty}
                        canSave={isDirty && !submitting}
                    />

                    <RightPreview templateDetail={cvData} pageRef={pageRef} />
                </div>
            </section>

            {namePrompt && (
                <Modal
                    isOpen={namePrompt.isOpen}
                    onClose={namePrompt.onClose}
                    title="Đặt tên cho CV của bạn"
                    description="Việc đặt tên cho CV sẽ khiến việc quản lý CV trở nên dễ dàng hơn."
                    size="md"
                    closeOnOverlayClick={!submitting}
                    closeOnEsc={!submitting}
                    footer={
                        <Button
                            primary
                            type="button"
                            className={cx('modalPrimaryBtn')}
                            onClick={namePrompt.onConfirm}
                            disabled={submitting}
                        >
                            Tiếp tục
                        </Button>
                    }
                >
                    <div className={cx('saveNameModalBody')}>
                        <Input
                            type="text"
                            className={cx('saveNameInput')}
                            value={namePrompt.value}
                            onChange={namePrompt.onChange}
                            placeholder="Ví dụ: CV Nhân viên kinh doanh"
                            maxLength={120}
                            autoFocus
                        />
                    </div>
                </Modal>
            )}
        </>
    );
}

export default CvEditor;
