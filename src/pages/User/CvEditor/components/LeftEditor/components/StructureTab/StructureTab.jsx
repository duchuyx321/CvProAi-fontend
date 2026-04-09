import React, { useRef } from 'react';
import classNames from 'classnames/bind';
import styles from './StructureTab.module.scss';

const cx = classNames.bind(styles);

// Từ điển chuyển đổi ID thành Tên tiếng Việt đẹp
const ZONE_NAMES = {
    avatar: 'Ảnh đại diện', profile_header: 'Danh thiếp', contact: 'Thông tin cá nhân',
    summary: 'Mục tiêu nghề nghiệp', skills: 'Kỹ năng', experience: 'Kinh nghiệm làm việc',
    education: 'Học vấn', projects: 'Dự án', certificates: 'Chứng chỉ',
    activities: 'Hoạt động', hobbies: 'Sở thích', awards: 'Giải thưởng',
    references: 'Người tham chiếu', custom: 'Thông tin thêm'
};

function StructureTab({ templateConfig = {}, onChangeConfig }) {
    // 1. Đọc dữ liệu bố cục hiện tại từ Config
    const layout = templateConfig?.layout?.body || { type: 'stack', columns: [] };
    const layoutType = layout.type || 'stack';
    const columns = layout.columns || [];

    // Tìm ra các mục đã dùng và chưa dùng
    const usedZones = columns.reduce((acc, col) => [...acc, ...(col.zones || [])], []);
    const ALL_ZONES = Object.keys(ZONE_NAMES);
    const unusedZones = ALL_ZONES.filter(z => !usedZones.includes(z));

    // ==========================================
    // LOGIC 1: KÉO THẢ MỤC (DRAG & DROP)
    // ==========================================
    const handleDragStart = (e, zoneId, sourceColId) => {
        e.dataTransfer.setData('zoneId', zoneId);
        e.dataTransfer.setData('sourceColId', sourceColId);
        setTimeout(() => e.target.classList.add(cx('dragging')), 0);
    };

    const handleDragEnd = (e) => e.target.classList.remove(cx('dragging'));
    const handleDragOver = (e) => e.preventDefault(); // Cho phép thả

    const handleDrop = (e, targetColId) => {
        e.preventDefault();
        const zoneId = e.dataTransfer.getData('zoneId');
        const sourceColId = e.dataTransfer.getData('sourceColId');

        if (!zoneId || sourceColId === targetColId) return;

        // Clone dữ liệu để không làm hỏng state gốc
        const newColumns = JSON.parse(JSON.stringify(columns));

        // Xóa ở cột cũ
        if (sourceColId !== 'unused') {
            const srcCol = newColumns.find(c => c.id === sourceColId);
            if (srcCol) srcCol.zones = srcCol.zones.filter(z => z !== zoneId);
        }

        // Thêm vào cột mới (Thêm vào dưới cùng)
        if (targetColId !== 'unused') {
            const targetCol = newColumns.find(c => c.id === targetColId);
            if (targetCol) {
                targetCol.zones = targetCol.zones || [];
                targetCol.zones.push(zoneId); 
            }
        }

        // Báo lên CvEditor để render lại tờ A4
        onChangeConfig({ ...templateConfig, layout: { ...templateConfig.layout, body: { ...layout, columns: newColumns } }});
    };

    // ==========================================
    // LOGIC 2: KÉO ĐỔI KÍCH THƯỚC CỘT (RESIZER)
    // ==========================================
    const containerRef = useRef(null);

    const handleMouseDown = (e, leftIdx, rightIdx) => {
        e.preventDefault();
        const startX = e.clientX;
        const containerWidth = containerRef.current.offsetWidth;
        const startLeftWidth = columns[leftIdx].width_percent;

        const onMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaPercent = (deltaX / containerWidth) * 100;
            let newLeftWidth = startLeftWidth + deltaPercent;

            // Giới hạn không cho cột bị kéo quá nhỏ (min 25%, max 75%)
            if (newLeftWidth < 25) newLeftWidth = 25;
            if (newLeftWidth > 75) newLeftWidth = 75;

            const newColumns = JSON.parse(JSON.stringify(columns));
            newColumns[leftIdx].width_percent = newLeftWidth;
            newColumns[rightIdx].width_percent = 100 - newLeftWidth;

            // Báo lên CvEditor
            onChangeConfig({ ...templateConfig, layout: { ...templateConfig.layout, body: { ...layout, columns: newColumns } }});
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    // ==========================================
    // RENDER: CÁC KHỐI KÉO THẢ
    // ==========================================
    const renderDragItem = (zoneId, sourceColId) => (
        <div key={zoneId} draggable onDragStart={(e) => handleDragStart(e, zoneId, sourceColId)} onDragEnd={handleDragEnd} className={cx('drag-item')}>
            {ZONE_NAMES[zoneId] || zoneId}
        </div>
    );

    // ==========================================
    // RENDER: BỐ CỤC ĐỘNG TỪNG LOẠI LAYOUT
    // ==========================================
    const renderLayoutArea = () => {
        if (layoutType === 'stack') {
            const mainCol = columns[0] || { id: 'main', zones: [] };
            return (
                <div className={cx('column', 'col-full')} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, mainCol.id)}>
                    {mainCol.zones?.map(z => renderDragItem(z, mainCol.id))}
                    {(!mainCol.zones || mainCol.zones.length === 0) && <div className={cx('empty-placeholder')}>Thả mục vào đây</div>}
                </div>
            );
        }

        if (layoutType === 'split') {
            const leftCol = columns[0] || { id: 'left', width_percent: 30, zones: [] };
            const rightCol = columns[1] || { id: 'right', width_percent: 70, zones: [] };

            return (
                <div className={cx('split-container')} ref={containerRef}>
                    {/* Cột trái */}
                    <div className={cx('column')} style={{ width: `${leftCol.width_percent}%` }} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, leftCol.id)}>
                        {leftCol.zones?.map(z => renderDragItem(z, leftCol.id))}
                        {(!leftCol.zones || leftCol.zones.length === 0) && <div className={cx('empty-placeholder')}>Thả mục vào đây</div>}
                    </div>

                    {/* Thanh kéo đổi kích thước */}
                    <div className={cx('divider')} onMouseDown={(e) => handleMouseDown(e, 0, 1)}>
                        <div className={cx('handle')}></div>
                    </div>

                    {/* Cột phải */}
                    <div className={cx('column')} style={{ width: `${rightCol.width_percent}%` }} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, rightCol.id)}>
                        {rightCol.zones?.map(z => renderDragItem(z, rightCol.id))}
                        {(!rightCol.zones || rightCol.zones.length === 0) && <div className={cx('empty-placeholder')}>Thả mục vào đây</div>}
                    </div>
                </div>
            );
        }

        if (layoutType === 'banner_split') {
            const headerCol = columns.find(c => c.id === 'header') || { id: 'header', zones: [] };
            const leftCol = columns.find(c => c.id === 'left') || { id: 'left', width_percent: 30, zones: [] };
            const rightCol = columns.find(c => c.id === 'right') || { id: 'right', width_percent: 70, zones: [] };
            const leftIdx = columns.findIndex(c => c.id === 'left');
            const rightIdx = columns.findIndex(c => c.id === 'right');

            return (
                <div className={cx('banner-split-container')} ref={containerRef}>
                    <div className={cx('header-zone')}>
                       <div className={cx('column', 'col-full')} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, headerCol.id)}>
                            {headerCol.zones?.map(z => renderDragItem(z, headerCol.id))}
                        </div>
                    </div>

                    <div className={cx('split-container')}>
                         <div className={cx('column')} style={{ width: `${leftCol.width_percent}%` }} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, leftCol.id)}>
                            {leftCol.zones?.map(z => renderDragItem(z, leftCol.id))}
                        </div>
                        <div className={cx('divider')} onMouseDown={(e) => handleMouseDown(e, leftIdx, rightIdx)}>
                            <div className={cx('handle')}></div>
                        </div>
                        <div className={cx('column')} style={{ width: `${rightCol.width_percent}%` }} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, rightCol.id)}>
                            {rightCol.zones?.map(z => renderDragItem(z, rightCol.id))}
                        </div>
                    </div>
                </div>
            );
        }
        return <div>Chưa hỗ trợ layout này</div>;
    };

    return (
        <div className={cx('wrapper')}>
            <p className={cx('description')}>
                Kéo thả để đưa mục vào cột. Kéo đường phân cách ở giữa để thay đổi diện tích cột.
            </p>

            {/* VÙNG ĐANG SỬ DỤNG */}
            <div className={cx('active-area')}>
                {renderLayoutArea()}
            </div>

            {/* VÙNG CHƯA SỬ DỤNG */}
            <div className={cx('unused-area')} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, 'unused')}>
                <h4 className={cx('unused-title')}>MỤC CHƯA SỬ DỤNG</h4>
                <div className={cx('unused-grid')}>
                    {unusedZones.map(z => renderDragItem(z, 'unused'))}
                    {unusedZones.length === 0 && <span style={{color: '#94a3b8', fontSize: 13}}>Đã sử dụng hết các mục</span>}
                </div>
            </div>
        </div>
    );
}
export default StructureTab;