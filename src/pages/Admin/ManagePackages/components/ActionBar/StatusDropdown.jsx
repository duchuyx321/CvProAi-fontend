import classNames from 'classnames/bind';
import { useEffect, useRef, useState } from 'react';
import { MdCheck, MdKeyboardArrowDown } from 'react-icons/md';
import styles from './ActionBar.module.scss';

const cx = classNames.bind(styles);

const STATUS_OPTIONS = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'ACTIVE', label: 'Đang hoạt động' },
    { value: 'PAUSED', label: 'Tạm ngưng' },
];

function StatusDropdown({ value, onChange }) {
    const ref = useRef(null);
    const [open, setOpen] = useState(false);

    const activeOption = STATUS_OPTIONS.find((o) => o.value === value) || STATUS_OPTIONS[0];

    useEffect(() => {
        if (!open) return undefined;
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    return (
        <div className={cx('fieldWrap')} ref={ref}>
            <button
                type="button"
                className={cx('filterButton', { filterButtonActive: value !== 'ALL' })}
                onClick={() => setOpen((p) => !p)}
                aria-label="Lọc theo trạng thái"
            >
                <span className={cx('filterText')}>{activeOption.label}</span>
                <MdKeyboardArrowDown className={cx('arrowIcon')} />
            </button>

            {open && (
                <div className={cx('popover', 'statusPopover')}>
                    <div className={cx('optionList')}>
                        {STATUS_OPTIONS.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                className={cx('optionItem', { optionItemActive: item.value === value })}
                                onClick={() => { onChange(item.value); setOpen(false); }}
                            >
                                <span>{item.label}</span>
                                {item.value === value && <MdCheck className={cx('optionIcon')} />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default StatusDropdown;
