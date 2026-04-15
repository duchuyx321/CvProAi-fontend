import classNames from 'classnames/bind';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiLayout, FiMenu } from 'react-icons/fi';

import EditorTabs from './components/EditorTabs';
import ContentTab from './components/ContentTab';
import DesignTab from './components/DesignTab';
import StructureTab from './components/StructureTab';
import EditorToolbar from '../EditorToolbar';
import styles from './LeftEditor.module.scss';
import images from '~/assets';

const cx = classNames.bind(styles);

function LeftEditor({
    isOpen = true,
    onTogglePanel,
    activeTab,
    setActiveTab,
    sectionList = [],
    openSections = {},
    onToggleSection,
    resumeData = {},
    onChangeField,
    onChangeArrayField,
    onChangeObjectInArray,
    templateConfig = {},
    onChangeConfig,
    onResetData,
    onSaveCv,
    onDownloadPdf,
    submitting = false,
    errors = {},
    isDirty = false,
    saveStatus = 'idle',
}) {
    const navigate = useNavigate();
    const confirmLeaveIfDirty = (nextPath) => {
        if (isDirty) {
            const ok = window.confirm(
                'Bạn có thay đổi chưa lưu. Nếu rời khỏi trang, dữ liệu chưa lưu có thể bị mất. Bạn vẫn muốn tiếp tục?',
            );
    
            if (!ok) return;
        }
    
        navigate(nextPath);
    };

    return (
        <aside className={cx('wrapper', { isClosed: !isOpen })}>
            <div className={cx('panel-header')}>
            <button
    type="button"
    className={cx('btn-icon')}
    onClick={() => confirmLeaveIfDirty('/cv-templates')}
    title="Quay lại Thư viện mẫu"
>
    <FiArrowLeft />
</button>

                <div className={cx('brand-group')}>
                    <img
                        src={images.logo}
                        alt="CvProAI Logo"
                        className={cx('logo-img')}
                    />
                    <span className={cx('brand')}>CvProAI</span>
                </div>

                <button
    type="button"
    className={cx('btn-template')}
    onClick={() => confirmLeaveIfDirty('/cv-templates')}
>
    <FiLayout /> Chọn mẫu
</button>

                <button
                    type="button"
                    className={cx('btn-icon', 'btn-toggle')}
                    onClick={onTogglePanel}
                    title="Ẩn bảng điều khiển"
                >
                    <FiMenu />
                </button>
            </div>

            <EditorTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <div className={cx('body')}>
            {activeTab === 'content' && (
    <ContentTab
        sectionList={sectionList}
        openSections={openSections}
        onToggleSection={onToggleSection}
        resumeData={resumeData}
        onChangeField={onChangeField}
        onChangeArrayField={onChangeArrayField}
        onChangeObjectInArray={onChangeObjectInArray}
        errors={errors}
    />
)}

                {activeTab === 'design' && (
                    <DesignTab
                        templateConfig={templateConfig}
                        onChangeConfig={onChangeConfig}
                    />
                )}

                {activeTab === 'structure' && (
                    <StructureTab
                        sectionList={sectionList}
                        templateConfig={templateConfig}
                        onChangeConfig={onChangeConfig}
                    />
                )}
            </div>

            <div className={cx('panel-footer')}>
    <div className={cx('editor-status')}>
        {saveStatus === 'unsaved' && (
            <span className={cx('status-badge', 'unsaved')}>
                Chưa lưu thay đổi
            </span>
        )}

        {saveStatus === 'saving' && (
            <span className={cx('status-badge', 'saving')}>
                Đang lưu...
            </span>
        )}

        {saveStatus === 'saved' && (
            <span className={cx('status-badge', 'saved')}>
                Đã lưu
            </span>
        )}

        {saveStatus === 'error' && (
            <span className={cx('status-badge', 'error')}>
                Lưu thất bại
            </span>
        )}
    </div>

    <EditorToolbar
        onResetData={onResetData}
        onSaveCv={onSaveCv}
        onDownloadPdf={onDownloadPdf}
        submitting={submitting}
    />
</div>
        </aside>
    );
}

export default LeftEditor;
