import classNames from 'classnames/bind';
import { useEffect, useRef, useState } from 'react';
import { MdClose, MdKeyboardArrowDown, MdOutlineCalendarMonth } from 'react-icons/md';
import styles from './ActionBar.module.scss';

const cx = classNames.bind(styles);

const DATE_PRESETS = [
    { value: 'all', label: 'Tất cả' },
    { value: '7days', label: '7 ngày gần đây' },
    { value: '30days', label: '30 ngày gần đây' },
    { value: 'custom', label: 'Tùy chọn' },
];

function formatDate(value) {
    const parts = String(value || '').split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function getLabel(filters) {
    if (filters.createdPreset === '7days') return '7 ngày gần đây';
    if (filters.createdPreset === '30days') return '30 ngày gần đây';
    if (filters.createdPreset === 'custom') {
        if (filters.createdFrom && filters.createdTo)
            return `${formatDate(filters.createdFrom)} - ${formatDate(filters.createdTo)}`;
        if (filters.createdFrom) return `Từ ${formatDate(filters.createdFrom)}`;
        if (filters.createdTo) return `Đến ${formatDate(filters.createdTo)}`;
    }
    return 'Ngày tạo gói';
}

function DatePickerDropdown({ filters, onChange }) {
    const ref = useRef(null);
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState({
        createdPreset: filters.createdPreset,
        createdFrom: filters.createdFrom,
        createdTo: filters.createdTo,
    });
    const [error, setError] = useState('');

    const isActive =
        filters.createdPreset !== 'all' ||
        Boolean(filters.createdFrom) ||
        Boolean(filters.createdTo);

    useEffect(() => {
        setDraft({
            createdPreset: filters.createdPreset,
            createdFrom: filters.createdFrom,
            createdTo: filters.createdTo,
        });
    }, [filters.createdPreset, filters.createdFrom, filters.createdTo]);

    useEffect(() => {
        if (!open) return undefined;
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
                setError('');
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    const handleSelectPreset = (preset) => {
        setError('');
        if (preset === 'custom') {
            setDraft((p) => ({ ...p, createdPreset: 'custom' }));
            return;
        }
        onChange({ createdPreset: preset, createdFrom: '', createdTo: '' });
        setOpen(false);
    };

    const handleApply = () => {
        const { createdFrom, createdTo } = draft;
        if (createdFrom && createdTo && new Date(createdFrom) > new Date(createdTo)) {
            setError('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
            return;
        }
        setError('');
        onChange({ createdPreset: 'custom', createdFrom, createdTo });
        setOpen(false);
    };

    const handleCancel = () => {
        setOpen(false);
        setError('');
        setDraft({
            createdPreset: filters.createdPreset,
            createdFrom: filters.createdFrom,
            createdTo: filters.createdTo,
        });
    };

    const handleClear = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setError('');
        setDraft({ createdPreset: 'all', createdFrom: '', createdTo: '' });
        onChange({ createdPreset: 'all', createdFrom: '', createdTo: '' });
    };

    return (
        <div className={cx('fieldWrap')} ref={ref}>
            <button
                type="button"
                className={cx('filterButton', 'dateButton', { filterButtonActive: isActive })}
                onClick={() => setOpen((p) => !p)}
                aria-label="Lọc theo ngày tạo gói"
            >
                <MdOutlineCalendarMonth className={cx('dateIcon')} />
                <span className={cx('filterText', { filterTextMuted: !isActive })}>
                    {getLabel(filters)}
                </span>
                <MdKeyboardArrowDown className={cx('arrowIcon')} />
            </button>

            {isActive && (
                <button
                    type="button"
                    className={cx('clearDateButton')}
                    onClick={handleClear}
                    aria-label="Xóa bộ lọc ngày"
                >
                    <MdClose />
                </button>
            )}

            {open && (
                <div className={cx('popover', 'datePopover')}>
                    <div className={cx('popoverHeader')}>
                        <p className={cx('popoverTitle')}>Lọc theo ngày tạo gói</p>
                        <p className={cx('popoverDescription')}>
                            Chọn nhanh hoặc nhập khoảng ngày tùy chỉnh.
                        </p>
                    </div>

                    <div className={cx('presetList')}>
                        {DATE_PRESETS.map((item) => {
                            const isPresetActive =
                                item.value === 'custom'
                                    ? draft.createdPreset === 'custom'
                                    : filters.createdPreset === item.value &&
                                      !filters.createdFrom &&
                                      !filters.createdTo;
                            return (
                                <button
                                    key={item.value}
                                    type="button"
                                    className={cx('presetButton', { presetButtonActive: isPresetActive })}
                                    onClick={() => handleSelectPreset(item.value)}
                                >
                                    {item.label}
                                </button>
                            );
                        })}
                    </div>

                    {draft.createdPreset === 'custom' && (
                        <div className={cx('customDateSection')}>
                            <div className={cx('dateRangeGrid')}>
                                <label className={cx('dateInputGroup')}>
                                    <span>Từ ngày</span>
                                    <input
                                        type="date"
                                        value={draft.createdFrom}
                                        onChange={(e) =>
                                            setDraft((p) => ({ ...p, createdFrom: e.target.value }))
                                        }
                                    />
                                </label>
                                <label className={cx('dateInputGroup')}>
                                    <span>Đến ngày</span>
                                    <input
                                        type="date"
                                        value={draft.createdTo}
                                        onChange={(e) =>
                                            setDraft((p) => ({ ...p, createdTo: e.target.value }))
                                        }
                                    />
                                </label>
                            </div>

                            {error ? (
                                <p className={cx('dateError')}>{error}</p>
                            ) : (
                                <p className={cx('dateHint')}>
                                    Có thể chọn một trong hai mốc ngày hoặc cả hai.
                                </p>
                            )}

                            <div className={cx('popoverActions')}>
                                <button type="button" className={cx('textButton')} onClick={handleCancel}>
                                    Hủy
                                </button>
                                <button type="button" className={cx('applyButton')} onClick={handleApply}>
                                    Áp dụng
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default DatePickerDropdown;
