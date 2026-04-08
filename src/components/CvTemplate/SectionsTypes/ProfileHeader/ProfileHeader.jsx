import classNames from 'classnames/bind';
import styles from './ProfileHeader.module.scss';

const cx = classNames.bind(styles);

function getFieldValue(resumeData, key) {
    return resumeData?.[key] ?? '';
}

function ProfileHeader({ resumeData = {}, sectionConfig = {}, theme = {} }) {
    const fields = sectionConfig?.fields || [];
    const stylesConfig = sectionConfig?.styles || {};
    const variant = sectionConfig?.variant || 'stacked_left';

    const avatarUrl = getFieldValue(resumeData, 'avatar_url');
    const headline = getFieldValue(resumeData, 'headline');
    const fullName = getFieldValue(resumeData, 'full_name');

    const primary = theme?.colors?.primary || '#1e3a8a';
    const accent = theme?.colors?.accent || '#3b82f6';
    const bgSoft = theme?.colors?.bg_soft || '#eff6ff';
    const textMain = theme?.colors?.text_main || '#1f2937';
    const bannerBg = theme?.colors?.banner_bg || primary;

    const isBanner = variant === 'banner_left_avatar';
    const isCenter = variant === 'stacked_center';

    return (
        <section
            className={cx('wrapper', {
                banner: isBanner,
                center: isCenter,
            })}
            style={isBanner ? { backgroundColor: bannerBg } : undefined}
        >
            {fields.includes('avatar_url') ? (
                <div
                    className={cx('avatar', {
                        circle: stylesConfig?.avatar_shape === 'circle',
                        roundedRect:
                            stylesConfig?.avatar_shape === 'rounded_rect',
                    })}
                >
                    {avatarUrl ? (
                        <img src={avatarUrl} alt={fullName} className={cx('img')} />
                    ) : (
                        <div className={cx('placeholder')}></div>
                    )}
                </div>
            ) : null}

            <div className={cx('content')}>
                {fields.includes('headline') && headline ? (
                    <span
                        className={cx('headline', {
                            pillBadge:
                                stylesConfig?.headline_style === 'pill_badge',
                            textPlain:
                                stylesConfig?.headline_style === 'text_plain',
                            textLight:
                                stylesConfig?.headline_style === 'text_light',
                        })}
                        style={{
                            color:
                                stylesConfig?.headline_style === 'text_light'
                                    ? '#ffffff'
                                    : accent,
                            backgroundColor:
                                stylesConfig?.headline_style === 'pill_badge'
                                    ? bgSoft
                                    : 'transparent',
                        }}
                    >
                        {headline}</span>
                ) : null}

                {fields.includes('full_name') && fullName ? (
                    <h1
                        className={cx('name', {
                            uppercaseBold:
                                stylesConfig?.name_style === 'uppercase_bold',
                        })}
                        style={{
                            color: isBanner ? '#ffffff' : primary || textMain,
                        }}
                    >
                        {fullName}
                    </h1>
                ) : null}
            </div>
        </section>
    );
}

export default ProfileHeader;