import { useMemo, useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './StructureTab.module.scss';

const cx = classNames.bind(styles);

function StructureTab({
    sectionList = [],
    templateConfig = {},
    onChangeConfig,
}) {
    const containerRef = useRef(null);

    const layoutBody = templateConfig?.layout?.body || {};
    const layoutType = (layoutBody?.layout || 'STACK').toUpperCase();
    const columns = layoutBody?.columns || [];
    const zones = templateConfig?.zones || {};
    const sections = templateConfig?.sections || {};

    const sectionMetaMap = useMemo(() => {
        const map = {};

        sectionList.forEach((item) => {
            map[item.zoneKey || item.key] = item.title;
        });

        Object.keys(sections).forEach((key) => {
            if (!map[key]) {
                map[key] = sections?.[key]?.title || key;
            }
        });

        return map;
    }, [sectionList, sections]);

    const allSectionKeys = useMemo(() => {
        const fromList = sectionList.map((item) => item.zoneKey || item.key);
        const fromConfig = Object.keys(sections);
        return [...new Set([...fromList, ...fromConfig])];
    }, [sectionList, sections]);

    const usedSectionKeys = useMemo(() => {
        return Object.values(zones).flat().filter(Boolean);
    }, [zones]);

    const unusedSectionKeys = allSectionKeys.filter(
        (key) => !usedSectionKeys.includes(key),
    );

    const updateStructure = (nextZones, nextColumns = columns) => {
        if (!onChangeConfig) return;

        onChangeConfig({
            ...templateConfig,
            zones: nextZones,
            layout: {
                ...(templateConfig?.layout || {}),
                body: {
                    ...layoutBody,
                    layout: layoutType,
                    columns: nextColumns,
                },
            },
        });
    };

    const handleDragStart = (e, sectionKey) => {
        e.dataTransfer.setData('sectionKey', sectionKey);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, targetZoneId) => {
        e.preventDefault();

        const sectionKey = e.dataTransfer.getData('sectionKey');
        if (!sectionKey) return;

        const nextZones = { ...zones };

        Object.keys(nextZones).forEach((zoneId) => {
            nextZones[zoneId] = (nextZones[zoneId] || []).filter(
                (key) => key !== sectionKey,
            );
        });

        if (targetZoneId !== 'unused') {
            nextZones[targetZoneId] = [
                ...(nextZones[targetZoneId] || []),
                sectionKey,
            ];
        }

        updateStructure(nextZones);
    };

    const handleMouseDown = (e, leftIdx, rightIdx) => {
        e.preventDefault();

        if (!containerRef.current) return;

        const startX = e.clientX;
        const containerWidth = containerRef.current.offsetWidth;
        const startLeftWidth = columns[leftIdx]?.width || 30;

        const onMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaPercent = (deltaX / containerWidth) * 100;

            let newLeftWidth = startLeftWidth + deltaPercent;
            if (newLeftWidth < 20) newLeftWidth = 20;
            if (newLeftWidth > 80) newLeftWidth = 80;

            const nextColumns = [...columns];
            nextColumns[leftIdx] = {
                ...nextColumns[leftIdx],
                width: Math.round(newLeftWidth),
            };
            nextColumns[rightIdx] = {
                ...nextColumns[rightIdx],
                width: Math.round(100 - newLeftWidth),
            };

            updateStructure(zones, nextColumns);
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const renderDragItem = (sectionKey) => (
        <div
            key={sectionKey}
            draggable
            onDragStart={(e) => handleDragStart(e, sectionKey)}
            className={cx('drag-item')}
        >
            {sectionMetaMap[sectionKey] || sectionKey}
        </div>
    );

    const renderZoneColumn = (column) => {
        const zoneItems = zones?.[column.id] || [];

        return (
            <div
                key={column.id}
                className={cx('column')}
                style={{ width: `${column.width || 100}%` }}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
            >
                {zoneItems.map(renderDragItem)}
                {zoneItems.length === 0 && (
                    <div className={cx('empty-placeholder')}>
                        Thả mục vào đây
                    </div>
                )}
            </div>
        );
    };

    const renderLayoutArea = () => {
        if (layoutType === 'STACK') {
            const mainColumn = columns[0] || { id: 'main_col', width: 100 };

            return (
                <div
                    className={cx('column', 'col-full')}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, mainColumn.id)}
                >
                    {(zones?.[mainColumn.id] || []).map(renderDragItem)}
                    {!(zones?.[mainColumn.id] || []).length && (
                        <div className={cx('empty-placeholder')}>
                            Thả mục vào đây
                        </div>
                    )}
                </div>
            );
        }

        if (layoutType === 'SPLIT') {
            const leftCol = columns[0] || { id: 'side_col', width: 30 };
            const rightCol = columns[1] || { id: 'main_col', width: 70 };

            return (
                <div className={cx('split-container')} ref={containerRef}>
                    {renderZoneColumn(leftCol)}

                    <div
                        className={cx('divider')}
                        onMouseDown={(e) => handleMouseDown(e, 0, 1)}
                    >
                        <div className={cx('handle')}></div>
                    </div>

                    {renderZoneColumn(rightCol)}
                </div>
            );
        }

        if (layoutType === 'BANNER_SPLIT') {
            const bannerCol = columns[0] || { id: 'banner', width: 100 };
            const leftCol = columns[1] || { id: 'side_col', width: 30 };
            const rightCol = columns[2] || { id: 'main_col', width: 70 };

            return (
                <div className={cx('banner-split-container')}>
                    <div className={cx('header-zone')}>
                        <div
                            className={cx('column', 'col-full')}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, bannerCol.id)}
                        >
                            {(zones?.[bannerCol.id] || []).map(renderDragItem)}
                            {!(zones?.[bannerCol.id] || []).length && (
                                <div className={cx('empty-placeholder')}>
                                    Thả mục vào đây
                                </div>
                            )}
                        </div>
                    </div>

                    <div className={cx('split-container')} ref={containerRef}>
                        {renderZoneColumn(leftCol)}

                        <div
                            className={cx('divider')}
                            onMouseDown={(e) => handleMouseDown(e, 1, 2)}
                        >
                            <div className={cx('handle')}></div>
                        </div>

                        {renderZoneColumn(rightCol)}
                    </div>
                </div>
            );
        }

        return <div>Chưa hỗ trợ layout này</div>;
    };

    return (
        <div className={cx('wrapper')}>
            <p className={cx('description')}>
                Kéo thả để đưa mục vào cột. Kéo đường phân cách ở giữa để thay
                đổi diện tích cột.
            </p>

            <div className={cx('active-area')}>{renderLayoutArea()}</div>

            <div
                className={cx('unused-area')}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'unused')}
            >
                <h4 className={cx('unused-title')}>MỤC CHƯA SỬ DỤNG</h4>
                <div className={cx('unused-grid')}>
                    {unusedSectionKeys.map(renderDragItem)}
                    {unusedSectionKeys.length === 0 && (
                        <span style={{ color: '#94a3b8', fontSize: 13 }}>
                            Đã sử dụng hết các mục
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default StructureTab;
