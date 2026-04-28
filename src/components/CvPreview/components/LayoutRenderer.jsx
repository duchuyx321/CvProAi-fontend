import classNames from 'classnames/bind';
import styles from '../CvPreview.module.scss';
import ZoneRenderer from './ZoneRenderer';

const cx = classNames.bind(styles);

function getColumns(config = {}) {
    return config?.layout?.body?.columns?.length
        ? config.layout.body.columns
        : [{ id: 'main', width: 100 }];
}

function getGridTemplate(columns = []) {
    return columns
        .map((column) => `minmax(0, ${Number(column?.width || 100)}fr)`)
        .join(' ');
}

function getBodyColumns(config = {}) {
    const columns = getColumns(config);

    if (config?.layout?.body?.layout !== 'BANNER_SPLIT') return columns;

    const bodyColumns = columns.filter((column) => column?.id !== 'banner');

    return bodyColumns.length ? bodyColumns : columns;
}

function renderColumn(column, props, className) {
    return (
        <ZoneRenderer
            key={column.id}
            zoneKey={column.id}
            config={props.config}
            content={props.content}
            theme={props.theme}
            layoutType={props.layoutType}
            className={className}
            style={column?.style}
        />
    );
}

function LayoutRenderer({ config, content, theme }) {
    const layoutType = config?.layout?.body?.layout || 'STACK';
    const columns = getBodyColumns(config);
    const props = { config, content, theme, layoutType };

    // Get profile container height for banner minHeight
    const profileSection = config?.sections?.profile;
    const profileContainerHeight = profileSection?.style?.container?.height;

    if (layoutType === 'SPLIT') {
        return (
            <div
                className={cx('layoutSplit')}
                style={{ gridTemplateColumns: getGridTemplate(columns) }}
            >
                {columns.map((column, index) =>
                    renderColumn(
                        column,
                        props,
                        index === 0 ? 'zoneLeft' : 'zoneRight',
                    ),
                )}
            </div>
        );
    }

    if (layoutType === 'BANNER_SPLIT') {
        // Banner style with minHeight from profile container height
        const bannerStyle = profileContainerHeight
            ? { minHeight: profileContainerHeight }
            : {};

        return (
            <div className={cx('layoutBanner')}>
                <ZoneRenderer
                    zoneKey="banner"
                    config={config}
                    content={content}
                    theme={theme}
                    layoutType={layoutType}
                    className="zoneBanner"
                    style={bannerStyle}
                />
                <div
                    className={cx('layoutSplit', 'layoutBannerBody')}
                    style={{ gridTemplateColumns: getGridTemplate(columns) }}
                >
                    {columns.map((column, index) =>
                        renderColumn(
                            column,
                            props,
                            index === 0 ? 'zoneLeft' : 'zoneRight',
                        ),
                    )}
                </div>
            </div>
        );
    }

    const mainColumn = columns.find((column) => column.id === 'main') ||
        columns[0] || { id: 'main' };

    return (
        <div className={cx('layoutStack')}>
            {renderColumn(mainColumn, props, 'zoneMain')}
        </div>
    );
}

export default LayoutRenderer;
