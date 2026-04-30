import classNames from 'classnames/bind';
import styles from '../SectionItem.module.scss';
import RichTextEditor from '~/components/RichTextEditor';
import {
    getFieldLabel,
    isLongTextField,
    uniqueFieldKeys,
} from './fieldConfig.utils';

const cx = classNames.bind(styles);

function ArrayEmptyState({ message }) {
    return (
        <div className={cx('emptyState')}>
            <p>{message}</p>
        </div>
    );
}

function ItemCard({ children }) {
    return <div className={cx('arrayItem')}>{children}</div>;
}

function ItemActions({ onRemove, removeLabel }) {
    return (
        <div className={cx('itemActions')}>
            <button
                type="button"
                className={cx('removeItemBtn')}
                onClick={onRemove}
            >
                {removeLabel}
            </button>
        </div>
    );
}

function AddItemButton({ onClick, children }) {
    return (
        <button type="button" className={cx('addItemBtn')} onClick={onClick}>
            {children}
        </button>
    );
}

function FieldGroup({ label, children, fullWidth = false }) {
    return (
        <div className={cx('fieldGroup', { fullWidth })}>
            {label ? <label className={cx('label')}>{label}</label> : null}
            {children}
        </div>
    );
}

function BaseInput({ value, onChange, type = 'text', disabled = false }) {
    return (
        <input
            className={cx('input')}
            type={type}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
        />
    );
}

const BASE_EDUCATION_FIELDS = new Set([
    'school',
    'degree',
    'start_date',
    'end_date',
    'is_current',
    'description',
]);

function getExtraFieldKeys(section = {}, items = []) {
    return [
        ...new Set([
            ...uniqueFieldKeys(section?.fields),
            ...items.flatMap((item) => Object.keys(item || {})),
        ]),
    ].filter((fieldKey) => fieldKey && !BASE_EDUCATION_FIELDS.has(fieldKey));
}

function EducationFields({
    data = [],
    onChangeArrayField,
    onChangeObjectInArray,
    onAddSectionItem,
    sectionKey,
    section = {},
}) {
    const items = Array.isArray(data) ? data : [];
    const extraFieldKeys = getExtraFieldKeys(section, items);

    const handleAdd = () => {
        onAddSectionItem?.(sectionKey);
    };

    const handleRemove = (index) => {
        onChangeArrayField?.(
            sectionKey,
            items.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    return (
        <div className={cx('arraySection')}>
            {!items.length && (
                <ArrayEmptyState message="Chưa có thông tin học vấn nào." />
            )}

            {items.map((item, index) => (
                <ItemCard key={`${sectionKey}-${index}`}>
                    <div className={cx('fieldsGrid')}>
                        <FieldGroup label="Trường học">
                            <BaseInput
                                value={item?.school}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'school',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Bằng cấp / Chuyên ngành">
                            <BaseInput
                                value={item?.degree}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'degree',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Ngày bắt đầu">
                            <BaseInput
                                value={item?.start_date}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'start_date',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Ngày kết thúc">
                            <BaseInput
                                value={item?.end_date}
                                disabled={Boolean(item?.is_current)}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'end_date',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup fullWidth>
                            <label className={cx('checkboxLabel')}>
                                <input
                                    type="checkbox"
                                    checked={Boolean(item?.is_current)}
                                    onChange={(e) =>
                                        onChangeObjectInArray?.(
                                            sectionKey,
                                            index,
                                            'is_current',
                                            e.target.checked,
                                        )
                                    }
                                />
                                <span>Đang học tại đây</span>
                            </label>
                        </FieldGroup>

                        <FieldGroup label="Mô tả" fullWidth>
                            <RichTextEditor
                                value={item?.description || '<p></p>'}
                                onChange={(html) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'description',
                                        html,
                                    )
                                }
                                placeholder="Nhập mô tả học vấn..."
                                minHeight={160}
                            />
                        </FieldGroup>

                        {extraFieldKeys.map((fieldKey) => (
                            <FieldGroup
                                key={fieldKey}
                                label={getFieldLabel(fieldKey)}
                                fullWidth={isLongTextField(fieldKey)}
                            >
                                {isLongTextField(fieldKey) ? (
                                    <textarea
                                        className={cx('textarea')}
                                        value={item?.[fieldKey] || ''}
                                        onChange={(e) =>
                                            onChangeObjectInArray?.(
                                                sectionKey,
                                                index,
                                                fieldKey,
                                                e.target.value,
                                            )
                                        }
                                    />
                                ) : (
                                    <BaseInput
                                        value={item?.[fieldKey]}
                                        onChange={(e) =>
                                            onChangeObjectInArray?.(
                                                sectionKey,
                                                index,
                                                fieldKey,
                                                e.target.value,
                                            )
                                        }
                                    />
                                )}
                            </FieldGroup>
                        ))}
                    </div>

                    <ItemActions
                        removeLabel="Xóa học vấn"
                        onRemove={() => handleRemove(index)}
                    />
                </ItemCard>
            ))}

            <AddItemButton onClick={handleAdd}>+ Thêm học vấn</AddItemButton>
        </div>
    );
}

export default EducationFields;
