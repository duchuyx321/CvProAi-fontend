import React, { useState } from 'react';
import classNames from 'classnames/bind';
import Preview from '~/components/CvTemplate/Preview';
import styles from './RightPreview.module.scss';

const cx = classNames.bind(styles);

function RightPreview({ resumeData = {}, templateConfig = {} }) {
  
    const [zoom, setZoom] = useState(80);


    const handleZoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
    const handleZoomIn = () => setZoom(prev => Math.min(prev + 10, 130));

    return (
        <div className={cx('wrapper')}>
            
            {/* Khu vực cuộn chuột (nền xám) */}
            <div className={cx('scroll-area')}>
                
                {/* Khung tờ giấy A4 được bọc transform: scale */}
                <div 
                    className={cx('preview-document')}
                    style={{ transform: `scale(${zoom / 100})` }}
                >
                    <Preview
                        resumeData={resumeData}
                        templateConfig={templateConfig}
                    />
                </div>

            </div>

            {/* Thanh công cụ Zoom nổi ở góc dưới */}
            <div className={cx('zoom-controls')}>
                <button type="button" className={cx('zoomBtn')} onClick={handleZoomOut}>
                    -
                </button>
                <span className={cx('zoomText')}>{zoom}%</span>
                <button type="button" className={cx('zoomBtn')} onClick={handleZoomIn}>
                    +
                </button>
            </div>

        </div>
    );
}

export default RightPreview;