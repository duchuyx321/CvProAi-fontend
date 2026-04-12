import classNames from 'classnames/bind';
import styles from '../CvPreview.module.scss';
import SectionBody from './SectionBody';
import { isEmpty, resolveSectionData } from '../utils/previewHelpers';

const cx = classNames.bind(styles);

function SectionTitle({ title, prefix }) {
    if (!title) return null;

    return (
        <div className={cx('sectionTitle')}>
            <h2 className={cx('sectionTitleText')}>
                {prefix ? `${prefix} ${title}` : title}
            </h2>
        </div>
    );
}

function SectionRenderer({ sectionKey, section, content, theme, layoutType }) {
    const data = resolveSectionData(section?.type, content);
    if (isEmpty(data)) return null;

    const hasTitle = section?.type !== 'profile_header' && !!section?.title;

    return (
        <section className={cx('section')} data-section-key={sectionKey}>
            {hasTitle ? (
                <SectionTitle title={section.title} prefix={theme?.prefix} />
            ) : null}

            <SectionBody
                section={section}
                data={data}
                content={content}
                layoutType={layoutType}
            />
        </section>
    );
}

export default SectionRenderer;
