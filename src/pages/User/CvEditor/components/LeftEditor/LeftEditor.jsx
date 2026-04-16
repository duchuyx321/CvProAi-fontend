import { useEffect, useMemo, useState } from 'react';
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
import { config } from '~/config';
import {
    buildSectionListFromConfig,
    createDefaultArrayItem,
    mapResumeDataBySection,
} from '~/utils/cv-section.schema';

const cx = classNames.bind(styles);

const EDITOR_TABS = [
    { key: 'content', label: 'Nội dung' },
    { key: 'design', label: 'Thiết kế' },
    { key: 'structure', label: 'Cấu trúc CV' },
];

const REMOVABLE_SECTION_KEYS = new Set([
    'contact',
    'skills',
    'experience',
    'projects',
    'education',
    'certificates',
    'additional',
    'languages',
    'awards',
    'references',
]);

const NON_EXPANDABLE_SECTION_KEYS = new Set([]);

const SECTION_LIST_OPTIONS = {
    removableSectionKeys: REMOVABLE_SECTION_KEYS,
    nonExpandableSectionKeys: NON_EXPANDABLE_SECTION_KEYS,
};

function buildInitialOpenSections(sectionList = []) {
    if (!Array.isArray(sectionList) || sectionList.length === 0) return {};

    return sectionList.reduce((acc, section, index) => {
        acc[section.key] = index === 0;
        return acc;
    }, {});
}

function LeftEditor({
    isOpen = true,
    onTogglePanel,
    resumeData = {},
    onChangeField,
    onChangeArrayField,
    onChangeObjectInArray,
    onRemoveSection,
    templateConfig = {},
    onChangeConfig,
    onResetData,
    onSaveCv,
    onDownloadPdf,
    canDownloadPdf = false,
    canSave = false,
    submitting = false,
    cvName = '',
    onChangeCvName,
}) {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('content');
    const [openSections, setOpenSections] = useState({});

    const handleChangeCvTitle = (valueOrEvent) => {
        onChangeCvName?.(valueOrEvent?.target?.value ?? valueOrEvent ?? '');
    };

    const handleNavigateWithConfirm = (path) => {
        const confirmed = window.confirm(
            'Những thay đổi bạn đã thực hiện có thể không được lưu lại. Bạn có chắc muốn rời khỏi trang này không?',
        );

        if (!confirmed) return;

        navigate(path);
    };

    const sectionList = useMemo(
        () => buildSectionListFromConfig(templateConfig, SECTION_LIST_OPTIONS),
        [templateConfig],
    );

    const normalizedResumeData = useMemo(
        () => mapResumeDataBySection(templateConfig, resumeData),
        [templateConfig, resumeData],
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOpenSections((prev) => {
            const initialState = buildInitialOpenSections(sectionList);
            const nextState = {};

            sectionList.forEach((section) => {
                nextState[section.key] =
                    typeof prev[section.key] === 'boolean'
                        ? prev[section.key]
                        : Boolean(initialState[section.key]);
            });

            return nextState;
        });
    }, [sectionList]);

    const handleToggleSection = (sectionKey) => {
        setOpenSections((prev) => ({
            ...prev,
            [sectionKey]: !prev[sectionKey],
        }));
    };

    const handleRemoveEditorSection = (sectionKey) => {
        if (!sectionKey) return;

        const nextZones = { ...(templateConfig?.zones || {}) };

        Object.keys(nextZones).forEach((zoneId) => {
            nextZones[zoneId] = (nextZones[zoneId] || []).filter(
                (key) => key !== sectionKey,
            );
        });

        onChangeConfig?.({
            ...templateConfig,
            zones: nextZones,
        });

        setOpenSections((prev) => {
            const nextState = { ...prev };
            delete nextState[sectionKey];
            return nextState;
        });

        onRemoveSection?.(sectionKey);
    };

    const handleAddSectionItem = (sectionKey) => {
        if (!sectionKey) return;

        const currentValue = normalizedResumeData?.[sectionKey];
        const sectionConfig = templateConfig?.sections?.[sectionKey] || {};

        if (!Array.isArray(currentValue)) return;

        const nextItem = createDefaultArrayItem(sectionKey, sectionConfig);

        onChangeArrayField?.(sectionKey, [...currentValue, nextItem]);

        setOpenSections((prev) => ({
            ...prev,
            [sectionKey]: true,
        }));
    };

    return (
        <aside className={cx('wrapper', { isClosed: !isOpen })}>
            <div className={cx('panel-header')}>
                <button
                    type="button"
                    className={cx('btn-icon')}
                    onClick={() => handleNavigateWithConfirm(config.router.cvSample)}
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

                <div className={cx('cvTitleBox')}>
                    <input
                        type="text"
                        className={cx('cvTitleInput')}
                        value={cvName || ''}
                        onChange={handleChangeCvTitle}
                        placeholder="CV chưa đặt tên"
                        maxLength={120}
                        disabled={submitting}
                    />
                </div>

                <button
                    type="button"
                    className={cx('btn-template')}
                    onClick={() => handleNavigateWithConfirm(config.router.cvSample)}
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

            <EditorTabs
                tabs={EDITOR_TABS}
                activeTab={activeTab}
                onChangeTab={setActiveTab}
            />

            <div className={cx('body')}>
                {activeTab === 'content' && (
                    <ContentTab
                        sections={sectionList}
                        openSections={openSections}
                        resumeData={normalizedResumeData}
                        onToggleSection={handleToggleSection}
                        onRemoveSection={handleRemoveEditorSection}
                        onAddSectionItem={handleAddSectionItem}
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
                    canDownloadPdf={canDownloadPdf}
                    submitting={submitting}
                    canSave={canSave}
                />
            </div>
        </aside>
    );
}

export default LeftEditor;