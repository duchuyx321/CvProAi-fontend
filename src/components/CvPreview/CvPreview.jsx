import { useMemo } from 'react';
import classNames from 'classnames/bind';
import styles from './CvPreview.module.scss';
import buildPreviewData from './utils/buildPreviewData';
import ZoneRenderer from './components/ZoneRenderer';

const cx = classNames.bind(styles);

function CvPreview({ template, cv }) {
    const previewData = useMemo(
        () => buildPreviewData({ template, cv }),
        [template, cv],
    );

    const config = previewData?.config || {};
    const content = previewData?.content || cv?.content || {};
    const theme = config?.theme || {};
    const page = config?.layout?.page || {};
    const margin = page?.margin || {};
    const layoutType = config?.layout?.body?.layout || 'STACK';
    const columns = config?.layout?.body?.columns || [];

    const leftCol = columns[0]?.id || 'left_col';
    const rightCol = columns[1]?.id || 'right_col';
    const leftWidth = columns[0]?.width || 35;
    const rightWidth = columns[1]?.width || 65;
    const primary = theme?.colors?.primary || '#3b6fa3';
    const accent = theme?.colors?.accent || '#eaf2fb';
    const bg_session = theme?.colors?.bg_session || '#ffff';

    const pageStyle = {
        fontFamily: theme?.fontFamily || 'Arial, sans-serif',
        fontSize: `${theme?.fontSize || 12}px`,      
        '--cv-primary': primary,
        '--cv-accent': accent,
        '--cv-item-gap': `${theme?.spacing?.itemGap || 12}px`,
        '--cv-section-gap': `${theme?.spacing?.sectionGap || 24}px`,
        '--bg-session': bg_session,
        paddingTop: `${margin?.top || 12}mm`,
        paddingRight: `${margin?.right || 12}mm`,
        paddingBottom: `${margin?.bottom || 12}mm`,
        paddingLeft: `${margin?.left || 12}mm`,
        '--cv-avatar-radius': theme?.avatar_shape === 'circle' ? '50%' : '8px',
    };

    return (
        <div className={cx('previewShell')}>
            <div className={cx('page')} style={pageStyle}>
                {layoutType === 'STACK' ? (
                    <div className={cx('layoutStack')}>
                        <ZoneRenderer
                            zoneKey="main"
                            config={config}
                            content={content}
                            theme={theme}
                            layoutType={layoutType}
                        />
                    </div>
                ) : null}

                {layoutType === 'SPLIT' ? (
                    <div
                        className={cx('layoutSplit')}
                        style={{
                            gridTemplateColumns: `minmax(0, ${leftWidth}fr) minmax(0, ${rightWidth}fr)`,
                        }}
                    >
                        <ZoneRenderer
                            zoneKey={leftCol}
                            config={config}
                            content={content}
                            theme={theme}
                            layoutType={layoutType}
                            className="zoneLeft"
                        />
                        <ZoneRenderer
                            zoneKey={rightCol}
                            config={config}
                            content={content}
                            theme={theme}
                            layoutType={layoutType}
                            className="zoneRight"
                        />
                    </div>
                ) : null}

                {layoutType === 'BANNER_SPLIT' ? (
                    <div className={cx('layoutBanner')}>
                        <ZoneRenderer
                            zoneKey="banner"
                            config={config}
                            content={content}
                            theme={theme}
                            layoutType={layoutType}
                            className="zoneBanner"
                        />

                        <div
                            className={cx('layoutSplit')}
                            style={{
                                gridTemplateColumns: `${leftWidth}% ${rightWidth}%`,
                            }}
                        >
                            <ZoneRenderer
                                zoneKey={leftCol}
                                config={config}
                                content={content}
                                theme={theme}
                                layoutType={layoutType}
                                className="zoneLeft"
                            />
                            <ZoneRenderer
                                zoneKey={rightCol}
                                config={config}
                                content={content}
                                theme={theme}
                                layoutType={layoutType}
                                className="zoneRight"
                            />
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default CvPreview;
