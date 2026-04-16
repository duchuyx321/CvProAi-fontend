import classNames from 'classnames/bind';
import styles from '../SectionItem.module.scss';

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

function SkillsFields({
    data = [],
    onChangeArrayField,
    onChangeObjectInArray,
    onAddSectionItem,
    sectionKey,
}) {
    const items = Array.isArray(data) ? data : [];

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
            {!items.length && <ArrayEmptyState message="Chưa có kỹ năng nào." />}

            {items.map((item, index) => (
                <ItemCard key={`${sectionKey}-${index}`}>
                    <FieldGroup label="Tên kỹ năng">
                        <BaseInput
                            value={item?.name}
                            onChange={(e) =>
                                onChangeObjectInArray?.(
                                    sectionKey,
                                    index,
                                    'name',
                                    e.target.value,
                                )
                            }
                        />
                    </FieldGroup>

                    {/* <FieldGroup label="Mô tả">
                        <BaseInput
                            value={item?.description}
                            onChange={(e) =>
                                onChangeObjectInArray?.(
                                    sectionKey,
                                    index,
                                    'description',
                                    e.target.value,
                                )
                            }
                        />
                    </FieldGroup> */}

                    <ItemActions
                        removeLabel="Xóa kỹ năng"
                        onRemove={() => handleRemove(index)}
                    />
                </ItemCard>
            ))}

            <AddItemButton onClick={handleAdd}>+ Thêm kỹ năng</AddItemButton>
        </div>
    );
}

export default SkillsFields;