import classNames from 'classnames/bind';
import styles from '../CvPreview.module.scss';
import RichText from './RichText';
import {
    DATE_FIELDS,
    RICH_FIELDS,
    isEmpty,
    isFieldGroup,
    resolveFieldValue,
} from '../utils/previewHelpers';

const cx = classNames.bind(styles);

function PrimitiveField({ field, source, content, skipDate }) {
    if (skipDate && DATE_FIELDS.includes(field)) return null;

    const value = resolveFieldValue(field, source, content);
    if (isEmpty(value)) return null;

    if (field === 'avatar_url') {
        return <img src={value} alt="avatar" className={cx('avatarRect')} />;
    }

    if (RICH_FIELDS.includes(field)) {
        return <RichText value={value} />;
    }

    return <div className={cx('fieldValue')}>{String(value)}</div>;
}

function FieldGroupRenderer({ group, source, content, skipDate = false }) {
    if (!group?.items?.length) return null;

    return (
        <div
            className={cx(
                group.layout === 'SPLIT' ? 'fieldSplit' : 'fieldStack',
            )}
        >
            {group.items.map((item, index) =>
                isFieldGroup(item) ? (
                    <FieldGroupRenderer
                        key={index}
                        group={item}
                        source={source}
                        content={content}
                        skipDate={skipDate}
                    />
                ) : (
                    <PrimitiveField
                        key={`${item}-${index}`}
                        field={item}
                        source={source}
                        content={content}
                        skipDate={skipDate}
                    />
                ),
            )}
        </div>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function renderFieldList(
    fields = [],
    source,
    content,
    skipDate = false,
) {
    return fields.map((field, index) =>
        isFieldGroup(field) ? (
            <FieldGroupRenderer
                key={index}
                group={field}
                source={source}
                content={content}
                skipDate={skipDate}
            />
        ) : (
            <PrimitiveField
                key={`${field}-${index}`}
                field={field}
                source={source}
                content={content}
                skipDate={skipDate}
            />
        ),
    );
}

export { PrimitiveField, FieldGroupRenderer };
