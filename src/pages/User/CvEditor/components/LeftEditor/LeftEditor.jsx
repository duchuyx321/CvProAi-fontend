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
}) {
    const navigate = useNavigate();

    return (
        <aside className={cx('wrapper', { isClosed: !isOpen })}>
            <div className={cx('panel-header')}>
                <button
                    type="button"
                    className={cx('btn-icon')}
                    onClick={() => navigate('/cv-templates')}
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

                <button type="button" className={cx('btn-template')}>
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
