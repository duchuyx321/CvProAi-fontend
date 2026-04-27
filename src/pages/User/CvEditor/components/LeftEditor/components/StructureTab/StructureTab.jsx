import { useRef, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './StructureTab.module.scss';

const cx = classNames.bind(styles);

function StructureTab({
    sectionList = [],
    templateConfig = {},
    onChangeConfig,
}) {
    const containerRef = useRef(null);
    const dragStateRef = useRef(null);
    const [dragState, setDragState] = useState(null);
    const [dropIndicator, setDropIndicator] = useState(null);

    const layoutBody = templateConfig?.layout?.body || {};
    const layoutType = (layoutBody?.layout || 'STACK').toUpperCase();
    const columns = layoutBody?.columns || [];
    const zones = templateConfig?.zones || {};
    const sections = templateConfig?.sections || {};

    // Banner height config for BANNER_SPLIT layout
    // Get real banner height from config (used for preview/export)
    const profileSection = sections?.profile;
    const profileContainerStyle = profileSection?.style?.container;
    // 1. Ưu tiên layoutBody.bannerHeight
    // 2. profileContainerStyle.height
    // 3. Fallback 245
    const realBannerHeight = layoutBody?.bannerHeight || profileContainerStyle?.height || 245;

    // Min/max height for resize (200..360)
    const MIN_BANNER_HEIGHT = 200;
    const MAX_BANNER_HEIGHT = 360;

    // Structural scale for display in StructureTab (smaller than real)
    const STRUCTURE_SCALE = 0.45;
    const structureBannerHeight = Math.round(realBannerHeight * STRUCTURE_SCALE);

    const sectionMetaMap = {};

    sectionList.forEach((item) => {
        sectionMetaMap[item.zoneKey || item.key] = item.title;
    });

    Object.keys(sections).forEach((key) => {
        if (!sectionMetaMap[key]) {
            sectionMetaMap[key] = sections?.[key]?.title || key;
        }
    });

    const fromList = sectionList.map((item) => item.zoneKey || item.key);
    const fromConfig = Object.keys(sections);
    const allSectionKeys = [...new Set([...fromList, ...fromConfig])];
    const usedSectionKeys = Object.values(zones).flat().filter(Boolean);

    const unusedSectionKeys = allSectionKeys.filter(
        (key) => !usedSectionKeys.includes(key),
    );

    const updateStructure = (nextZones, nextColumns = columns, nextRealBannerHeight = realBannerHeight) => {
        if (!onChangeConfig) return;

        // Always sync bannerHeight to sections.profile.style.container.height (real height for preview)
        const nextSections = {
            ...sections,
            profile: {
                ...sections.profile,
                style: {
                    ...sections.profile?.style,
                    container: {
                        ...sections.profile?.style?.container,
                        height: nextRealBannerHeight,
                    },
                },
            },
        };

        onChangeConfig({
            ...templateConfig,
            zones: nextZones,
            sections: nextSections,
            layout: {
                ...(templateConfig?.layout || {}),
                body: {
                    ...layoutBody,
                    layout: layoutType,
                    columns: nextColumns,
                    bannerHeight: nextRealBannerHeight,
                },
            },
        });
    };

    const cloneZones = () => {
        return Object.entries(zones || {}).reduce((result, [zoneId, items]) => {
            result[zoneId] = Array.isArray(items) ? [...items] : [];
            return result;
        }, {});
    };

    const clampIndex = (value, max) => {
        const numericValue = Number(value);
        if (Number.isNaN(numericValue)) return max;
        if (numericValue < 0) return 0;
        if (numericValue > max) return max;
        return numericValue;
    };

    const getDragPayload = (event) => {
        const payload = dragStateRef.current;
        if (payload?.sectionKey) return payload;

        try {
            return JSON.parse(event.dataTransfer.getData('application/json'));
        } catch {
            return {
                sectionKey: event.dataTransfer.getData('sectionKey'),
                sourceZoneId: '',
                sourceIndex: -1,
            };
        }
    };

    const moveSection = (
        sectionKey,
        targetZoneId,
        targetIndex,
        payload = {},
    ) => {
        if (!sectionKey) return;

        const nextZones = cloneZones();
        const isUnusedTarget = targetZoneId === 'unused';
        const sourceZoneId = payload?.sourceZoneId;
        const sourceIndex = payload?.sourceIndex;

        Object.keys(nextZones).forEach((zoneId) => {
            nextZones[zoneId] = (nextZones[zoneId] || []).filter(
                (key) => key !== sectionKey,
            );
        });

        if (!isUnusedTarget) {
            const zoneItemsBeforeRemove = zones?.[targetZoneId] || [];
            const sameZone = sourceZoneId === targetZoneId;
            const adjustedIndex =
                sameZone && sourceIndex >= 0 && sourceIndex < targetIndex
                    ? targetIndex - 1
                    : targetIndex;
            const nextZoneItems = nextZones[targetZoneId] || [];
            const insertIndex = clampIndex(adjustedIndex, nextZoneItems.length);

            if (!Array.isArray(zoneItemsBeforeRemove)) return;

            nextZoneItems.splice(insertIndex, 0, sectionKey);
            nextZones[targetZoneId] = nextZoneItems;
        }

        updateStructure(nextZones);
    };

    const clearDragState = () => {
        dragStateRef.current = null;
        setDragState(null);
        setDropIndicator(null);
    };

    const handleDragStart = (event, sectionKey, sourceZoneId, sourceIndex) => {
        const payload = {
            sectionKey,
            sourceZoneId,
            sourceIndex,
        };

        dragStateRef.current = payload;
        setDragState(payload);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('sectionKey', sectionKey);
        event.dataTransfer.setData('application/json', JSON.stringify(payload));
    };

    const handleDragOver = (event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    };

    const getZoneTargetIndex = (event) => {
        const itemNodes = Array.from(
            event.currentTarget.querySelectorAll(
                '[data-structure-item="true"]',
            ),
        );

        const nextIndex = itemNodes.findIndex((itemNode) => {
            const rect = itemNode.getBoundingClientRect();
            return event.clientY < rect.top + rect.height / 2;
        });

        return nextIndex === -1 ? itemNodes.length : nextIndex;
    };

    const handleZoneDragOver = (event, targetZoneId) => {
        handleDragOver(event);
        setDropIndicator({
            zoneId: targetZoneId,
            index: getZoneTargetIndex(event),
        });
    };

    const getItemTargetIndex = (event, itemIndex) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const insertAfter = event.clientY > rect.top + rect.height / 2;
        return itemIndex + (insertAfter ? 1 : 0);
    };

    const handleItemDragOver = (event, targetZoneId, itemIndex) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = 'move';

        setDropIndicator({
            zoneId: targetZoneId,
            index: getItemTargetIndex(event, itemIndex),
        });
    };

    const handleDrop = (event, targetZoneId, targetIndex) => {
        event.preventDefault();
        event.stopPropagation();

        const payload = getDragPayload(event);
        const sectionKey = payload?.sectionKey;

        if (!sectionKey) {
            clearDragState();
            return;
        }

        moveSection(sectionKey, targetZoneId, targetIndex, payload);
        clearDragState();
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

    const handleBannerResize = (e) => {
        e.preventDefault();

        const startY = e.clientY;
        const startHeight = realBannerHeight;

        const onMouseMove = (moveEvent) => {
            const deltaY = moveEvent.clientY - startY;
            let newHeight = startHeight + deltaY;

            if (newHeight < MIN_BANNER_HEIGHT) newHeight = MIN_BANNER_HEIGHT;
            if (newHeight > MAX_BANNER_HEIGHT) newHeight = MAX_BANNER_HEIGHT;

            updateStructure(zones, columns, newHeight);
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const renderDropIndicator = (zoneId, index) => {
        if (
            !dropIndicator ||
            dropIndicator.zoneId !== zoneId ||
            dropIndicator.index !== index ||
            zoneId === 'unused'
        ) {
            return null;
        }

        return <div className={cx('dropIndicator')} />;
    };

    const renderDragItem = (sectionKey, zoneId, index) => (
        <div
            key={sectionKey}
            data-structure-item="true"
            onDragOver={(e) => handleItemDragOver(e, zoneId, index)}
            onDrop={(e) => {
                const targetIndex = getItemTargetIndex(e, index);
                handleDrop(e, zoneId, targetIndex);
            }}
        >
            {renderDropIndicator(zoneId, index)}
            <div
                draggable
                onDragStart={(e) =>
                    handleDragStart(e, sectionKey, zoneId, index)
                }
                onDragEnd={clearDragState}
                className={cx('drag-item', {
                    dragging: dragState?.sectionKey === sectionKey,
                })}
            >
                {sectionMetaMap[sectionKey] || sectionKey}
            </div>
        </div>
    );

    const renderZoneColumn = (column) => {
        const zoneItems = zones?.[column.id] || [];

        return (
            <div
                key={column.id}
                className={cx('column')}
                style={{ width: `${column.width || 100}%` }}
                onDragOver={(e) => handleZoneDragOver(e, column.id)}
                onDrop={(e) => handleDrop(e, column.id, getZoneTargetIndex(e))}
            >
                {zoneItems.map((sectionKey, index) =>
                    renderDragItem(sectionKey, column.id, index),
                )}
                {renderDropIndicator(column.id, zoneItems.length)}
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
            const zoneItems = zones?.[mainColumn.id] || [];

            return (
                <div
                    className={cx('column', 'col-full')}
                    onDragOver={(e) => handleZoneDragOver(e, mainColumn.id)}
                    onDrop={(e) =>
                        handleDrop(e, mainColumn.id, getZoneTargetIndex(e))
                    }
                >
                    {zoneItems.map((sectionKey, index) =>
                        renderDragItem(sectionKey, mainColumn.id, index),
                    )}
                    {renderDropIndicator(mainColumn.id, zoneItems.length)}
                    {!zoneItems.length && (
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
            // For BANNER_SPLIT: banner zone is separate from columns
            // Check if zones.banner exists in config
            const hasBannerZone = zones && Array.isArray(zones.banner);
            const bannerZoneId = hasBannerZone ? 'banner' : null;

            const leftCol = columns[0] || { id: 'side_col', width: 30 };
            const rightCol = columns[1] || { id: 'main_col', width: 70 };
            const bannerItems = bannerZoneId ? zones?.[bannerZoneId] || [] : [];

            return (
                <div className={cx('banner-split-container')}>
                    {bannerZoneId && (
                        <>
                            <div className={cx('header-zone')}>
                                <div
                                    className={cx('column', 'col-full')}
                                    style={{
                                        minHeight: structureBannerHeight,
                                    }}
                                    onDragOver={(e) =>
                                        handleZoneDragOver(e, bannerZoneId)
                                    }
                                    onDrop={(e) =>
                                        handleDrop(
                                            e,
                                            bannerZoneId,
                                            getZoneTargetIndex(e),
                                        )
                                    }
                                >
                                    {bannerItems.map((sectionKey, index) =>
                                        renderDragItem(
                                            sectionKey,
                                            bannerZoneId,
                                            index,
                                        ),
                                    )}
                                    {renderDropIndicator(
                                        bannerZoneId,
                                        bannerItems.length,
                                    )}
                                    {bannerItems.length === 0 && (
                                        <div
                                            className={cx('empty-placeholder')}
                                        >
                                            Thả mục vào đây
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div
                                className={cx('banner-resize-handle')}
                                onMouseDown={handleBannerResize}
                            />
                        </>
                    )}

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
                onDrop={(e) => handleDrop(e, 'unused', 0)}
            >
                <h4 className={cx('unused-title')}>MỤC CHƯA SỬ DỤNG</h4>
                <div className={cx('unused-grid')}>
                    {unusedSectionKeys.map((sectionKey, index) =>
                        renderDragItem(sectionKey, 'unused', index),
                    )}
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
