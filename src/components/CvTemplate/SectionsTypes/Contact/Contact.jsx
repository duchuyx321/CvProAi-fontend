import classNames from 'classnames/bind';
import { MdMailOutline, MdPhone, MdLocationOn, MdLanguage } from 'react-icons/md';

import SectionTitle from '../../SectionTitle';
import styles from './Contact.module.scss';

const cx = classNames.bind(styles);

function Contact({ resumeData = {}, sectionConfig = {}, theme = {} }) {
    const title = sectionConfig?.title || 'Thông Tin Liên Hệ';
    const variant = sectionConfig?.variant || 'icon_box_list';

    const items = [
        {
            key: 'email',
            icon: <MdMailOutline />,
            value: resumeData?.email,
        },
        {
            key: 'phone',
            icon: <MdPhone />,
            value: resumeData?.phone,
        },
        {
            key: 'address',
            icon: <MdLocationOn />,
            value: resumeData?.address,
        },
        {
            key: 'website',
            icon: <MdLanguage />,
            value: resumeData?.website,
        },
    ].filter((item) => item.value);

    if (!items.length) return null;

    const accent = theme?.colors?.accent || '#3b82f6';
    const bgSoft = theme?.colors?.bg_soft || '#eff6ff';
    const textMain = theme?.colors?.text_main || '#1f2937';
    const itemGap = theme?.spacing?.item_gap ?? 12;
    const isInline = variant === 'inline_list' || variant === 'banner_inline_list';

    return (
        <section className={cx('wrapper')}>
            <SectionTitle title={title} theme={theme} />

            <div
                className={cx('list', {
                    inline: isInline,
                })}
                style={{ gap: `${itemGap}px` }}
            >
                {items.map((item) => (
                    <div key={item.key} className={cx('item')}>
                        <span
                            className={cx('icon')}
                            style={{
                                color: accent,
                                backgroundColor: isInline ? 'transparent' : bgSoft,
                            }}
                        >
                            {item.icon}
                        </span>

                        <span
                            className={cx('value')}
                            style={{ color: textMain }}
                        >
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default Contact;