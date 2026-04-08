import classNames from 'classnames/bind';
import SectionEditor from '../SectionEditor';
import styles from './ContentTab.module.scss';

const cx = classNames.bind(styles);

function ContentTab({
    sectionList = [],
    openSections = {},
    onToggleSection,
    resumeData = {},
    onChangeField,
    onChangeArrayField,
    onChangeObjectInArray
}) {
    return (
        <div className={cx('wrapper')}>
            {sectionList.map((section) => (
                <SectionEditor
                    key={section.key}
                    section={section}
                    isOpen={openSections?.[section.key]}
                    onToggle={() => onToggleSection(section.key)}
                    resumeData={resumeData}
                    onChangeField={onChangeField}
                    onChangeArrayField={onChangeArrayField}
                    onChangeObjectInArray={onChangeObjectInArray}
                />
            ))}
        </div>
    );
}

export default ContentTab;