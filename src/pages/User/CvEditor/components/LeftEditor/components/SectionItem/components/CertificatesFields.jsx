import classNames from 'classnames/bind';
import styles from '../SectionItem.module.scss';
import RichTextEditor from '~/components/RichTextEditor';

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

function CertificatesFields({
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
            {!items.length && <ArrayEmptyState message="Chưa có chứng chỉ nào." />}

            {items.map((item, index) => (
                <ItemCard key={`${sectionKey}-${index}`}>
                    <div className={cx('fieldsGrid')}>
                        <FieldGroup label="Tên chứng chỉ">
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

                        <FieldGroup label="Đơn vị cấp">
                            <BaseInput
                                value={item?.issuer}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'issuer',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Ngày cấp" fullWidth>
                            <BaseInput
                                value={item?.issue_date}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'issue_date',
                                        e.target.value,
                                    )
                                }
                            />
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
                                placeholder="Nhập mô tả chứng chỉ..."
                                minHeight={160}
                            />
                        </FieldGroup>
                    </div>

                    <ItemActions
                        removeLabel="Xóa chứng chỉ"
                        onRemove={() => handleRemove(index)}
                    />
                </ItemCard>
            ))}

            <AddItemButton onClick={handleAdd}>+ Thêm chứng chỉ</AddItemButton>
        </div>
    );
}

export default CertificatesFields;