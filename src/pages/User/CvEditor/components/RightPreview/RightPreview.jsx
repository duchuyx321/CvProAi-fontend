import React, { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { Minus, Plus } from 'lucide-react';
import styles from './RightPreview.module.scss';
import CvPreview from '~/components/CvPreview';

const cx = classNames.bind(styles);

const BASE_PAGE_WIDTH = 794;
const BASE_PAGE_HEIGHT = 1123;
const PAGE_GAP = 32;
const ZOOM_PRESETS = [50, 80, 100, 125, 150];
const DEFAULT_ZOOM = 80;

function getPreviousZoom(currentZoom) {
    const previousZoom = [...ZOOM_PRESETS]
        .reverse()
        .find((preset) => preset < currentZoom);

    return previousZoom || ZOOM_PRESETS[0];
}

function getNextZoom(currentZoom) {
    const nextZoom = ZOOM_PRESETS.find((preset) => preset > currentZoom);

    return nextZoom || ZOOM_PRESETS[ZOOM_PRESETS.length - 1];
}

function readPageMetrics(previewElement) {
    const pages = Array.from(
        previewElement.querySelectorAll('[data-cv-page-index]'),
    );
    const firstPage = pages[0];

    return {
        pageCount: Math.max(1, pages.length),
        pageWidth: firstPage?.offsetWidth || BASE_PAGE_WIDTH,
        pageHeight: firstPage?.offsetHeight || BASE_PAGE_HEIGHT,
    };
}

function isSamePageMetrics(currentMetrics, nextMetrics) {
    return (
        currentMetrics.pageCount === nextMetrics.pageCount &&
        currentMetrics.pageWidth === nextMetrics.pageWidth &&
        currentMetrics.pageHeight === nextMetrics.pageHeight
    );
}

function RightPreview({ templateDetail = {}, pageRef = null }) {
    const [zoom, setZoom] = useState(DEFAULT_ZOOM);
    const [pageMetrics, setPageMetrics] = useState({
        pageCount: 1,
        pageWidth: BASE_PAGE_WIDTH,
        pageHeight: BASE_PAGE_HEIGHT,
    });
    const previewScale = zoom / 100;

    const documentHeight = useMemo(() => {
        const gapTotal = Math.max(0, pageMetrics.pageCount - 1) * PAGE_GAP;

        return pageMetrics.pageCount * pageMetrics.pageHeight + gapTotal;
    }, [pageMetrics.pageCount, pageMetrics.pageHeight]);

    const previewStyle = useMemo(
        () => ({
            '--preview-scale': previewScale,
            '--preview-a4-width': `${BASE_PAGE_WIDTH}px`,
            '--preview-a4-height': `${BASE_PAGE_HEIGHT}px`,
            '--preview-page-gap': `${PAGE_GAP}px`,
            '--preview-scaled-width': `${pageMetrics.pageWidth * previewScale}px`,
            '--preview-scaled-height': `${documentHeight * previewScale}px`,
        }),
        [documentHeight, pageMetrics.pageWidth, previewScale],
    );

    const handleZoomOut = () => setZoom((prev) => getPreviousZoom(prev));
    const handleZoomIn = () => setZoom((prev) => getNextZoom(prev));

    useEffect(() => {
        const previewElement = pageRef?.current;
        if (!previewElement) return undefined;

        let frameId = 0;
        const updatePageMetrics = () => {
            window.cancelAnimationFrame(frameId);
            frameId = window.requestAnimationFrame(() => {
                const nextMetrics = readPageMetrics(previewElement);

                setPageMetrics((prev) =>
                    isSamePageMetrics(prev, nextMetrics) ? prev : nextMetrics,
                );
            });
        };

        updatePageMetrics();

        if (typeof ResizeObserver === 'undefined') {
            window.addEventListener('resize', updatePageMetrics);

            return () => {
                window.cancelAnimationFrame(frameId);
                window.removeEventListener('resize', updatePageMetrics);
            };
        }

        const resizeObserver = new ResizeObserver(updatePageMetrics);
        resizeObserver.observe(previewElement);
        window.addEventListener('resize', updatePageMetrics);

        const mutationObserver =
            typeof MutationObserver !== 'undefined'
                ? new MutationObserver(updatePageMetrics)
                : null;

        mutationObserver?.observe(previewElement, {
            childList: true,
            subtree: false,
        });

        return () => {
            window.cancelAnimationFrame(frameId);
            resizeObserver.disconnect();
            mutationObserver?.disconnect();
            window.removeEventListener('resize', updatePageMetrics);
        };
    }, [pageRef]);

    return (
        <div className={cx('wrapper')} style={previewStyle}>
            <div className={cx('previewViewport')}>
                <div className={cx('previewCanvas')}>
                    <div className={cx('scaledSpace')}>
                        <div className={cx('zoomWrapper')}>
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
                    <Minus size={18} strokeWidth={2.2} />
                </button>
                <span className={cx('zoomText')}>{zoom}%</span>
                <button
                    type="button"
                    className={cx('zoomBtn')}
                    onClick={handleZoomIn}
                    aria-label="Phóng to preview"
                >
                    <Plus size={18} strokeWidth={2.2} />
                </button>
            </div>
        </div>
    );
}

export default RightPreview;
