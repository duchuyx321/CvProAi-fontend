import classNames from 'classnames/bind';

import SectionTitle from '../../SectionTitle';
import styles from './Skills.module.scss';

const cx = classNames.bind(styles);

function Skills({ resumeData = {}, sectionConfig = {}, theme = {} }) {
    const title = sectionConfig?.title || 'Kỹ Năng';
    const variant = sectionConfig?.variant || 'bullet_list';
    const skills = Array.isArray(resumeData?.skills) ? resumeData.skills : [];

    if (!skills.length) return null;

    const textMain = theme?.colors?.text_main || '#1f2937';
    const accent = theme?.colors?.accent || '#3b82f6';
    const bgSoft = theme?.colors?.bg_soft || '#eff6ff';
    const itemGap = theme?.spacing?.item_gap ?? 12;

    if (variant === 'tag_list') {
        return (
            <section className={cx('wrapper')}>
                <SectionTitle title={title} theme={theme} />

                <div className={cx('tagList')} style={{ gap: `${itemGap}px` }}>
                    {skills.map((item, index) => (
                        <span
                            key={`${item}-${index}`}
                            className={cx('tag')}
                            style={{
                                color: textMain,
                                backgroundColor: bgSoft,
                            }}
                        >
                            {item}
                        </span>
                    ))}
                </div>
            </section>
        );
    }

    if (variant === 'progress_list') {
        return (
            <section className={cx('wrapper')}>
                <SectionTitle title={title} theme={theme} />

                <div className={cx('progressList')} style={{ gap: `${itemGap}px` }}>
                    {skills.map((item, index) => (
                        <div key={`${item}-${index}`} className={cx('progressItem')}>
                            <div className={cx('progressHead')}>
                                <span className={cx('progressName')} style={{ color: textMain }}>
                                    {item}
                                </span>
                            </div>

                            <div className={cx('bar')}>
                                <span
                                    className={cx('fill')}
                                    style={{
                                        width: `${70 + (index % 3) * 10}%`,
                                        backgroundColor: accent,
                                    }}
                                ></span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className={cx('wrapper')}>
            <SectionTitle title={title} theme={theme} />

            <ul className={cx('list')} style={{ gap: `${itemGap}px` }}>
                {skills.map((item, index) => (
                    <li key={`${item}-${index}`}
                        className={cx('item')}
                        style={{ color: textMain }}
                    >
                        {item}
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default Skills;