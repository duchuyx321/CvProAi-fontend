import classNames  from 'classnames/bind';
import styles from './StackLayout.module.scss';
import sectionResolver from '../../utils/sectionResolver';
const cx = classNames.bind(styles)
function StackLayout({ previewData }) {
  const { config, content } = previewData;
  const columns = config?.layout?.body?.columns || [];
  const zones = config?.zones || {};
  const sections = config?.sections || {};
  const theme = config?.theme || {};

  return (
    <div className={cx("layout")}>
      {columns.map((column) => {
        const zoneSections = zones?.[column.id] || [];

        return (
          <div key={column.id} className={cx("column")}>
            {zoneSections.map((sectionKey) => {
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
            })}
          </div>
        );
      })}
    </div>
  );
}

export default StackLayout;