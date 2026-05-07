// src/pages/Admin/ManageTemplates/TemplateEditor/TemplateEditor.jsx

import classNames from 'classnames/bind';
import { useRef } from 'react';

import LeftPanel from './LeftPanel';
import RightPreview from './RightPreview';
import useTemplateEditor from './useTemplateEditor';

import styles from './TemplateEditor.module.scss';

const cx = classNames.bind(styles);

function TemplateEditor() {
    const previewRef = useRef(null);

    const {
        isCreate,
        template,
        editor,
        zoom,
        saving,
        loadingTemplate,
        loadError,
        enabledSectionCount,
        handleChange,
        handleAutoGenerateCode,
        handleApplyPreset,
        handleToggleSection,
        handleToggleActive,
        handleTogglePremium,
        handleZoomIn,
        handleZoomOut,
        handleDownloadPdf,
        handleSave,
        handleCancel,
    } = useTemplateEditor({ previewRef });

    if (loadingTemplate) {
        return (
            <section className={cx('wrapper')}>
                <div className={cx('stateBox')}>Đang tải dữ liệu mẫu CV...</div>
            </section>
        );
    }

    if (loadError) {
        return (
            <section className={cx('wrapper')}>
                <div className={cx('stateBox', 'error')}>{loadError}</div>
            </section>
        );
    }

    return (
        <section className={cx('wrapper')}>
            <div className={cx('editorGrid')}>
                <LeftPanel
                    isCreate={isCreate}
                    editor={editor}
                    enabledSectionCount={enabledSectionCount}
                    onChange={handleChange}
                    onAutoGenerateCode={handleAutoGenerateCode}
                    onApplyPreset={handleApplyPreset}
                    onToggleSection={handleToggleSection}
                    onToggleActive={handleToggleActive}
                    onTogglePremium={handleTogglePremium}
                />

                <RightPreview
                    paperRef={previewRef}
                    template={template}
                    editor={editor}
                    zoom={zoom}
                    isCreate={isCreate}
                    saving={saving}
                    loadingTemplate={loadingTemplate}
                    onZoomIn={handleZoomIn}
                    onZoomOut={handleZoomOut}
                    onDownloadPdf={handleDownloadPdf}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    onToggleActive={handleToggleActive}
                />
            </div>
        </section>
    );
}

export default TemplateEditor;
