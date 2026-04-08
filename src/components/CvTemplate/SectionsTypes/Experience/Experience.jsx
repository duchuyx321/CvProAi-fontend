import classNames from 'classnames/bind';

import SectionTitle from '../../SectionTitle';
import styles from './Experience.module.scss';

const cx = classNames.bind(styles);

function Experience({ resumeData = {}, sectionConfig = {}, theme = {} }) {
    const title = sectionConfig?.title || 'Kinh Nghiệm Làm Việc';
    const list = Array.isArray(resumeData?.experience)
        ? resumeData.experience
        : [];

    if (!list.length) return null;

    const primary = theme?.colors?.primary || '#1e3a8a';
    const textMain = theme?.colors?.text_main || '#1f2937';
    const bgCard = theme?.colors?.bg_card || '#f8fafc';
    const itemGap = theme?.spacing?.item_gap ?? 12;

    return (
        <section className={cx('wrapper')}>
            <SectionTitle title={title} theme={theme} />

            <div className={cx('list')} style={{ gap: `${itemGap}px` }}>
                {list.map((item, index) => (
                    <div
                        key={`${item.company}-${index}`}
                        className={cx('item')}
                        style={{ backgroundColor: bgCard }}
                    >
                        <div className={cx('head')}>
                            <div className={cx('main')}>
                                <h4 className={cx('company')} style={{ color: textMain }}>
                                    {item.company}
                                </h4>

                                <p className={cx('position')} style={{ color: primary }}>
                                    {item.position}
                                </p>
                            </div>

                            {item.time ? (
                                <span
                                    className={cx('time')}
                                    style={{
                                        color: primary,
                                        borderColor: primary,
                                    }}
                                >
                                    {item.time}
                                </span>
                            ) : null}
                        </div>

                        {Array.isArray(item.description) &&
                            item.description.length ? (
                            <ul className={cx('desc')} style={{ color: textMain }}>
                                {item.description.map((text, idx) => (
                                    <li key={`${text}-${idx}`}>{text}</li>
                                ))}
                            </ul>
                        ) : null}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Experience;