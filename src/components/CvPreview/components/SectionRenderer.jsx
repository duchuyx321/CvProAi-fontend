import classNames from 'classnames/bind';
import styles from '../CvPreview.module.scss';
import { getSectionData, isEmpty } from '../utils/previewHelpers';
import { getTitleBarStyle, normalizeBoxStyle } from '../utils/styleUtils';
import {
    DefaultSectionRenderer,
    sectionRendererMap,
} from './SectionRenderers';

const cx = classNames.bind(styles);

function SectionTitle({ section, theme }) {
    const title = section?.title;
    if (!title) return null;

    const titleBar = section?.options?.titleBar;
    const prefix = theme?.prefix || '';
    const titleText = titleBar?.uppercase ? String(title).toUpperCase() : title;

    return (
        <div
            className={cx('sectionTitle', {
                sectionTitleBar: titleBar?.visible,
            })}
            style={
                titleBar?.visible
                    ? getTitleBarStyle(titleBar)
                    : undefined
            }
        >
            <h2
                className={cx('sectionTitleText')}
                style={normalizeBoxStyle(section?.style?.title)}
            >
                {prefix ? `${prefix} ${titleText}` : titleText}
            </h2>
        </div>
    );
}

function SectionDivider({ section }) {
    const divider = section?.options?.divider;
    if (!divider?.visible) return null;

    return (
        <div
            className={cx('sectionDivider')}
            style={{
                borderTopColor: divider?.color,
                borderTopWidth: divider?.thickness,
                margin: divider?.margin,
            }}
        />
    );
}

function resolveRenderer(section = {}) {
    const variant = section?.variant;
    if (variant && sectionRendererMap[variant]) {
        return sectionRendererMap[variant];
    }

    const type = String(section?.type || '').toUpperCase();
    if (type === 'SKILLS') return sectionRendererMap.skills_bullet;
    if (type === 'CONTACT') return sectionRendererMap.contact_icon_list;
    if (type === 'PROFILE' || type === 'PERSONAL_INFO' || type === 'PROFILE_HEADER') {
        return sectionRendererMap.profile_top_avatar_left_contact_inline;
    }

    return DefaultSectionRenderer;
}

function SectionRenderer({ sectionKey, section, content, theme, layoutType }) {
    if (section?.visible === false) return null;

    const data = getSectionData(sectionKey, section, content);
    if (isEmpty(data)) return null;

    const renderSection = resolveRenderer(section);
    const type = String(section?.type || sectionKey).toUpperCase();
    const hasTitle =
        !!section?.title &&
        !['PROFILE', 'PROFILE_HEADER', 'PERSONAL_INFO'].includes(type);
    const canKeepWholeSection = !Array.isArray(data) || data.length <= 1;

    return (
        <section
            className={cx('section')}
            data-section-key={sectionKey}
            data-section-variant={section?.variant || ''}
            data-cv-page-break-avoid={
                canKeepWholeSection ? 'true' : undefined
            }
            style={normalizeBoxStyle(section?.style?.container || section?.style)}
        >
            {hasTitle ? <SectionTitle section={section} theme={theme} /> : null}
            <SectionDivider section={section} />
            <div
                className={cx('sectionContent')}
                style={normalizeBoxStyle(section?.style?.content)}
            >
                {renderSection({
                    section,
                    data,
                    content,
                    theme,
                    layoutType,
                    sectionKey,
                })}
            </div>
        </section>
    );
}

export default SectionRenderer;
