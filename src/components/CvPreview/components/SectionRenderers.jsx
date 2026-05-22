/* eslint-disable react-refresh/only-export-components */
import classNames from 'classnames/bind';
import styles from '../CvPreview.module.scss';
import FieldRenderer, { renderFieldList } from './FieldRenderer';
import RichText from './RichText';
import {
    DATE_FIELDS,
    getDateText,
    getSectionData,
    getSkillName,
    isEmpty,
    resolveFieldValue,
} from '../utils/previewHelpers';
import { getCardStyle, normalizeBoxStyle } from '../utils/styleUtils';

const cx = classNames.bind(styles);

const CONTACT_FIELDS = [
    'birth_date',
    'gender',
    'phone',
    'email',
    'address',
    'website',
];

const PRIMARY_ITEM_FIELDS = [
    'role',
    'degree',
    'name',
    'title',
    'company',
    'school',
    'organization',
    'issuer',
    'description',
    'content',
];

function normalizeVariant(value = '') {
    return String(value).trim();
}

function getFields(section = {}, data = {}) {
    if (Array.isArray(section?.fields) && section.fields.length) {
        return section.fields;
    }

    if (data && typeof data === 'object' && !Array.isArray(data)) {
        return Object.keys(data).filter((key) => !DATE_FIELDS.includes(key));
    }

    return [];
}

function getFieldKey(field) {
    if (typeof field === 'string') return field;
    if (field?.type === 'FIELD') return field.key;
    return '';
}

function stripDateFields(field) {
    const key = getFieldKey(field);

    if (key && DATE_FIELDS.includes(key)) return null;

    if (field?.items?.length) {
        const nextItems = field.items.map(stripDateFields).filter(Boolean);
        if (!nextItems.length) return null;
        if (nextItems.length === 1) return nextItems[0];

        return {
            ...field,
            items: nextItems,
        };
    }

    return field;
}

function removeFieldKey(field, targetKey) {
    if (!targetKey) return field;

    const key = getFieldKey(field);

    if (key === targetKey) return null;

    if (field?.items?.length) {
        const nextItems = field.items
            .map((item) => removeFieldKey(item, targetKey))
            .filter(Boolean);

        if (!nextItems.length) return null;
        if (nextItems.length === 1) return nextItems[0];

        return {
            ...field,
            items: nextItems,
        };
    }

    return field;
}

function removeFieldKeyFromList(fields = [], targetKey) {
    return fields
        .map((field) => removeFieldKey(field, targetKey))
        .filter(Boolean);
}

function getRenderableFieldsWithoutDates(section = {}, item = {}) {
    const fields = getFields(section, item)
        .map(stripDateFields)
        .filter(Boolean);

    if (fields.length > 0) return fields;

    return PRIMARY_ITEM_FIELDS.filter(
        (key) => !isEmpty(resolveFieldValue(key, item)),
    );
}

function getDatePosition(section = {}) {
    const position = section?.options?.date?.position;
    const variant = normalizeVariant(section?.variant);

    if (position) return position;
    if (variant.includes('left_date')) return 'left';
    if (variant.includes('right_date') || variant.includes('timeline'))
        return 'right';
    if (variant.includes('badge')) return 'badge';
    if (variant.includes('inline')) return 'inline';
    return 'right';
}

function getSkillDisplay(section = {}) {
    const display = section?.options?.skill?.display;
    const variant = normalizeVariant(section?.variant);

    if (display) return display;
    if (variant.includes('two_column') || variant.includes('bullet')) {
        return 'TWO_COLUMN_BULLET';
    }
    if (variant.includes('progress')) return 'PROGRESS_BAR';
    if (variant.includes('card') || variant.includes('text'))
        return 'CARD_TEXT';
    if (variant.includes('tag')) return 'TAG';
    return 'BULLET';
}

function CardWrapper({
    section,
    children,
    className,
    breakAvoid = false,
    itemIndex,
}) {
    const card = section?.options?.card;
    const style = {
        ...getCardStyle(card),
        ...normalizeBoxStyle(section?.style?.item),
    };
    const breakProps = breakAvoid
        ? {
              'data-cv-page-break-avoid': 'true',
              'data-cv-item-index': itemIndex,
          }
        : {};
    const blockProps = {
        'data-cv-content-block': 'true',
    };

    if (!card?.enabled) {
        return className ? (
            <div
                className={cx(className)}
                style={normalizeBoxStyle(section?.style?.item)}
                {...blockProps}
                {...breakProps}
            >
                {children}
            </div>
        ) : (
            children
        );
    }

    return (
        <div
            className={cx('sectionCard', className)}
            style={style}
            {...blockProps}
            {...breakProps}
        >
            {children}
        </div>
    );
}

function DefaultFields({ section, data, content, skipDate = false }) {
    if (typeof data === 'string') {
        return <RichText value={data} />;
    }

    return (
        <div className={cx('objectBlock')}>
            {renderFieldList(getFields(section, data), data, content, {
                section,
                skipDate,
            })}
        </div>
    );
}

function Avatar({ section, data, content }) {
    return (
        <FieldRenderer
            field="avatar_url"
            source={data}
            content={content}
            section={section}
        />
    );
}

function ContactInline({ section, content }) {
    const contactData = getSectionData('contact', { type: 'CONTACT' }, content);
    if (isEmpty(contactData)) return null;

    const fields = getFields(section, contactData).filter((field) => {
        const key = typeof field === 'string' ? field : field?.key;
        return CONTACT_FIELDS.includes(key);
    });
    const nextFields = fields.length ? fields : CONTACT_FIELDS;

    return (
        <div className={cx('contactInline')}>
            {nextFields.map((field, index) => {
                const key = typeof field === 'string' ? field : field?.key;
                const value = resolveFieldValue(field, contactData, content);
                if (isEmpty(value)) return null;

                return (
                    <span
                        key={`${key}-${index}`}
                        className={cx('contactInlineItem')}
                    >
                        {String(value)}
                    </span>
                );
            })}
        </div>
    );
}

export function ProfileTopAvatarLeftContactInline({ section, data, content }) {
    const name = resolveFieldValue('full_name', data, content);
    const headline = resolveFieldValue('headline', data, content);
    const nameStyle = normalizeBoxStyle(section?.style?.title);
    const headlineStyle = normalizeBoxStyle(section?.style?.content);

    return (
        <div className={cx('profileTop')}>
            <Avatar section={section} data={data} content={content} />
            <div className={cx('profileTopInfo')}>
                {name ? (
                    <div className={cx('fullName')} style={nameStyle}>
                        {name}
                    </div>
                ) : null}
                {headline ? (
                    <div className={cx('headline')} style={headlineStyle}>
                        {headline}
                    </div>
                ) : null}
                <ContactInline section={section} content={content} />
            </div>
        </div>
    );
}

export function ProfileBannerAvatarRight({ section, data, content }) {
    const name = resolveFieldValue('full_name', data, content);
    const headline = resolveFieldValue('headline', data, content);
    const nameStyle = normalizeBoxStyle(section?.style?.title);
    const headlineStyle = normalizeBoxStyle(section?.style?.content);

    return (
        <div className={cx('profileBanner')}>
            <div className={cx('profileBannerContent')}>
                <div className={cx('profileBannerInfo')}>
                    {name ? (
                        <div
                            className={cx('fullName', 'fullNameLight')}
                            style={nameStyle}
                        >
                            {name}
                        </div>
                    ) : null}
                    {headline ? (
                        <div
                            className={cx('headline', 'headlineLight')}
                            style={headlineStyle}
                        >
                            {headline}
                        </div>
                    ) : null}
                    <ContactInline section={section} content={content} />
                </div>
                <div className={cx('profileBannerAvatar')}>
                    <Avatar section={section} data={data} content={content} />
                </div>
            </div>
        </div>
    );
}

export function ProfileSidebarAvatarTop({ section, data, content }) {
    const name = resolveFieldValue('full_name', data, content);
    const headline = resolveFieldValue('headline', data, content);
    const nameStyle = normalizeBoxStyle(section?.style?.title);
    const headlineStyle = normalizeBoxStyle(section?.style?.content);

    return (
        <div className={cx('profileSidebar')}>
            <Avatar section={section} data={data} content={content} />
            {name ? (
                <div
                    className={cx('fullName', 'fullNameUpper')}
                    style={nameStyle}
                >
                    {name}
                </div>
            ) : null}
            {headline ? (
                <div className={cx('headlinePill')} style={headlineStyle}>
                    {headline}
                </div>
            ) : null}
        </div>
    );
}

export function ContactLabelValue({ section, data, content }) {
    return (
        <div className={cx('contactLabelList')}>
            {getFields(section, data).map((field, index) => {
                const key = typeof field === 'string' ? field : field?.key;
                const value = resolveFieldValue(field, data, content);
                if (isEmpty(value)) return null;

                return (
                    <div
                        key={`${key}-${index}`}
                        className={cx('contactLabelItem')}
                        data-contact-field={key}
                    >
                        <span className={cx('contactLabel')}>
                            {field?.label || key}
                        </span>
                        <span className={cx('contactText')}>
                            {String(value)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export function ContactIconList({ section, data, content }) {
    return (
        <div className={cx('contactList')}>
            {getFields(section, data).map((field, index) => {
                const value = resolveFieldValue(field, data, content);
                if (isEmpty(value)) return null;

                return (
                    <div
                        key={`${getFieldKey(field) || 'contact'}-${index}`}
                        className={cx('contactItem')}
                    >
                        <FieldRenderer
                            field={field}
                            source={data}
                            content={content}
                            section={section}
                        />
                    </div>
                );
            })}
        </div>
    );
}

export function TextBlock({ section, data, content }) {
    return (
        <CardWrapper section={section}>
            <DefaultFields section={section} data={data} content={content} />
        </CardWrapper>
    );
}

export function CardContent({ section, data, content }) {
    return (
        <CardWrapper section={section} className="sectionCardAlways">
            <DefaultFields section={section} data={data} content={content} />
        </CardWrapper>
    );
}

function renderDate(dateText, position) {
    if (!dateText) return null;
    return (
        <div className={cx(position === 'badge' ? 'dateBadge' : 'dateText')}>
            {dateText}
        </div>
    );
}

function ArrayItem({ section, item, content, position }) {
    const dateText = getDateText(item, section?.options?.date);
    let fieldsForRender = getRenderableFieldsWithoutDates(section, item);

    // Helper to extract primary field value (company, school, title, etc.)
    const getPrimaryFieldValue = () => {
        for (const key of PRIMARY_ITEM_FIELDS) {
            const value = resolveFieldValue(key, item, content);
            if (!isEmpty(value)) return { key, value: String(value) };
        }
        return null;
    };

    const isRightDate = position === 'right' || position === 'badge';

    if (position === 'left') {
        return (
            <div className={cx('timelineItem', 'timelineItemLeft')}>
                {renderDate(dateText, 'left')}
                <div className={cx('cardBody')}>
                    {renderFieldList(fieldsForRender, item, content, {
                        section,
                        skipDate: true,
                    })}
                </div>
            </div>
        );
    }

    if (position === 'inline') {
        return (
            <div className={cx('timelineItem')}>
                <div className={cx('cardBody')}>
                    {dateText ? (
                        <div className={cx('dateInline')}>{dateText}</div>
                    ) : null}
                    {renderFieldList(fieldsForRender, item, content, {
                        section,
                        skipDate: true,
                    })}
                </div>
            </div>
        );
    }

    // For right-side date (including badge), use header + body layout
    if (isRightDate) {
        const primary = getPrimaryFieldValue();
        if (primary && primary.value) {
            // Filter out the primary field from fieldsForRender to avoid duplication
            fieldsForRender = removeFieldKeyFromList(
                fieldsForRender,
                primary.key,
            );

            return (
                <div className={cx('timelineItemBlock')}>
                    <div className={cx('timelineHeader')}>
                        <div className={cx('timelineTitle')}>
                            {primary.value}
                        </div>
                        {renderDate(dateText, position)}
                    </div>
                    <div className={cx('cardBody')}>
                        {renderFieldList(fieldsForRender, item, content, {
                            section,
                            skipDate: true,
                        })}
                    </div>
                </div>
            );
        }
    }

    // Fallback to original layout for other cases
    return (
        <div
            className={cx('timelineItem', {
                timelineItemRight: position === 'right',
            })}
        >
            <div className={cx('cardBody')}>
                {renderFieldList(fieldsForRender, item, content, {
                    section,
                    skipDate: true,
                })}
            </div>
            {renderDate(dateText, position)}
        </div>
    );
}

export function TimelineContent({ section, data = [], content }) {
    if (!Array.isArray(data) || !data.length) return null;

    const position = getDatePosition(section);
    const timeline = section?.options?.timeline;

    return (
        <div
            className={cx('cardList', {
                timelineList: timeline?.enabled,
            })}
            style={{
                '--cv-timeline-line': timeline?.lineColor,
                '--cv-timeline-dot': timeline?.dotColor,
                '--cv-timeline-dot-size': timeline?.dotSize
                    ? `${timeline.dotSize}px`
                    : undefined,
            }}
        >
            {data.map((item, index) => (
                <CardWrapper
                    key={index}
                    section={section}
                    className="cardItem"
                    breakAvoid
                    itemIndex={index}
                >
                    <ArrayItem
                        section={section}
                        item={item}
                        content={content}
                        position={position}
                    />
                </CardWrapper>
            ))}
        </div>
    );
}

export function SkillsRenderer({ section, data = [] }) {
    if (!Array.isArray(data) || !data.length) return null;

    let display = getSkillDisplay(section);
    const skillOptions = section?.options?.skill || {};
    const grid = section?.options?.grid || {};
    const maxLevel = Number(skillOptions?.maxLevel || 100) || 100;

    // Detect if any skill has additional data (description, level, years, proficiency)
    const hasRichData = data.some(
        (item) =>
            item?.description ||
            item?.level !== undefined ||
            item?.years !== undefined ||
            item?.proficiency,
    );

    // If no rich data and current display is not already a compact style, fall back to TAG
    const compactDisplays = ['TAG', 'BULLET', 'TWO_COLUMN_BULLET'];
    if (!hasRichData && !compactDisplays.includes(display)) {
        display = 'TAG';
    }

    if (display === 'PROGRESS_BAR') {
        return (
            <div className={cx('skillsList')}>
                {data.map((item, index) => {
                    const level = Number(item?.level || 0);
                    const percent = Math.min(
                        100,
                        Math.max(0, (level / maxLevel) * 100),
                    );

                    return (
                        <div
                            key={index}
                            className={cx('skillProgressItem')}
                            data-cv-page-break-avoid="true"
                            data-cv-item-index={index}
                        >
                            <div className={cx('skillName')}>
                                {getSkillName(item)}
                                {skillOptions?.showLevel
                                    ? ` ${Math.round(percent)}%`
                                    : ''}
                            </div>
                            <div className={cx('skillBar')}>
                                <div
                                    className={cx('skillBarFill')}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                            {skillOptions?.showDescription &&
                            item?.description ? (
                                <div className={cx('skillDescription')}>
                                    {item.description}
                                </div>
                            ) : null}
                        </div>
                    );
                })}
            </div>
        );
    }

    if (display === 'CARD_TEXT') {
        return (
            <div className={cx('skillsList')}>
                {data.map((item, index) => (
                    <CardWrapper
                        key={index}
                        section={section}
                        className="skillCard"
                        breakAvoid
                        itemIndex={index}
                    >
                        <div className={cx('skillName')}>
                            {getSkillName(item)}
                        </div>
                        {skillOptions?.showDescription && item?.description ? (
                            <div className={cx('skillDescription')}>
                                {item.description}
                            </div>
                        ) : null}
                    </CardWrapper>
                ))}
            </div>
        );
    }

    if (display === 'TAG') {
        return (
            <div className={cx('skillsTags')}>
                {data.map((item, index) => (
                    <span
                        key={index}
                        className={cx('skillTag')}
                        data-cv-page-break-avoid="true"
                        data-cv-item-index={index}
                    >
                        {getSkillName(item)}
                    </span>
                ))}
            </div>
        );
    }

    return (
        <ul
            className={cx('skillBulletList', {
                skillBulletTwoColumn: display === 'TWO_COLUMN_BULLET',
            })}
            style={{
                gridTemplateColumns:
                    display === 'TWO_COLUMN_BULLET'
                        ? `repeat(${grid?.columns || 2}, minmax(0, 1fr))`
                        : undefined,
                columnGap: grid?.columnGap ? `${grid.columnGap}px` : undefined,
                rowGap: grid?.rowGap ? `${grid.rowGap}px` : undefined,
            }}
        >
            {data.map((item, index) => (
                <li
                    key={index}
                    data-cv-page-break-avoid="true"
                    data-cv-item-index={index}
                >
                    {getSkillName(item)}
                </li>
            ))}
        </ul>
    );
}

export function DefaultSectionRenderer({ section, data, content }) {
    if (Array.isArray(data)) {
        return (
            <TimelineContent section={section} data={data} content={content} />
        );
    }

    return <TextBlock section={section} data={data} content={content} />;
}

export const sectionRendererMap = {
    profile_top_avatar_left_contact_inline: ProfileTopAvatarLeftContactInline,
    profile_banner_avatar_right: ProfileBannerAvatarRight,
    profile_sidebar_avatar_top: ProfileSidebarAvatarTop,
    profile_sidebar_avatar_rounded: ProfileSidebarAvatarTop,
    sidebar_avatar_badge_name: ProfileSidebarAvatarTop,
    top_header: ProfileTopAvatarLeftContactInline,
    profile_header: ProfileTopAvatarLeftContactInline,

    contact_label_value: ContactLabelValue,
    contact_icon_list: ContactIconList,
    icon_list: ContactIconList,

    fullwidth_title_bar_richtext: TextBlock,
    text_block: TextBlock,
    content_box_richtext: TextBlock,
    sidebar_box_richtext: CardContent,
    card_content: CardContent,

    left_date_right_content: TimelineContent,
    right_date_timeline: TimelineContent,
    date_badge_card: TimelineContent,
    card_right_date_badge: TimelineContent,
    timeline: TimelineContent,
    list: TimelineContent,

    skills_two_column_bullets: SkillsRenderer,
    skills_progress_bar: SkillsRenderer,
    progress_bar: SkillsRenderer,
    skills_card_text: SkillsRenderer,
    skills_tags: SkillsRenderer,
    skills_bullet: SkillsRenderer,

    awards_simple: TimelineContent,
    certificates_simple: TimelineContent,
    project_card: TimelineContent,
};
