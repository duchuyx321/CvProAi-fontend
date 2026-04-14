import classNames from 'classnames/bind';
import styles from './SectionList.module.scss';
import SectionItem from '../SectionItem';

const cx = classNames.bind(styles);

function SectionList({
    sections = [],
    openSections = {},
    resumeData = {},
    onToggleSection,
    onRemoveSection,
    onAddSectionItem,
    onChangeField,
    onChangeArrayField,
    onChangeObjectInArray,
}) {
    if (!Array.isArray(sections) || sections.length === 0) {
        return null;
    }

    return (
        <div className={cx('wrapper')}>
            {sections.map((section) => {
                const sectionKey = section?.key;
                const sectionData =
                    sectionKey && resumeData
                        ? resumeData[sectionKey]
                        : undefined;

                return (
                    <SectionItem
                        key={sectionKey}
                        section={section}
                        isOpen={Boolean(openSections?.[sectionKey])}
                        sectionData={sectionData}
                        onToggleSection={onToggleSection}
                        onRemoveSection={onRemoveSection}
                        onAddSectionItem={onAddSectionItem}
                        onChangeField={onChangeField}
                        onChangeArrayField={onChangeArrayField}
                        onChangeObjectInArray={onChangeObjectInArray}
                    />
                );
            })}
        </div>
    );
}

export default SectionList;