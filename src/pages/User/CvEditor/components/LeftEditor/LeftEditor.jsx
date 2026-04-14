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

const DEFAULT_ARRAY_ITEM_MAP = {
    skills: { name: '', description: '' },
    experience: {
        role: '',
        company: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '<p></p>',
    },
    projects: {
        name: '',
        role: '',
        start_date: '',
        end_date: '',
        technologies: '',
        description: '<p></p>',
    },
    education: {
        school: '',
        degree: '',
        start_date: '',
        end_date: '',
        is_current: false,
        description: '<p></p>',
    },
    certificates: {
        name: '',
        issuer: '',
        issue_date: '',
        description: '<p></p>',
    },
};

function normalizeSectionType(sectionKey, sectionConfig = {}) {
    const rawType = sectionConfig?.type || sectionKey;

    const typeMap = {
        profile: 'personal_info',
        profile_header: 'personal_info',
        contact: 'contact',
        CONTACT: 'contact',
        summary: 'summary',
        SUMMARY: 'summary',
        skills: 'skills',
        SKILLS: 'skills',
        experience: 'experience',
        EXPERIENCE: 'experience',
        projects: 'projects',
        PROJECTS: 'projects',
        education: 'education',
        EDUCATION: 'education',
        certificates: 'certificates',
        CERTIFICATES: 'certificates',
        additional: 'additional',
        ADDITIONAL: 'additional',
    };

    return typeMap[sectionKey] || typeMap[rawType] || sectionKey;
}

function buildSectionListFromConfig(templateConfig = {}) {
    const zones = templateConfig?.zones || {};
    const sections = templateConfig?.sections || {};

    const orderedKeys = Object.values(zones).flat().filter(Boolean);
    const uniqueOrderedKeys = [...new Set(orderedKeys)];

    return uniqueOrderedKeys.map((sectionKey, index) => {
        const sectionConfig = sections?.[sectionKey] || {};
        const normalizedType = normalizeSectionType(sectionKey, sectionConfig);

        return {
            key: sectionKey,
            zoneKey: sectionKey,
            title: sectionConfig?.title || sectionKey,
            type: normalizedType,
            number: index + 1,
            removable: REMOVABLE_SECTION_KEYS.has(sectionKey),
            expandable: !NON_EXPANDABLE_SECTION_KEYS.has(sectionKey),
            rawType: sectionConfig?.type || sectionKey,
            fields: sectionConfig?.fields || [],
            variant: sectionConfig?.variant || '',
        };
    });
}

function buildInitialOpenSections(sectionList = []) {
    if (!Array.isArray(sectionList) || sectionList.length === 0) return {};

    return sectionList.reduce((acc, section, index) => {
        acc[section.key] = index === 0;
        return acc;
    }, {});
}

function mapResumeDataBySection(templateConfig = {}, resumeData = {}) {
    const sections = templateConfig?.sections || {};
    const nextResumeData = { ...resumeData };

    Object.keys(sections).forEach((sectionKey) => {
        const normalizedType = normalizeSectionType(sectionKey, sections[sectionKey]);

        if (nextResumeData[sectionKey] !== undefined) return;

        switch (normalizedType) {
            case 'personal_info':
                nextResumeData[sectionKey] =
                    resumeData.profile || resumeData.personal_info || {};
                break;

            case 'contact':
                nextResumeData[sectionKey] = resumeData.contact || {};
                break;

            case 'summary':
                nextResumeData[sectionKey] = resumeData.summary || {};
                break;

            case 'skills':
                nextResumeData[sectionKey] = resumeData.skills || [];
                break;

            case 'experience':
                nextResumeData[sectionKey] = resumeData.experience || [];
                break;

            case 'projects':
                nextResumeData[sectionKey] = resumeData.projects || [];
                break;

            case 'education':
                nextResumeData[sectionKey] = resumeData.education || [];
                break;

            case 'certificates':
                nextResumeData[sectionKey] = resumeData.certificates || [];
                break;

            case 'additional':
                nextResumeData[sectionKey] = resumeData.additional || {};
                break;

            default:
                nextResumeData[sectionKey] = resumeData[sectionKey] || {};
                break;
        }
    });

    return nextResumeData;
}

function createDefaultArrayItem(sectionKey, sectionType) {
    return (
        DEFAULT_ARRAY_ITEM_MAP[sectionKey] ||
        DEFAULT_ARRAY_ITEM_MAP[sectionType] ||
        {}
    );
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
    submitting = false,
}) {
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('content');
    const [openSections, setOpenSections] = useState({});

    const sectionList = useMemo(
        () => buildSectionListFromConfig(templateConfig),
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

        const section = sectionList.find((item) => item.key === sectionKey);
        const sectionType = section?.type || sectionKey;
        const currentValue = normalizedResumeData?.[sectionKey];

        if (Array.isArray(currentValue)) {
            const nextItem = createDefaultArrayItem(sectionKey, sectionType);
            onChangeArrayField?.(sectionKey, [...currentValue, nextItem]);
        }

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
                    submitting={submitting}
                />
            </div>
        </aside>
    );
}

export default LeftEditor;