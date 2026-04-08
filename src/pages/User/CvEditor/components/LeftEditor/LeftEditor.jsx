import classNames from 'classnames/bind';

import EditorTabs from './components/EditorTabs';
import ContentTab from './components/ContentTab';
import DesignTab from './components/DesignTab';
import StructureTab from './components/StructureTab';
import EditorToolbar from '../EditorToolbar';
import styles from './LeftEditor.module.scss';

const cx = classNames.bind(styles);

function LeftEditor({
  activeTab,
  setActiveTab,
  sectionList = [],
  openSections = {},
  onToggleSection,
  resumeData = {},
  onChangeField,
  onChangeArrayField,
  onChangeObjectInArray,
  onAddSection,
  onSaveCv,
  onDownloadPdf,
  submitting = false,
}) {
  return (
    <aside className={cx('wrapper')}>
      <EditorTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className={cx('body')}>
        {activeTab === 'content' ? (
          <ContentTab
            sectionList={sectionList}
            openSections={openSections}
            onToggleSection={onToggleSection}
            resumeData={resumeData}
            onChangeField={onChangeField}
            onChangeArrayField={onChangeArrayField}
            onChangeObjectInArray={onChangeObjectInArray}
          />
        ) : null}

        {activeTab === 'design' ? <DesignTab /> : null}

        {activeTab === 'structure' ? (
          <StructureTab sectionList={sectionList} />
        ) : null}
      </div>

      <EditorToolbar
        onAddSection={onAddSection}
        onSaveCv={onSaveCv}
        onDownloadPdf={onDownloadPdf}
        submitting={submitting}
      />
    </aside>
  );
}

export default LeftEditor;