import React, { useState } from 'react';
import classNames from 'classnames/bind';
import styles from './RightPreview.module.scss';
import CvPreview from '~/components/CvPreview';

const cx = classNames.bind(styles);

function RightPreview({ templateDetail = {} }) {
    const [zoom, setZoom] = useState(80);

    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 130));

    return (
        <div className={cx('wrapper')}>
            {/* Khu vực cuộn chuột (nền xám) */}
            <div className={cx('scroll-area')}>
                {/* Khung tờ giấy A4 được bọc transform: scale */}
                <div
                    className={cx('preview-document')}
                    style={{ transform: `scale(${zoom / 100})` }}
                >
                    <CvPreview
                        cv={templateDetail}
                        template={{
                            id: templateDetail?.template_id,
                            code:
                                templateDetail?.template_code ||
                                templateDetail?.code ||
                                'DEV_01',
                            name: templateDetail?.title,
                            config: templateDetail?.config,
                        }}
                    />
                </div>
            </div>

            {/* Thanh công cụ Zoom nổi ở góc dưới */}
            <div className={cx('zoom-controls')}>
                <button
                    type="button"
                    className={cx('zoomBtn')}
                    onClick={handleZoomOut}
                >
                    -
                </button>
                <span className={cx('zoomText')}>{zoom}%</span>
                <button
                    type="button"
                    className={cx('zoomBtn')}
                    onClick={handleZoomIn}
                >
                    +
                </button>
            </div>
        </div>
    );
}

export default RightPreview;
