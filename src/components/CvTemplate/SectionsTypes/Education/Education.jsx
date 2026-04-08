import classNames from 'classnames/bind';

import SectionTitle from '../../SectionTitle';
import styles from './Education.module.scss';

const cx = classNames.bind(styles);

function Education({ resumeData = {}, sectionConfig = {}, theme = {} }) {
    const title = sectionConfig?.title || 'Học Vấn';
    const variant = sectionConfig?.variant || 'card_with_date_badge';
    const list = Array.isArray(resumeData?.education) ? resumeData.education : [];

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
                        key={`${item.school}-${index}`}
                        className={cx('item', {
                            leftBorder: variant === 'card_with_left_border',
                        })}
                        style={{
                            backgroundColor: bgCard,
                            borderLeftColor:
                                variant === 'card_with_left_border'
                                    ? primary
                                    : 'transparent',
                        }}
                    >
                        <div className={cx('head')}>
                            <div className={cx('main')}>
                                <h4 className={cx('school')} style={{ color: textMain }}>
                                    {item.school}
                                </h4>

                                <p className={cx('major')} style={{ color: primary }}>
                                    {item.major}
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

                        {item.description ? (
                            <p className={cx('desc')} style={{ color: textMain }}>
                                {item.description}
                            </p>
                        ) : null}
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Education;