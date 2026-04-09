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
    onChangeObjectInArray,
}) {
    return (
        <div className={cx('wrapper')}>
            {sectionList.map((section) => (
                <SectionEditor
                    key={section.key}
                    section={section}
                    isOpen={openSections?.[section.key]}
                    onToggle={() => onToggleSection(section.key)}
                    sectionData={resumeData?.[section.key]}
                    onChangeField={(field, value) =>
                        onChangeField(section.key, field, value)
                    }
                    onChangeArrayField={(value) =>
                        onChangeArrayField(section.key, value)
                    }
                    onChangeObjectInArray={(index, key, value) =>
                        onChangeObjectInArray(section.key, index, key, value)
                    }
                />
            ))}
        </div>
    );
}

export default ContentTab;
