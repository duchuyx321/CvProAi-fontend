import classNames from 'classnames/bind';
import { ToastContainer } from 'react-toastify';

import Modal from '~/components/Modal';
import Button from '~/components/Button';
import Input from '~/components/Input';

import LeftEditor from './components/LeftEditor';
import RightPreview from './components/RightPreview';
import AiRewritePanel from './components/AiRewritePanel';
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
    aiRewrite = null,
}) {
    const isAiRewriteMode = Boolean(aiRewrite?.isActive);
    const isAiPanelOpen = Boolean(isAiRewriteMode && aiRewrite?.isPanelOpen);
    const pendingCount = aiRewrite?.pendingCount || 0;

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
                        aiRewriteMode: isAiRewriteMode,
                        aiPanelOpen: isAiPanelOpen,
                    })}
                >
                    {isAiPanelOpen ? (
                        <button
                            type="button"
                            className={cx('aiPanelBackdrop')}
                            onClick={aiRewrite?.onTogglePanel}
                            aria-label="Đóng bảng gợi ý AI"
                        />
                    ) : null}

                    <LeftEditor
                        isOpen
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
                        aiRewrite={aiRewrite}
                    />

                    <RightPreview templateDetail={cvData} pageRef={pageRef} />

                    {isAiPanelOpen ? <AiRewritePanel {...aiRewrite} /> : null}
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

            {isAiRewriteMode && (
                <Modal
                    isOpen={Boolean(aiRewrite?.isApplyAllModalOpen)}
                    onClose={aiRewrite?.onCloseApplyAllModal}
                    title={`Bạn muốn áp dụng toàn bộ ${pendingCount} gợi ý AI?`}
                    description="Hệ thống sẽ chỉ áp dụng các proposal đang ở trạng thái pending. Proposal đã áp dụng hoặc đã bỏ qua sẽ không chạy lại."
                    size="sm"
                    closeOnOverlayClick={!aiRewrite?.applyingAll}
                    closeOnEsc={!aiRewrite?.applyingAll}
                    footer={
                        <div className={cx('applyAllFooter')}>
                            <Button
                                type="button"
                                outlineText
                                className={cx('modalSecondaryBtn')}
                                onClick={aiRewrite?.onCloseApplyAllModal}
                                disabled={aiRewrite?.applyingAll}
                            >
                                Hủy
                            </Button>
                            <Button
                                primary
                                type="button"
                                className={cx('modalPrimaryBtn')}
                                onClick={aiRewrite?.onConfirmApplyAll}
                                disabled={
                                    aiRewrite?.applyingAll || pendingCount === 0
                                }
                            >
                                {aiRewrite?.applyingAll
                                    ? 'Đang áp dụng'
                                    : 'Áp dụng tất cả'}
                            </Button>
                        </div>
                    }
                >
                    <div className={cx('applyAllSummary')}>
                        {(aiRewrite?.applyAllSummary || []).map((item) => (
                            <div
                                key={item.sectionKey}
                                className={cx('applyAllRow')}
                            >
                                <span>{item.label}</span>
                                <strong>{item.count}</strong>
                            </div>
                        ))}
                    </div>
                </Modal>
            )}
        </>
    );
}

export default CvEditor;
