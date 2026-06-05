import classNames from 'classnames/bind';
import styles from '../CvPreview.module.scss';
import SectionRenderer from './SectionRenderer';
import { normalizeBoxStyle } from '../utils/styleUtils';

const cx = classNames.bind(styles);

function ZoneRenderer({
    zoneKey,
    config,
    content,
    theme,
    layoutType,
    className,
    style,
    hidden = false,
}) {
    const sectionKeys = config?.zones?.[zoneKey] || [];
    if (!sectionKeys.length) return null;

    return (
        <div
            className={cx('zone', className)}
            data-zone-key={zoneKey}
            data-cv-zone={zoneKey}
            data-cv-zone-hidden={hidden ? 'true' : undefined}
            data-layout-type={layoutType}
            aria-hidden={hidden ? 'true' : undefined}
            style={normalizeBoxStyle(style)}
        >
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
