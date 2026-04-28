import classNames from 'classnames/bind';
import styles from '../SectionItem.module.scss';
import {
    getFieldLabel,
    isBooleanField,
    isLongTextField,
    uniqueFieldKeys,
} from './fieldConfig.utils';

const cx = classNames.bind(styles);

const ARRAY_SECTION_FALLBACK_FIELDS = {
    activities: [
        'organization',
        'role',
        'start_date',
        'end_date',
        'description',
    ],
    awards: ['name', 'date', 'organization', 'description'],
    languages: ['name', 'level', 'description'],
    references: ['name', 'position', 'company', 'email', 'phone'],
};

function FieldGroup({ label, children, fullWidth = false }) {
    return (
        <div className={cx('fieldGroup', { fullWidth })}>
            {label ? <label className={cx('label')}>{label}</label> : null}
            {children}
        </div>
    );
}

function BaseInput({ value, onChange, type = 'text' }) {
    return (
        <input
            className={cx('input')}
            type={type}
            value={value ?? ''}
            onChange={onChange}
        />
    );
}

function BaseTextarea({ value, onChange }) {
    return (
        <textarea
            className={cx('textarea')}
            value={value ?? ''}
            onChange={onChange}
        />
    );
}

function EmptyState({ message }) {
    return (
        <div className={cx('emptyState')}>
            <p>{message}</p>
        </div>
    );
}

function getInputType(fieldKey) {
    if (fieldKey === 'email') return 'email';
    if (
        fieldKey.includes('url') ||
        fieldKey === 'website' ||
        fieldKey === 'link'
    ) {
        return 'url';
    }
    if (fieldKey === 'level' || fieldKey === 'year' || fieldKey === 'gpa') {
        return 'text';
    }
    return 'text';
}

function getObjectFieldKeys(section, value = {}) {
    const configKeys = uniqueFieldKeys(section?.fields);
    const valueKeys =
        value && typeof value === 'object' && !Array.isArray(value)
            ? Object.keys(value)
            : [];

    return [...new Set([...configKeys, ...valueKeys])].filter(Boolean);
}

function getArrayFieldKeys(section, items = []) {
    const configKeys = uniqueFieldKeys(section?.fields);
    const sectionKey = section?.key || section?.type;
    const fallbackKeys = ARRAY_SECTION_FALLBACK_FIELDS[sectionKey] || [];
    const itemKeys = items.flatMap((item) =>
        item && typeof item === 'object' && !Array.isArray(item)
            ? Object.keys(item)
            : [],
    );

    return [...new Set([...configKeys, ...fallbackKeys, ...itemKeys])].filter(
        Boolean,
    );
}

function createEmptyItem(fieldKeys = []) {
    return fieldKeys.reduce((item, fieldKey) => {
        item[fieldKey] = isBooleanField(fieldKey) ? false : '';
        return item;
    }, {});
}

function DynamicField({ fieldKey, value, onChange }) {
    if (isBooleanField(fieldKey)) {
        return (
            <FieldGroup fullWidth>
                <label className={cx('checkboxLabel')}>
                    <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(event) => onChange(event.target.checked)}
                    />
                    <span>{getFieldLabel(fieldKey)}</span>
                </label>
            </FieldGroup>
        );
    }

    return (
        <FieldGroup
            label={getFieldLabel(fieldKey)}
            fullWidth={isLongTextField(fieldKey)}
        >
            {isLongTextField(fieldKey) ? (
                <BaseTextarea
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            ) : (
                <BaseInput
                    type={getInputType(fieldKey)}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                />
            )}
        </FieldGroup>
    );
}

function DynamicArrayEditor({
    data = [],
    section,
    sectionKey,
    onChangeArrayField,
    onChangeObjectInArray,
}) {
    const items = Array.isArray(data) ? data : [];
    const fieldKeys = getArrayFieldKeys(section, items);

    const handleAdd = () => {
        onChangeArrayField?.(sectionKey, [
            ...items,
            createEmptyItem(fieldKeys),
        ]);
    };

    const handleRemove = (index) => {
        onChangeArrayField?.(
            sectionKey,
            items.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    return (
        <div className={cx('arraySection')}>
            {!items.length && <EmptyState message="Chưa có dữ liệu." />}

            {items.map((item, index) => (
                <div className={cx('arrayItem')} key={`${sectionKey}-${index}`}>
                    <div className={cx('fieldsGrid')}>
                        {fieldKeys.map((fieldKey) => (
                            <DynamicField
                                key={fieldKey}
                                fieldKey={fieldKey}
                                value={item?.[fieldKey]}
                                onChange={(nextValue) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        fieldKey,
                                        nextValue,
                                    )
                                }
                            />
                        ))}
                    </div>

                    <div className={cx('itemActions')}>
                        <button
                            type="button"
                            className={cx('removeItemBtn')}
                            onClick={() => handleRemove(index)}
                        >
                            Xóa mục
                        </button>
                    </div>
                </div>
            ))}

            <button
                type="button"
                className={cx('addItemBtn')}
                onClick={handleAdd}
            >
                + Thêm mục
            </button>
        </div>
    );
}

function DynamicObjectEditor({
    data = {},
    section,
    sectionKey,
    onChangeField,
}) {
    const safeData =
        data && typeof data === 'object' && !Array.isArray(data) ? data : {};
    const fieldKeys = getObjectFieldKeys(section, safeData);

    if (!fieldKeys.length) {
        return <EmptyState message="Section này chưa có field để nhập." />;
    }

    return (
        <div className={cx('fieldsGrid')}>
            {fieldKeys.map((fieldKey) => (
                <DynamicField
                    key={fieldKey}
                    fieldKey={fieldKey}
                    value={safeData?.[fieldKey]}
                    onChange={(nextValue) =>
                        onChangeField?.(sectionKey, fieldKey, nextValue)
                    }
                />
            ))}
        </div>
    );
}

function DynamicSectionFields({
    data,
    section,
    sectionKey,
    onChangeArrayField,
    onChangeField,
    onChangeObjectInArray,
}) {
    if (Array.isArray(data)) {
        return (
            <DynamicArrayEditor
                data={data}
                section={section}
                sectionKey={sectionKey}
                onChangeArrayField={onChangeArrayField}
                onChangeObjectInArray={onChangeObjectInArray}
            />
        );
    }

    return (
        <DynamicObjectEditor
            data={data}
            section={section}
            sectionKey={sectionKey}
            onChangeField={onChangeField}
        />
    );
}

export default DynamicSectionFields;
