import classNames from 'classnames/bind';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
    FiDownload,
    FiMaximize2,
    FiMinimize2,
    FiMinus,
    FiPlus,
    FiSave,
} from 'react-icons/fi';

import CvPreview from '~/components/CvPreview';

import {
    buildEditorPreviewCv,
    buildEditorPreviewTemplate,
} from './templateSchema';

import styles from './RightPreview.module.scss';

const cx = classNames.bind(styles);

const getSaveLabel = (isSaving, isNewTemplate) => {
    if (isSaving) return isNewTemplate ? 'Đang tạo...' : 'Đang lưu...';
    return isNewTemplate ? 'Tạo mẫu CV' : 'Cập nhật';
};

function RightPreview({
    paperRef,
    template,
    editor,
    zoom,
    isCreate,
    saving,
    loadingTemplate,
    onZoomIn,
    onZoomOut,
    onDownloadPdf,
    onSave,
    onToggleActive,
}) {
    const panelRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const previewTemplate = buildEditorPreviewTemplate(editor, template);
    const previewCv = buildEditorPreviewCv(editor, template);

    useEffect(() => {
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        return () => document.removeEventListener('fullscreenchange', handleFsChange);
    }, []);

    const handleToggleFullscreen = useCallback(() => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            panelRef.current?.requestFullscreen();
        }
    }, []);

    return (
        <main ref={panelRef} className={cx('previewPanel', { fullscreen: isFullscreen })}>
            <div className={cx('previewHeader')}>
                <div className={cx('previewTitle')}>
                    <strong>Live Preview</strong>
                    <span
                        className={cx('badge', {
                            active: editor.is_active,
                            premium: editor.is_premium,
                        })}
                    >
                        {editor.is_premium ? 'Premium' : 'Free'}
                    </span>
                    <button
                        type="button"
                        className={cx('statusToggle', { active: editor.is_active })}
                        onClick={onToggleActive}
                        title={editor.is_active ? 'Nhấn để tạm ngưng' : 'Nhấn để kích hoạt'}
                    >
                        <i />
                        <span>{editor.is_active ? 'Hoạt động' : 'Tạm ngưng'}</span>
                    </button>
                </div>

                <div className={cx('previewActions')}>
                    <div className={cx('zoomGroup')}>
                        <button type="button" onClick={onZoomOut}>
                            <FiMinus />
                        </button>
                        <span>{zoom}%</span>
                        <button type="button" onClick={onZoomIn}>
                            <FiPlus />
                        </button>
                    </div>

                    <button
                        type="button"
                        className={cx('iconBtn')}
                        onClick={handleToggleFullscreen}
                        title={isFullscreen ? 'Thoát toàn màn hình' : 'Xem toàn màn hình'}
                    >
                        {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
                    </button>

                    <button
                        type="button"
                        className={cx('downloadBtn')}
                        onClick={onDownloadPdf}
                    >
                        <FiDownload />
                        Tải PDF
                    </button>

                    <button
                        type="button"
                        className={cx('saveBtn', { saving })}
                        onClick={onSave}
                        disabled={saving || loadingTemplate}
                    >
                        <FiSave />
                        {getSaveLabel(saving, isCreate)}
                    </button>
                </div>
            </div>

            <div className={cx('canvas')}>
                <div
                    className={cx('renderedPreview')}
                    style={{ transform: `scale(${zoom / 100})` }}
                >
                    <CvPreview
                        pageRef={paperRef}
                        template={previewTemplate}
                        cv={previewCv}
                    />
                </div>
            </div>
        </main>
    );
}

export default RightPreview;
