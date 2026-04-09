import classNames from 'classnames/bind';
import styles from './BannerSplitLayout.module.scss';
import sectionResolver from '../../utils/sectionResolver';
const cx = classNames.bind(classNames)
function renderZone({ zoneId, zones, sections, content, theme }) {
  const zoneSections = zones?.[zoneId] || [];

  return zoneSections.map((sectionKey) => {
    const sectionConfig = sections?.[sectionKey];
    if (!sectionConfig) return null;

    const SectionComponent = sectionResolver(sectionConfig.type);
    if (!SectionComponent) return null;

    return (
      <SectionComponent
        key={sectionKey}
        sectionKey={sectionKey}
        config={sectionConfig}
        data={content?.[sectionKey]}
        theme={theme}
      />
    );
  });
}

function BannerSplitLayout({ previewData }) {
  const { config, content } = previewData;
  const columns = config?.layout?.body?.columns || [];
  const zones = config?.zones || {};
  const sections = config?.sections || {};
  const theme = config?.theme || {};

  const bannerColumn = columns[0];
  const bodyColumns = columns.slice(1);

  return (
    <div className={cx("layout")}>
      <div className={cx("banner")}>
        {bannerColumn
          ? renderZone({
              zoneId: bannerColumn.id,
              zones,
              sections,
              content,
              theme,
            })
          : null}
      </div>

      <div className={cx("bottom")}>
        {bodyColumns.map((column) => (
          <div
            key={column.id}
            className={cx("column")}
            style={{ width: `${column.width}%` }}
          >
            {renderZone({
              zoneId: column.id,
              zones,
              sections,
              content,
              theme,
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BannerSplitLayout;