import classNames from 'classnames/bind';
import { FiChevronDown, FiPlus, FiTrash2 } from 'react-icons/fi';
import styles from './SectionActions.module.scss';

const cx = classNames.bind(styles);

function ActionButton({
    title,
    onClick,
    children,
    className,
    disabled = false,
}) {
    const handleClick = (event) => {
        event.stopPropagation();
        onClick?.(event);
    };

    return (
        <button
            type="button"
            className={cx('actionBtn', className)}
            title={title}
            onClick={handleClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
}

function SectionActions({
    expandable = false,
    expanded = false,
    removable = false,
    showDelete = false,
    onToggle,
    onRemove,
}) {
    return (
        <div className={cx('wrapper')}>
            {/* {addable && (
                <ActionButton
                    title="Thêm mục"
                    onClick={onAdd}
                    className="addBtn"
                >
                    <FiPlus />
                </ActionButton>
            )} */}

            {removable && showDelete && (
                <ActionButton
                    title="Xóa mục"
                    onClick={onRemove}
                    className="deleteBtn"
                >
                    <FiTrash2 />
                </ActionButton>
            )}

            {expandable && (
                <ActionButton
                    title={expanded ? 'Thu gọn' : 'Mở rộng'}
                    onClick={onToggle}
                    className={cx('toggleBtn', { expanded })}
                >
                    <FiChevronDown />
                </ActionButton>
            )}
        </div>
    );
}

export default SectionActions;