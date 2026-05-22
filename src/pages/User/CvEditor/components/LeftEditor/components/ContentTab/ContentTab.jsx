import classNames from 'classnames/bind';
import styles from './ContentTab.module.scss';
import SectionList from '../../components/SectionList';

const cx = classNames.bind(styles);

function ContentTab({
    sections = [],
    openSections = {},
    resumeData = {},
    onToggleSection,
    onRemoveSection,
    onAddSectionItem,
    onChangeField,
    onChangeArrayField,
    onChangeObjectInArray,
    aiRewrite,
}) {
    const hasSections = Array.isArray(sections) && sections.length > 0;

    if (!hasSections) {
        return (
            <div className={cx('wrapper')}>
                <div className={cx('emptyState')}>
                    <p>Chưa có mục nào trong cấu trúc CV.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cx('wrapper')}>
            <SectionList
                sections={sections}
                openSections={openSections}
                resumeData={resumeData}
                onToggleSection={onToggleSection}
                onRemoveSection={onRemoveSection}
                onAddSectionItem={onAddSectionItem}
                onChangeField={onChangeField}
                onChangeArrayField={onChangeArrayField}
                onChangeObjectInArray={onChangeObjectInArray}
                aiRewrite={aiRewrite}
            />
        </div>
    );
}

export default ContentTab;
