import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import classNames from 'classnames/bind';
import styles from '../CvPreview.module.scss';
import LayoutRenderer from './LayoutRenderer';

const cx = classNames.bind(styles);

const DEFAULT_PAGE_HEIGHT = 1122.52;
const DEFAULT_FOOTER_RESERVE = 34;
const SAFE_BOTTOM_GAP = 16;
const MIN_PAGE_SLICE_HEIGHT = 120;
const MEASURE_ROUNDING = 0.5;

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

function px(value, fallback) {
    const nextValue = value ?? fallback;
    return typeof nextValue === 'number' ? `${nextValue}px` : nextValue;
}

function mm(value, fallback) {
    const nextValue = value ?? fallback;
    return typeof nextValue === 'number' ? `${nextValue}mm` : nextValue;
}

function normalizeHexColor(value, fallback) {
    const rawValue = String(value || '').trim();
    const withHash = rawValue.startsWith('#') ? rawValue : `#${rawValue}`;

    if (HEX_COLOR_PATTERN.test(withHash)) {
        return withHash;
    }

    return fallback;
}

function hexToRgb(hexColor) {
    const safeHex = normalizeHexColor(hexColor, '#000000').replace('#', '');
    const value = Number.parseInt(safeHex, 16);

    return {
        r: (value >> 16) & 255,
        g: (value >> 8) & 255,
        b: value & 255,
    };
}

function toLinearColor(value) {
    const channel = value / 255;
    return channel <= 0.03928
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4;
}

function getLuminance(hexColor) {
    const { r, g, b } = hexToRgb(hexColor);

    return (
        0.2126 * toLinearColor(r) +
        0.7152 * toLinearColor(g) +
        0.0722 * toLinearColor(b)
    );
}

function getContrastRatio(background, foreground) {
    const bgLuminance = getLuminance(background);
    const fgLuminance = getLuminance(foreground);
    const lighter = Math.max(bgLuminance, fgLuminance);
    const darker = Math.min(bgLuminance, fgLuminance);

    return (lighter + 0.05) / (darker + 0.05);
}

function getReadableColor(background, preferred = '#111827') {
    const safeBackground = normalizeHexColor(background, '#ffffff');
    const safePreferred = normalizeHexColor(preferred, '#111827');

    if (getContrastRatio(safeBackground, safePreferred) >= 4.5) {
        return safePreferred;
    }

    const dark = '#111827';
    const light = '#ffffff';

    return getContrastRatio(safeBackground, dark) >=
        getContrastRatio(safeBackground, light)
        ? dark
        : light;
}

function toNumber(value, fallback = 0) {
    const number = Number.parseFloat(value);
    return Number.isFinite(number) ? number : fallback;
}

function roundMeasure(value) {
    return Math.round(value / MEASURE_ROUNDING) * MEASURE_ROUNDING;
}

function getElementRect(element, rootRect) {
    const rect = element.getBoundingClientRect();

    return {
        top: rect.top - rootRect.top,
        bottom: rect.bottom - rootRect.top,
    };
}

function getAvoidRanges(contentElement) {
    const rootRect = contentElement.getBoundingClientRect();
    const nodes = Array.from(
        contentElement.querySelectorAll('[data-cv-page-break-avoid="true"]'),
    );

    return nodes
        .map((node) => getElementRect(node, rootRect))
        .filter((range) => range.bottom > range.top)
        .sort((a, b) => a.top - b.top);
}

function findBetterPageEnd({ start, nominalEnd, contentHeight, avoidRanges }) {
    if (nominalEnd >= contentHeight) return contentHeight;

    const crossingRanges = avoidRanges.filter(
        (range) =>
            range.top < nominalEnd &&
            range.bottom > nominalEnd &&
            range.top > start + MIN_PAGE_SLICE_HEIGHT,
    );

    if (!crossingRanges.length) return nominalEnd;

    const nearestRange = crossingRanges.reduce((current, range) => {
        if (!current) return range;
        return range.top > current.top ? range : current;
    }, null);

    return nearestRange?.top || nominalEnd;
}

function buildPaginationPlan(measurePage, measureContent) {
    if (!measurePage || !measureContent) {
        return {
            pages: [{ start: 0, end: DEFAULT_PAGE_HEIGHT, blankTop: null }],
        };
    }

    const computedStyle = window.getComputedStyle(measurePage);
    const paddingTop = toNumber(computedStyle.paddingTop);
    const paddingBottom = toNumber(computedStyle.paddingBottom);
    const pageHeight =
        measurePage.clientHeight ||
        measurePage.getBoundingClientRect().height ||
        DEFAULT_PAGE_HEIGHT;

    const availableHeight = Math.max(
        MIN_PAGE_SLICE_HEIGHT,
        pageHeight -
            paddingTop -
            paddingBottom -
            DEFAULT_FOOTER_RESERVE -
            SAFE_BOTTOM_GAP,
    );

    const contentHeight = Math.max(
        measureContent.scrollHeight,
        measureContent.getBoundingClientRect().height,
    );

    const avoidRanges = getAvoidRanges(measureContent);
    const pages = [];

    let start = 0;
    let guard = 0;

    while (start < contentHeight - 1 && guard < 100) {
        const nominalEnd = Math.min(start + availableHeight, contentHeight);
        let end = findBetterPageEnd({
            start,
            nominalEnd,
            contentHeight,
            avoidRanges,
        });

        if (end <= start + 1) {
            end = nominalEnd;
        }

        const sliceHeight = end - start;

        if (sliceHeight > 1) {
            pages.push({
                start: roundMeasure(start),
                end: roundMeasure(end),
                blankTop: roundMeasure(paddingTop + Math.max(0, sliceHeight)),
            });
        }

        start = end;
        guard += 1;
    }

    if (!pages.length) {
        pages.push({
            start: 0,
            end: roundMeasure(contentHeight || availableHeight),
            blankTop: null,
        });
    }

    return { pages };
}

function getPaginationKey(pages = []) {
    return pages
        .map(
            (page) =>
                `${roundMeasure(page.start)}:${roundMeasure(page.end)}:${roundMeasure(
                    page.blankTop || 0,
                )}`,
        )
        .join('|');
}

function getBrandLogoUrl(config) {
    return (
        config?.branding?.logoUrl ||
        config?.branding?.logo_url ||
        config?.brand?.logoUrl ||
        config?.brand?.logo_url ||
        config?.logoUrl ||
        ''
    );
}

function FooterBrand({ config }) {
    const logoUrl = getBrandLogoUrl(config);

    return (
        <div
            data-cvproai-watermark="footer"
            className={cx('logo')}
            data-visible="true"
        >
            {logoUrl ? (
                <img
                    src={logoUrl}
                    alt="CvProAI"
                    crossOrigin="anonymous"
                    className={cx('footerLogoImage')}
                />
            ) : (
                '© CvProAI.vn'
            )}
        </div>
    );
}

function CVTemplateRenderer({ previewData, pageRef = null }) {
    const measurePageRef = useRef(null);
    const measureContentRef = useRef(null);
    const paginationKeyRef = useRef('');
    const [pagination, setPagination] = useState({
        pages: [{ start: 0, end: DEFAULT_PAGE_HEIGHT, blankTop: null }],
    });

    const config = useMemo(
        () => previewData?.config || {},
        [previewData?.config],
    );

    const content = useMemo(
        () => previewData?.content || {},
        [previewData?.content],
    );

    const theme = config?.theme || {};
    const page = config?.layout?.page || {};
    const margin = page?.margin || {};
    const colors = theme?.colors || {};
    const fontSize = theme?.fontSize || {};

    const primaryColor = colors?.primary || '#3b6fa3';
    const accentColor = colors?.accent || '#eaf2fb';
    const backgroundColor = colors?.background || '#ffffff';
    const textColor = colors?.text || '#374151';
    const mutedColor = colors?.muted || '#6b7280';
    const sectionBgColor =
        colors?.bg_session ||
        colors?.sectionBackground ||
        colors?.surface ||
        '#ffffff';

    const onPrimaryColor = getReadableColor(primaryColor, '#ffffff');
    const onAccentColor = getReadableColor(accentColor, primaryColor);

    const pageStyle = {
        fontFamily: theme?.fontFamily || 'Arial, sans-serif',
        fontSize: px(fontSize?.body || theme?.fontSize, 14),
        color: textColor,
        background: backgroundColor,
        '--cv-primary': primaryColor,
        '--cv-accent': accentColor,
        '--cv-text': textColor,
        '--cv-background': backgroundColor,
        '--cv-muted': mutedColor,
        '--cv-section-bg': sectionBgColor,
        '--cv-on-primary': onPrimaryColor,
        '--cv-on-accent': onAccentColor,
        '--cv-chip-bg': accentColor,
        '--cv-chip-text': onAccentColor,
        '--cv-date-bg': accentColor,
        '--cv-date-text': onAccentColor,
        '--cv-item-gap': px(theme?.spacing?.itemGap, 12),
        '--cv-section-gap': px(theme?.spacing?.sectionGap, 24),
        '--cv-font-name': px(fontSize?.name, 38),
        '--cv-font-headline': px(fontSize?.headline, 18),
        '--cv-font-section-title': px(fontSize?.sectionTitle, 20),
        '--cv-font-body': px(fontSize?.body, 14),
        '--cv-font-small': px(fontSize?.small, 13),
        paddingTop: mm(margin?.top, 12),
        paddingRight: mm(margin?.right, 12),
        paddingBottom: mm(margin?.bottom, 12),
        paddingLeft: mm(margin?.left, 12),
    };

    const updatePagination = useCallback(() => {
        const nextPagination = buildPaginationPlan(
            measurePageRef.current,
            measureContentRef.current,
        );
        const nextKey = getPaginationKey(nextPagination.pages);

        if (nextKey === paginationKeyRef.current) return;

        paginationKeyRef.current = nextKey;
        setPagination(nextPagination);
    }, []);

    useLayoutEffect(() => {
        updatePagination();
    }, [config, content, updatePagination]);

    useEffect(() => {
        const target = measureContentRef.current;
        if (!target || typeof ResizeObserver === 'undefined') return undefined;

        let frameId = 0;
        const observer = new ResizeObserver(() => {
            window.cancelAnimationFrame(frameId);
            frameId = window.requestAnimationFrame(updatePagination);
        });

        observer.observe(target);

        return () => {
            window.cancelAnimationFrame(frameId);
            observer.disconnect();
        };
    }, [updatePagination]);

    useEffect(() => {
        let isCancelled = false;

        const updateAfterFontsReady = async () => {
            try {
                await document.fonts?.ready;
            } finally {
                if (!isCancelled) {
                    updatePagination();
                }
            }
        };

        updateAfterFontsReady();

        return () => {
            isCancelled = true;
        };
    }, [updatePagination]);

    useEffect(() => {
        const target = measureContentRef.current;
        if (!target) return undefined;

        const images = Array.from(target.querySelectorAll('img'));
        if (!images.length) return undefined;

        let frameId = 0;

        const handleImageReady = () => {
            window.cancelAnimationFrame(frameId);
            frameId = window.requestAnimationFrame(updatePagination);
        };

        images.forEach((image) => {
            if (image.complete && image.naturalWidth > 0) return;

            image.addEventListener('load', handleImageReady);
            image.addEventListener('error', handleImageReady);
        });

        return () => {
            window.cancelAnimationFrame(frameId);
            images.forEach((image) => {
                image.removeEventListener('load', handleImageReady);
                image.removeEventListener('error', handleImageReady);
            });
        };
    }, [config, content, updatePagination]);

    const pages = pagination?.pages?.length
        ? pagination.pages
        : [{ start: 0, end: DEFAULT_PAGE_HEIGHT, blankTop: null }];

    return (
        <div className={cx('previewRoot')}>
            <div className={cx('measureShell')} aria-hidden="true">
                <div
                    ref={measurePageRef}
                    className={cx('page', 'pageMeasure')}
                    style={pageStyle}
                >
                    <div ref={measureContentRef} className={cx('pageContent')}>
                        <LayoutRenderer
                            config={config}
                            content={content}
                            theme={theme}
                        />
                    </div>
                </div>
            </div>

            <div className={cx('previewShell')} ref={pageRef}>
                {pages.map((pageSlice, index) => (
                    <div
                        key={`${pageSlice.start}-${pageSlice.end}-${index}`}
                        className={cx('page')}
                        data-cv-page-index={index}
                        style={pageStyle}
                    >
                        <div
                            className={cx('pageContent', 'pageContentSlice')}
                            style={{
                                transform: `translateY(-${pageSlice.start}px)`,
                            }}
                        >
                            <LayoutRenderer
                                config={config}
                                content={content}
                                theme={theme}
                            />
                        </div>

                        {pageSlice.blankTop ? (
                            <div
                                className={cx('pageSliceBlank')}
                                style={{ top: `${pageSlice.blankTop}px` }}
                            />
                        ) : null}

                        <FooterBrand config={config} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CVTemplateRenderer;
