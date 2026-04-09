import  { useMemo } from 'react';
import classNames from 'classnames/bind';
import styles from './CvPreview.module.scss';
import buildPreviewData from './utils/buildPreviewData';
import layoutResolver from './utils/layoutResolver';
const cx = classNames.bind(styles)
function CvPreview({ template, cv }) {
  const previewData = useMemo(() => {
    return buildPreviewData({ template, cv });
  }, [template, cv]);

  const config = previewData?.config || {};
  const theme = config?.theme || {};
  const page = config?.layout?.page || {};
  const margin = page?.margin || {};
  const layoutType = config?.layout?.body?.layout || 'STACK';

  const LayoutComponent = layoutResolver(layoutType);

  const pageStyle = {
    fontFamily: theme?.fontFamily || 'Arial, sans-serif',
    '--cv-primary': theme?.colors?.primary || '#008080',
    '--cv-accent': theme?.colors?.accent || '#4fd1c5',
    '--cv-item-gap': `${theme?.spacing?.itemGap || 12}px`,
    '--cv-section-gap': `${theme?.spacing?.sectionGap || 24}px`,
    paddingTop: `${margin?.top || 20}mm`,
    paddingRight: `${margin?.right || 20}mm`,
    paddingBottom: `${margin?.bottom || 20}mm`,
    paddingLeft: `${margin?.left || 20}mm`,
  };

  return (
    <div className={cx("previewShell")}>
      <div className={cx("page")} style={pageStyle}>
        <LayoutComponent previewData={previewData} />
      </div>
    </div>
  );
}

export default CvPreview;