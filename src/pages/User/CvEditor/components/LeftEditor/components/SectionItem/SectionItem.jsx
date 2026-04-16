import { useState } from 'react';
import classNames from 'classnames/bind';
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

function UnsupportedSection({ title }) {
    return (
        <div className={cx('emptyState')}>
            <p>Section này chưa được hỗ trợ: {title}</p>
        </div>
    );
}

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
}) {
    const [isHovered, setIsHovered] = useState(false);

    const sectionType = section?.type || section?.key;
    const showDelete = Boolean(section?.removable && (isHovered || isOpen));

    const handleToggle = () => {
        onToggleSection?.(section.key);
    };

    const handleRemove = () => {
        onRemoveSection?.(section.key);
    };

    const handleAdd = () => {
        onAddSectionItem?.(section.key);
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
            return <UnsupportedSection title={section?.title} />;
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