import classNames from 'classnames/bind';
import {
    FiChevronDown,
    FiChevronUp,
    FiPlus,
    FiTrash2,
} from 'react-icons/fi';
import styles from './SectionActions.module.scss';

const cx = classNames.bind(styles);

function SectionActions({
    expandable = false,
    expanded = false,
    removable = false,
    showDelete = false,
    onToggle,
    onRemove,
    onAdd,
}) {
    const handleRemove = (event) => {
        event.stopPropagation();
        onRemove?.();
    };

    const handleToggle = (event) => {
        event.stopPropagation();
        onToggle?.();
    };

    const handleAdd = (event) => {
        event.stopPropagation();
        onAdd?.();
    };

    return (
        <div className={cx('wrapper')}>
            {removable && showDelete && (
                <button
                    type="button"
                    className={cx('actionBtn', 'deleteBtn')}
                    onClick={handleRemove}
                    title="Xóa mục"
                >
                    <FiTrash2 />
                </button>
            )}

            {expandable ? (
                <button
                    type="button"
                    className={cx('actionBtn')}
                    onClick={handleToggle}
                    title={expanded ? 'Thu gọn' : 'Mở rộng'}
                >
                    {expanded ? <FiChevronUp /> : <FiChevronDown />}
                </button>
            ) : (
                <button
                    type="button"
                    className={cx('actionBtn')}
                    onClick={handleAdd}
                    title="Thêm mục"
                >
                    <FiPlus />
                </button>
            )}
        </div>
    );
}

export default SectionActions;