import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './RightPreview.module.scss';
import CvPreview from '~/components/CvPreview';

const cx = classNames.bind(styles);

function RightPreview({ templateDetail = {}, pageRef = null }) {
    const [zoom, setZoom] = useState(80);
    const [documentHeight, setDocumentHeight] = useState(1123);
    const previewScale = zoom / 100;
    const previewStyle = {
        '--preview-scale': previewScale,
        '--preview-frame-width': `${794 * previewScale}px`,
        '--preview-frame-height': `${Math.max(1123, documentHeight) * previewScale}px`,
    };

    const handleZoomOut = () => setZoom((prev) => Math.max(prev - 10, 50));
    const handleZoomIn = () => setZoom((prev) => Math.min(prev + 10, 130));

    useEffect(() => {
        const previewElement = pageRef?.current;
        if (!previewElement) return undefined;

        const updateDocumentHeight = () => {
            const nextHeight =
                previewElement.scrollHeight ||
                previewElement.offsetHeight ||
                1123;

            setDocumentHeight(nextHeight);
        };

        updateDocumentHeight();

        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', updateDocumentHeight);

            return () =>
                window.removeEventListener('resize', updateDocumentHeight);
        }

        const observer = new ResizeObserver(updateDocumentHeight);
        observer.observe(previewElement);
        window.addEventListener('resize', updateDocumentHeight);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', updateDocumentHeight);
        };
    }, [pageRef]);

    return (
        <div className={cx('wrapper')} style={previewStyle}>
            <div className={cx('scroll-area')}>
                <div className={cx('preview-canvas')}>
                    <div className={cx('preview-frame')}>
                        <div className={cx('preview-document')}>
                            <CvPreview
                                cv={templateDetail}
                                template={{
                                    id: templateDetail?.template_id,
                                    code:
                                        templateDetail?.template_code ||
                                        templateDetail?.code ||
                                        'DEV_01',
                                    name: templateDetail?.title,
                                    content: templateDetail?.template_content,
                                    config: templateDetail?.config,
                                }}
                                pageRef={pageRef}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx('zoom-controls')}>
                <button
                    type="button"
                    className={cx('zoomBtn')}
                    onClick={handleZoomOut}
                    aria-label="Thu nhỏ preview"
                >
                    -
                </button>
                <span className={cx('zoomText')}>{zoom}%</span>
                <button
                    type="button"
                    className={cx('zoomBtn')}
                    onClick={handleZoomIn}
                    aria-label="Phóng to preview"
                >
                    +
                </button>
            </div>
        </div>
    );
}

export default RightPreview;
