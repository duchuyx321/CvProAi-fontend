import { useState } from 'react';
import classNames from 'classnames/bind';
import { FaRegLightbulb } from 'react-icons/fa';

import { normalizeRewriteSectionKey } from '~/utils/ai-rewrite.utils';

import styles from './SectionItem.module.scss';
import SectionActions from '../SectionActions';

import PersonalInfoFields from './components/PersonalInfoFields';
import ContactFields from './components/ContactFields';
import SummaryFields from './components/SummaryFields';
import AdditionalFields from './components/AdditionalFields';
import SkillsFields from './components/SkillsFields';
import ExperienceFields from './components/ExperienceFields';
import ProjectsFields from './components/ProjectsFields';
import EducationFields from './components/EducationFields';
import CertificatesFields from './components/CertificatesFields';
import DynamicSectionFields from './components/DynamicSectionFields';

const cx = classNames.bind(styles);

const SECTION_RENDERERS = {
    personal_info: PersonalInfoFields,
    profile: PersonalInfoFields,
    profile_header: PersonalInfoFields,
    contact: ContactFields,
    summary: SummaryFields,
    additional: AdditionalFields,
    skills: SkillsFields,
    experience: ExperienceFields,
    projects: ProjectsFields,
    education: EducationFields,
    certificates: CertificatesFields,
};

function SectionItem({
    section,
    isOpen = false,
    sectionData,
    onToggleSection,
    onRemoveSection,
    onAddSectionItem,
    onChangeField,
    onChangeArrayField,
    onChangeObjectInArray,
    aiRewrite,
}) {
    const [isHovered, setIsHovered] = useState(false);

    const sectionType = section?.type || section?.key;
    const showDelete = Boolean(section?.removable && (isHovered || isOpen));
    const aiSectionKey = normalizeRewriteSectionKey(sectionType);
    const aiProposalCount =
        aiRewrite?.sectionCounts?.[aiSectionKey] ||
        aiRewrite?.sectionCounts?.[normalizeRewriteSectionKey(section?.key)] ||
        0;

    const handleToggle = () => {
        onToggleSection?.(section.key);
    };

    const handleRemove = () => {
        onRemoveSection?.(section.key);
    };

    const handleAdd = () => {
        onAddSectionItem?.(section.key);
    };

    const handleAiBadgeClick = (event) => {
        event.stopPropagation();
        aiRewrite?.onSelectSection?.(aiSectionKey);
    };

    const handleHeaderKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleToggle();
        }
    };

    const Renderer = SECTION_RENDERERS[sectionType];

    const renderSectionBody = () => {
        if (!Renderer) {
            return (
                <DynamicSectionFields
                    data={sectionData}
                    section={section}
                    sectionKey={section.key}
                    onChangeField={onChangeField}
                    onChangeArrayField={onChangeArrayField}
                    onChangeObjectInArray={onChangeObjectInArray}
                    aiRewrite={aiRewrite}
                />
            );
        }

        return (
            <Renderer
                data={sectionData}
                section={section}
                sectionKey={section.key}
                sectionType={sectionType}
                onChangeField={onChangeField}
                onChangeArrayField={onChangeArrayField}
                onChangeObjectInArray={onChangeObjectInArray}
                onAddSectionItem={onAddSectionItem}
                aiRewrite={aiRewrite}
            />
        );
    };

    return (
        <div
            className={cx('wrapper', { open: isOpen })}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={cx('header')}
                role="button"
                tabIndex={0}
                onClick={handleToggle}
                onKeyDown={handleHeaderKeyDown}
            >
                <div className={cx('left')}>
                    <div className={cx('meta')}>
                        <span className={cx('number')}>{section.number}.</span>
                        <span className={cx('title')}>{section.title}</span>
                        {aiRewrite?.isActive && aiProposalCount > 0 ? (
                            <button
                                type="button"
                                className={cx('aiBadge')}
                                onClick={handleAiBadgeClick}
                                title="Xem gợi ý AI của mục này"
                            >
                                <FaRegLightbulb />
                                <span>{aiProposalCount}</span>
                            </button>
                        ) : null}
                    </div>
                </div>

                <SectionActions
                    expandable={section.expandable}
                    expanded={isOpen}
                    removable={section.removable}
                    showDelete={showDelete}
                    onToggle={handleToggle}
                    onRemove={handleRemove}
                    onAdd={handleAdd}
                />
            </div>

            {isOpen && <div className={cx('body')}>{renderSectionBody()}</div>}
        </div>
    );
}

export default SectionItem;
