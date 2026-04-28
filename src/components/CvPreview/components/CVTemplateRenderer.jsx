import classNames from 'classnames/bind';
import styles from '../CvPreview.module.scss';
import LayoutRenderer from './LayoutRenderer';

const cx = classNames.bind(styles);

function px(value, fallback) {
    const nextValue = value ?? fallback;
    return typeof nextValue === 'number' ? `${nextValue}px` : nextValue;
}

function mm(value, fallback) {
    const nextValue = value ?? fallback;
    return typeof nextValue === 'number' ? `${nextValue}mm` : nextValue;
}

function CVTemplateRenderer({ previewData, pageRef = null }) {
    const config = previewData?.config || {};
    const content = previewData?.content || {};
    const theme = config?.theme || {};
    const page = config?.layout?.page || {};
    const margin = page?.margin || {};
    const colors = theme?.colors || {};
    const fontSize = theme?.fontSize || {};

    const pageStyle = {
        fontFamily: theme?.fontFamily || 'Arial, sans-serif',
        fontSize: px(fontSize?.body || theme?.fontSize, 14),
        color: colors?.text || '#1f2937',
        background: colors?.background || '#ffffff',
        '--cv-primary': colors?.primary || '#3b6fa3',
        '--cv-accent': colors?.accent || '#eaf2fb',
        '--cv-text': colors?.text || '#374151',
        '--cv-background': colors?.background || '#ffffff',
        '--cv-muted': colors?.muted || '#6b7280',
        '--cv-section-bg': colors?.bg_session || colors?.sectionBackground || '#ffffff',
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

    return (
        <div className={cx('previewShell')} ref={pageRef}>
            <div className={cx('page')} style={pageStyle}>
                <LayoutRenderer config={config} content={content} theme={theme} />
                <div
                    data-cvproai-watermark="footer"
                    className={cx('logo')}
                    data-visible="true"
                >
                    © CvProAI.vn
                </div>
            </div>
        </div>
    );
}

export default CVTemplateRenderer;
