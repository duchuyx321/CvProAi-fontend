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

    // Lấy các giá trị lề của trang
    const pTop = page?.margin?.top ?? 24;
    const pRight = page?.margin?.right ?? 24;
    const pBottom = page?.margin?.bottom ?? 24;
    const pLeft = page?.margin?.left ?? 24;

    const bodyGap = `${body?.gap ?? 24}px`;
    const sectionGap = `${theme?.spacing?.section_gap ?? 24}px`;

    // 1. STYLE CỦA TỜ GIẤY (Đã gỡ padding để làm Full-Bleed)
    const pageStyle = {
        display: 'flex',
        flexDirection: 'column',
        fontFamily: theme?.typography?.font_family || 'Inter, sans-serif',
    };

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
            <div 
                className={cx('stack')} 
                style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    flex: 1, 
                    gap: sectionGap,
                    paddingTop: `${pTop}px`,
                    paddingRight: `${pRight}px`,
                    paddingBottom: `${pBottom}px`,
                    paddingLeft: `${pLeft}px`,
                }}
            >
                {zones.map(renderZone)}
            </div>
        );
    };

    const renderSplitLayout = () => {
        const leftWidth = columns[0]?.width_percent ?? 35;
        const rightWidth = columns[1]?.width_percent ?? (100 - leftWidth);

        return (
            <div 
                className={cx('split')} 
                style={{ 
                    display: 'flex', 
                    width: '100%',
                    flex: 1, 
                }}
            >
                {columns.map((column, index) => {
                    const colWidth = column?.width_percent ?? (index === 0 ? leftWidth : rightWidth);
                    const isLeft = index === 0;

                    return (
                        <div
                            key={column.id}
                            className={cx('col')}
                            style={{
                                width: `${colWidth}%`,
                                maxWidth: `${colWidth}%`,
                                flexBasis: `${colWidth}%`,
                                flexShrink: 0,
                                boxSizing: 'border-box',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: sectionGap,
                                wordBreak: 'break-word',
                                
                                // MÀU NỀN CỘT TRÁI (Tràn sát mép)
                                backgroundColor: isLeft ? (theme?.colors?.bg_soft || '#f1f5f9') : 'transparent',
                                
                                // PADDING LỆCH: Để chữ không dính vào mép giấy, và tạo khoảng trống giữa 2 cột (thay cho gap)
                                paddingTop: `${pTop}px`,
                                paddingBottom: `${pBottom}px`,
                                paddingLeft: isLeft ? `${pLeft}px` : `calc(${bodyGap} / 2)`,
                                paddingRight: isLeft ? `calc(${bodyGap} / 2)` : `${pRight}px`,
                            }}
                        >
                            {(column?.zones || []).map(renderZone)}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderBannerSplitLayout = () => {
        const headerColumn = columns.find((item) => item.id === 'header');
        const leftColumn = columns.find((item) => item.id === 'left');
        const rightColumn = columns.find((item) => item.id === 'right');

        const leftWidth = leftColumn?.width_percent ?? 35;
        const rightWidth = rightColumn?.width_percent ?? (100 - leftWidth);

        return (
            <div className={cx('bannerSplit')} style={{ display: 'flex', flexDirection: 'column', width: '100%', flex: 1 }}>
                {headerColumn ? (
                    <div 
                        className={cx('header')} 
                        style={{ 
                            display: 'flex', flexDirection: 'column', gap: sectionGap, boxSizing: 'border-box',
                            backgroundColor: theme?.colors?.banner_bg || '#0f172a', color: '#ffffff',
                            paddingTop: `${pTop}px`, paddingRight: `${pRight}px`, paddingBottom: '24px', paddingLeft: `${pLeft}px`
                        }}
                    >
                        {(headerColumn?.zones || []).map(renderZone)}
                    </div>
                ) : null}

                <div className={cx('body')} style={{ display: 'flex', width: '100%', flex: 1 }}>
                    {leftColumn ? (
                        <div
                            className={cx('col')}
                            style={{
                                width: `${leftWidth}%`, maxWidth: `${leftWidth}%`, flexBasis: `${leftWidth}%`, flexShrink: 0,
                                boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: sectionGap, wordBreak: 'break-word',
                                backgroundColor: theme?.colors?.bg_soft || '#f1f5f9',
                                paddingTop: '24px', paddingBottom: `${pBottom}px`, paddingLeft: `${pLeft}px`, paddingRight: `calc(${bodyGap} / 2)`,
                            }}
                        >
                            {(leftColumn?.zones || []).map(renderZone)}
                        </div>
                    ) : null}

                    {rightColumn ? (
                        <div
                            className={cx('col')}
                            style={{
                                width: `${rightWidth}%`, maxWidth: `${rightWidth}%`, flexBasis: `${rightWidth}%`, flexShrink: 0,
                                boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: sectionGap, wordBreak: 'break-word',
                                paddingTop: '24px', paddingBottom: `${pBottom}px`, paddingLeft: `calc(${bodyGap} / 2)`, paddingRight: `${pRight}px`,
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
        split: () => renderSplitLayout(),
        banner_split: () => renderBannerSplitLayout(),
        stack: () => renderStackLayout(),
    };

    const renderLayout = () => {
        return TypeLayout?.[bodyType] ? TypeLayout[bodyType]() : renderStackLayout();
    };

    return (
        <Page style={pageStyle}>
            {/* THÊM flex: 1 ĐỂ TOÀN BỘ KHUNG KÉO DÀI XUỐNG ĐÁY GIẤY */}
            <div className={cx('wrapper')} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {renderLayout()}
            </div>
        </Page>
    );
}

export default Layout;