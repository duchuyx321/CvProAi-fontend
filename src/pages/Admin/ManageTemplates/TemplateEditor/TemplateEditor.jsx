// src/pages/Admin/ManageTemplates/TemplateEditor/TemplateEditor.jsx

import classNames from 'classnames/bind';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

import Button from '~/components/Button';
import { config } from '~/config';

import LeftPanel from './LeftPanel';
import RightPreview from './RightPreview';
import useTemplateEditor from './useTemplateEditor';

import styles from './TemplateEditor.module.scss';

const cx = classNames.bind(styles);

function TemplateEditor() {
    const navigate = useNavigate();
    const previewRef = useRef(null);

    const {
        isCreate,
        template,
        editor,
        zoom,
        saving,
        isDirty,
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

    const handleBackToList = () => {
        if (isDirty) {
            const ok = window.confirm(
                'Bạn có thay đổi chưa lưu. Vẫn rời trang?',
            );
            if (!ok) return;
        }
        navigate(config.router.manageTemplates);
    };

    return (
        <section className={cx('wrapper')}>
            <header className={cx('topBar')}>
                <button
                    type="button"
                    className={cx('backBtn')}
                    onClick={handleBackToList}
                >
                    <FiArrowLeft />
                    Quay lại danh sách
                </button>

                <div className={cx('topBarTitle')}>
                    <h1>
                        {isCreate
                            ? 'Tạo mẫu CV mới'
                            : 'Chỉnh sửa mẫu CV'}
                    </h1>
                    <p>
                        {isCreate
                            ? 'Thiết lập layout, phong cách và cấu trúc cho mẫu CV mới.'
                            : 'Cập nhật giao diện, trạng thái và cấu trúc mẫu CV.'}
                    </p>
                </div>

                <div className={cx('topBarActions')}>
                    {!isCreate && (
                        <span
                            className={cx('statePill', {
                                active: editor.is_active,
                            })}
                        >
                            {editor.is_active ? 'Đang hoạt động' : 'Tạm ngưng'}
                        </span>
                    )}

                    <button
                        type="button"
                        className={cx('cancelBtn')}
                        onClick={handleCancel}
                    >
                        Hủy
                    </button>

                    <Button
                        primary
                        onClick={handleSave}
                        disabled={saving || loadingTemplate}
                        className={cx('saveBtn')}
                    >
                        {saving
                            ? isCreate
                                ? 'Đang tạo...'
                                : 'Đang cập nhật...'
                            : isCreate
                              ? 'Tạo mẫu CV'
                              : 'Cập nhật thay đổi'}
                    </Button>
                </div>
            </header>

            {loadingTemplate ? (
                <div className={cx('stateBox')}>
                    Đang tải dữ liệu mẫu CV...
                </div>
            ) : loadError ? (
                <div className={cx('stateBox', 'error')}>{loadError}</div>
            ) : (
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
                        onZoomIn={handleZoomIn}
                        onZoomOut={handleZoomOut}
                        onDownloadPdf={handleDownloadPdf}
                    />
                </div>
            )}
        </section>
    );
}

export default TemplateEditor;
