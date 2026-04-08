import classNames from 'classnames/bind';

import Page from '../Page';
import Section from '../Section';
import styles from './Layout.module.scss';

const cx = classNames.bind(styles);

function Layout({ resumeData = {}, templateConfig = {} }) {
    const layout = templateConfig?.layout || {};
    const page = layout?.page || {};
    const body = layout?.body || {};
    const sections = templateConfig?.sections || {};
    const theme = templateConfig?.theme || {};

    const bodyType = body?.type || 'stack';
    const columns = Array.isArray(body?.columns) ? body.columns : [];

    const pageStyle = {
        paddingTop: `${page?.margin?.top ?? 24}px`,
        paddingRight: `${page?.margin?.right ?? 24}px`,
        paddingBottom: `${page?.margin?.bottom ?? 24}px`,
        paddingLeft: `${page?.margin?.left ?? 24}px`,
        fontFamily: theme?.typography?.font_family || 'Inter, sans-serif',
    };

    const bodyGap = `${body?.gap ?? 24}px`;
    const sectionGap = `${theme?.spacing?.section_gap ?? 24}px`;

    const renderZone = (zoneKey) => (
        <Section
            key={zoneKey}
            zoneKey={zoneKey}
            resumeData={resumeData}
            sectionConfig={sections?.[zoneKey]}
            theme={theme}
        />
    );

    const renderStackLayout = () => {
        const mainColumn = columns[0];
        const zones = Array.isArray(mainColumn?.zones) ? mainColumn.zones : [];

        return (
            <div className={cx('stack')} style={{ gap: sectionGap }}>
                {zones.map(renderZone)}
            </div>
        );
    };

    const renderSplitLayout = () => {
        return (
            <div className={cx('split')} style={{ gap: bodyGap }}>
                {columns.map((column) => (
                    <div
                        key={column.id}
                        className={cx('col')}
                        style={{
                            width: `${column?.width_percent ?? 50}%`,
                            gap: sectionGap,
                        }}
                    >
                        {(column?.zones || []).map(renderZone)}
                    </div>
                ))}
            </div>
        );
    };

    const renderBannerSplitLayout = () => {
        const headerColumn = columns.find((item) => item.id === 'header');
        const leftColumn = columns.find((item) => item.id === 'left');
        const rightColumn = columns.find((item) => item.id === 'right');

        return (
            <div className={cx('bannerSplit')}>
                {headerColumn ? (
                    <div className={cx('header')} style={{ gap: sectionGap }}>
                        {(headerColumn?.zones || []).map(renderZone)}
                    </div>
                ) : null}

                <div className={cx('body')} style={{ gap: bodyGap }}>
                    {leftColumn ? (
                        <div
                            className={cx('col')}
                            style={{
                                width: `${leftColumn?.width_percent ?? 40}%`,
                                gap: sectionGap,
                            }}
                        >
                            {(leftColumn?.zones || []).map(renderZone)}
                        </div>
                    ) : null}

                    {rightColumn ? (
                        <div
                            className={cx('col')}
                            style={{
                                width: `${rightColumn?.width_percent ?? 60}%`,
                                gap: sectionGap,
                            }}
                        >
                            {(rightColumn?.zones || []).map(renderZone)}
                        </div>
                    ) : null}
                </div>
            </div>
        );
    };
    const TypeLayout = {
        split: renderSplitLayout(),
        banner_split: renderBannerSplitLayout(),
        stack: renderStackLayout(),
    }
    const renderLayout = () => {
        return TypeLayout?.[bodyType] || renderStackLayout();
    };

    return (
        <Page style={pageStyle}>
            <div className={cx('wrapper')}>{renderLayout()}</div>
        </Page>
    );
}

export default Layout;