import classNames from 'classnames/bind';
import styles from '../CvPreview.module.scss';
import SectionRenderer from './SectionRenderer';

const cx = classNames.bind(styles);

function ZoneRenderer({
    zoneKey,
    config,
    content,
    theme,
    layoutType,
    className,
}) {
    const sectionKeys = config?.zones?.[zoneKey] || [];
    if (!sectionKeys.length) return null;

    return (
        <div className={cx('zone', className)}>
            {sectionKeys.map((sectionKey) => {
                const section = config?.sections?.[sectionKey];
                if (!section) return null;

                return (
                    <SectionRenderer
                        key={sectionKey}
                        sectionKey={sectionKey}
                        section={section}
                        content={content}
                        theme={theme}
                        layoutType={layoutType}
                    />
                );
            })}
        </div>
    );
}

export default ZoneRenderer;
