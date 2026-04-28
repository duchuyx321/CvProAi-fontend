import classNames from 'classnames/bind';
import {
    Briefcase,
    Calendar,
    Globe,
    Home,
    Link,
    Mail,
    MapPin,
    Phone,
    User,
} from 'lucide-react';
import styles from '../CvPreview.module.scss';
import RichText from './RichText';
import {
    DATE_FIELDS,
    RICH_FIELDS,
    formatFieldValue,
    isEmpty,
    isFieldGroup,
    isFieldRef,
    resolveFieldValue,
} from '../utils/previewHelpers';
import { getAvatarStyle } from '../utils/styleUtils';

const cx = classNames.bind(styles);

const ICON_MAP = {
    address: MapPin,
    briefcase: Briefcase,
    calendar: Calendar,
    email: Mail,
    globe: Globe,
    home: Home,
    link: Link,
    location: MapPin,
    mail: Mail,
    phone: Phone,
    user: User,
    website: Globe,
};

function getFieldKey(field) {
    if (typeof field === 'string') return field;
    if (isFieldRef(field)) return field.key;
    return '';
}

function FieldRefRenderer({
    field,
    source,
    content,
    section,
    skipDate = false,
}) {
    const fieldConfig = typeof field === 'string' ? { key: field } : field;
    const key = fieldConfig?.key;

    if (!key || (skipDate && DATE_FIELDS.includes(key))) return null;

    const rawValue = resolveFieldValue(fieldConfig, source, content);
    if (fieldConfig?.hideWhenEmpty && isEmpty(rawValue)) return null;
    if (isEmpty(rawValue)) return null;

    if (key === 'avatar_url') {
        return (
            <img
                src={rawValue}
                alt={source?.full_name || 'avatar'}
                className={cx('avatarImage')}
                style={getAvatarStyle(section?.options?.avatar)}
            />
        );
    }

    const value = formatFieldValue(rawValue, fieldConfig?.format);
    const finalValue = `${fieldConfig?.prefix || ''}${value}${fieldConfig?.suffix || ''}`;
    const className = cx('fieldValue', fieldConfig?.className);
    const Icon = ICON_MAP[fieldConfig?.icon] || null;

    if (RICH_FIELDS.includes(key) || fieldConfig?.format === 'richtext') {
        return (
            <div className={className}>
                <RichText value={finalValue} />
            </div>
        );
    }

    return (
        <div className={className}>
            {Icon ? (
                <span className={cx('fieldIcon')} aria-hidden="true">
                    <Icon size={14} strokeWidth={2} />
                </span>
            ) : null}
            {fieldConfig?.label ? (
                <span className={cx('fieldLabel')}>{fieldConfig.label}</span>
            ) : null}
            <span>{finalValue}</span>
        </div>
    );
}

function getRenderableText(field, source, content, section, skipDate) {
    if (isFieldGroup(field)) {
        return groupToText(field, source, content, section, skipDate);
    }

    const key = getFieldKey(field);
    if (skipDate && DATE_FIELDS.includes(key)) return '';

    const rawValue = resolveFieldValue(field, source, content);
    if (isEmpty(rawValue)) return '';

    const value = isFieldRef(field)
        ? formatFieldValue(rawValue, field?.format)
        : String(rawValue);

    if (isFieldRef(field)) {
        return `${field?.prefix || ''}${value}${field?.suffix || ''}`;
    }

    return value;
}

function groupToText(group, source, content, section, skipDate) {
    const separator = group?.separator ?? ' ';

    return (group?.items || [])
        .map((item) => getRenderableText(item, source, content, section, skipDate))
        .filter(Boolean)
        .join(separator);
}

function FieldGroupRenderer({
    group,
    source,
    content,
    section,
    skipDate = false,
}) {
    if (!group?.items?.length) return null;

    const rawLayout = group?.layout || 'STACK';
    const layout =
        rawLayout === 'ROW' ? 'INLINE' : rawLayout === 'COLUMN' ? 'STACK' : rawLayout;

    if (layout === 'INLINE') {
        const text = groupToText(group, source, content, section, skipDate);
        if (!text) return null;
        return <div className={cx('fieldInline', group?.className)}>{text}</div>;
    }

    const style = {
        gap: group?.gap ? `${group.gap}px` : undefined,
        gridTemplateColumns:
            layout === 'GRID'
                ? `repeat(${group?.columns || 2}, minmax(0, 1fr))`
                : layout === 'SPLIT'
                  ? (group?.ratio || [1, 1])
                        .map((ratio) => `minmax(0, ${ratio}fr)`)
                        .join(' ')
                  : undefined,
    };

    return (
        <div
            className={cx(
                'fieldGroup',
                {
                    fieldStack: layout === 'STACK',
                    fieldSplit: layout === 'SPLIT',
                    fieldInlineGroup: layout === 'INLINE',
                    fieldGrid: layout === 'GRID',
                },
                group?.className,
            )}
            style={style}
        >
            {group.items.map((item, index) => (
                <FieldRenderer
                    key={`${getFieldKey(item) || 'group'}-${index}`}
                    field={item}
                    source={source}
                    content={content}
                    section={section}
                    skipDate={skipDate}
                />
            ))}
        </div>
    );
}

function FieldRenderer({ field, source, content, section, skipDate = false }) {
    if (isFieldGroup(field)) {
        return (
            <FieldGroupRenderer
                group={field}
                source={source}
                content={content}
                section={section}
                skipDate={skipDate}
            />
        );
    }

    return (
        <FieldRefRenderer
            field={field}
            source={source}
            content={content}
            section={section}
            skipDate={skipDate}
        />
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function renderFieldList(fields = [], source, content, options = {}) {
    return fields.map((field, index) => (
        <FieldRenderer
            key={`${getFieldKey(field) || 'field'}-${index}`}
            field={field}
            source={source}
            content={content}
            section={options?.section}
            skipDate={Boolean(options?.skipDate)}
        />
    ));
}

export { FieldGroupRenderer, FieldRefRenderer };
export default FieldRenderer;
