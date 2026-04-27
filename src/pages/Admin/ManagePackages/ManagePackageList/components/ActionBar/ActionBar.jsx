import classNames from 'classnames/bind';
import { useEffect, useRef, useState } from 'react';
import {
    MdAdd,
    MdCheck,
    MdClose,
    MdKeyboardArrowDown,
    MdOutlineCalendarMonth,
    MdOutlineFileDownload,
    MdSearch,
} from 'react-icons/md';
import Button from '~/components/Button';
import styles from './ActionBar.module.scss';

const cx = classNames.bind(styles);

const STATUS_OPTIONS = [
    { value: 'ALL', label: 'Tất cả trạng thái' },
    { value: 'ACTIVE', label: 'Đang hoạt động' },
    { value: 'PAUSED', label: 'Tạm ngưng' },
];

const DATE_PRESET_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: '7days', label: '7 ngày gần đây' },
    { value: '30days', label: '30 ngày gần đây' },
    { value: 'custom', label: 'Tùy chọn' },
];

function formatDisplayDate(value) {
    if (!value) {
        return '';
    }

    const [year, month, day] = String(value).split('-');

    if (!year || !month || !day) {
        return '';
    }

    return `${day}/${month}/${year}`;
}

function getDateFilterLabel(filters) {
    if (filters.createdPreset === '7days') {
        return '7 ngày gần đây';
    }

    if (filters.createdPreset === '30days') {
        return '30 ngày gần đây';
    }

    if (filters.createdPreset === 'custom') {
        if (filters.createdFrom && filters.createdTo) {
            return `${formatDisplayDate(filters.createdFrom)} - ${formatDisplayDate(
                filters.createdTo
            )}`;
        }

        if (filters.createdFrom) {
            return `Từ ${formatDisplayDate(filters.createdFrom)}`;
        }

        if (filters.createdTo) {
            return `Đến ${formatDisplayDate(filters.createdTo)}`;
        }
    }

    return 'Ngày tạo gói';
}

function ActionBar({
    filters,
    searchValue,
    onChangeFilter,
    onChangeDateFilter,
    onChangeSearch,
    onExport,
    onOpenCreate,
}) {
    const datePopoverRef = useRef(null);
    const statusPopoverRef = useRef(null);

    const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
    const [isStatusPopoverOpen, setIsStatusPopoverOpen] = useState(false);
    const [draftDateFilter, setDraftDateFilter] = useState({
        createdPreset: filters.createdPreset,
        createdFrom: filters.createdFrom,
        createdTo: filters.createdTo,
    });
    const [dateError, setDateError] = useState('');

    const hasActiveDateFilter =
        filters.createdPreset !== 'all' ||
        Boolean(filters.createdFrom) ||
        Boolean(filters.createdTo);

    const activeStatusOption =
        STATUS_OPTIONS.find((item) => item.value === filters.status) ||
        STATUS_OPTIONS[0];

    useEffect(() => {
        setDraftDateFilter({
            createdPreset: filters.createdPreset,
            createdFrom: filters.createdFrom,
            createdTo: filters.createdTo,
        });
    }, [filters.createdPreset, filters.createdFrom, filters.createdTo]);

    useEffect(() => {
        if (!isDatePopoverOpen && !isStatusPopoverOpen) {
            return undefined;
        }

        const handleClickOutside = (event) => {
            if (
                datePopoverRef.current &&
                !datePopoverRef.current.contains(event.target)
            ) {
                setIsDatePopoverOpen(false);
                setDateError('');
            }

            if (
                statusPopoverRef.current &&
                !statusPopoverRef.current.contains(event.target)
            ) {
                setIsStatusPopoverOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isDatePopoverOpen, isStatusPopoverOpen]);

    const handleToggleStatusPopover = () => {
        setIsStatusPopoverOpen((previousState) => !previousState);
        setIsDatePopoverOpen(false);
    };

    const handleToggleDatePopover = () => {
        setIsDatePopoverOpen((previousState) => !previousState);
        setIsStatusPopoverOpen(false);
    };

    const handleSelectPreset = (preset) => {
        setDateError('');

        if (preset === 'custom') {
            setDraftDateFilter((previousState) => ({
                ...previousState,
                createdPreset: 'custom',
            }));
            return;
        }

        onChangeDateFilter({
            createdPreset: preset,
            createdFrom: '',
            createdTo: '',
        });

        setIsDatePopoverOpen(false);
    };

    const handleApplyCustomRange = () => {
        const { createdFrom, createdTo } = draftDateFilter;

        if (
            createdFrom &&
            createdTo &&
            new Date(createdFrom).getTime() > new Date(createdTo).getTime()
        ) {
            setDateError('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
            return;
        }

        setDateError('');

        onChangeDateFilter({
            createdPreset: 'custom',
            createdFrom,
            createdTo,
        });

        setIsDatePopoverOpen(false);
    };

    const handleCancelCustomRange = () => {
        setIsDatePopoverOpen(false);
        setDateError('');
        setDraftDateFilter({
            createdPreset: filters.createdPreset,
            createdFrom: filters.createdFrom,
            createdTo: filters.createdTo,
        });
    };

    const handleClearDateFilter = (event) => {
        event.preventDefault();
        event.stopPropagation();

        setDateError('');
        setDraftDateFilter({
            createdPreset: 'all',
            createdFrom: '',
            createdTo: '',
        });

        onChangeDateFilter({
            createdPreset: 'all',
            createdFrom: '',
            createdTo: '',
        });
    };

    const handleSelectStatus = (value) => {
        onChangeFilter('status', value);
        setIsStatusPopoverOpen(false);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('toolbar')}>
                <div className={cx('filterGroup')}>
                    <div className={cx('fieldWrap')} ref={statusPopoverRef}>
                        <button
                            type="button"
                            className={cx('filterButton', {
                                filterButtonActive: filters.status !== 'ALL',
                            })}
                            onClick={handleToggleStatusPopover}
                            aria-label="Lọc theo trạng thái"
                        >
                            <span className={cx('filterText')}>
                                {activeStatusOption.label}
                            </span>
                            <MdKeyboardArrowDown className={cx('arrowIcon')} />
                        </button>

                        {isStatusPopoverOpen ? (
                            <div className={cx('popover', 'statusPopover')}>
                                <div className={cx('optionList')}>
                                    {STATUS_OPTIONS.map((item) => {
                                        const isActive =
                                            item.value === filters.status;

                                        return (
                                            <button
                                                key={item.value}
                                                type="button"
                                                className={cx('optionItem', {
                                                    optionItemActive: isActive,
                                                })}
                                                onClick={() =>
                                                    handleSelectStatus(item.value)
                                                }
                                            >
                                                <span>{item.label}</span>

                                                {isActive ? (
                                                    <MdCheck
                                                        className={cx(
                                                            'optionIcon'
                                                        )}
                                                    />
                                                ) : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null}
                    </div>

                    <div className={cx('fieldWrap')} ref={datePopoverRef}>
                        <button
                            type="button"
                            className={cx('filterButton', 'dateButton', {
                                filterButtonActive: hasActiveDateFilter,
                            })}
                            onClick={handleToggleDatePopover}
                            aria-label="Lọc theo ngày tạo gói"
                        >
                            <MdOutlineCalendarMonth className={cx('dateIcon')} />

                            <span
                                className={cx('filterText', {
                                    filterTextMuted: !hasActiveDateFilter,
                                })}
                            >
                                {getDateFilterLabel(filters)}
                            </span>

                            <MdKeyboardArrowDown className={cx('arrowIcon')} />
                        </button>

                        {hasActiveDateFilter ? (
                            <button
                                type="button"
                                className={cx('clearDateButton')}
                                onClick={handleClearDateFilter}
                                aria-label="Xóa bộ lọc ngày tạo gói"
                            >
                                <MdClose />
                            </button>
                        ) : null}

                        {isDatePopoverOpen ? (
                            <div className={cx('popover', 'datePopover')}>
                                <div className={cx('popoverHeader')}>
                                    <p className={cx('popoverTitle')}>
                                        Lọc theo ngày tạo gói
                                    </p>
                                    <p className={cx('popoverDescription')}>
                                        Chọn nhanh hoặc nhập khoảng ngày tùy chỉnh.
                                    </p>
                                </div>

                                <div className={cx('presetList')}>
                                    {DATE_PRESET_OPTIONS.map((item) => {
                                        const isActive =
                                            item.value === 'custom'
                                                ? draftDateFilter.createdPreset ===
                                                  'custom'
                                                : filters.createdPreset ===
                                                      item.value &&
                                                  !filters.createdFrom &&
                                                  !filters.createdTo;

                                        return (
                                            <button
                                                key={item.value}
                                                type="button"
                                                className={cx('presetButton', {
                                                    presetButtonActive: isActive,
                                                })}
                                                onClick={() =>
                                                    handleSelectPreset(item.value)
                                                }
                                            >
                                                {item.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {draftDateFilter.createdPreset === 'custom' ? (
                                    <div className={cx('customDateSection')}>
                                        <div className={cx('dateRangeGrid')}>
                                            <label
                                                className={cx('dateInputGroup')}
                                            >
                                                <span>Từ ngày</span>
                                                <input
                                                    type="date"
                                                    value={
                                                        draftDateFilter.createdFrom
                                                    }
                                                    onChange={(event) =>
                                                        setDraftDateFilter(
                                                            (
                                                                previousState
                                                            ) => ({
                                                                ...previousState,
                                                                createdFrom:
                                                                    event.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                />
                                            </label>

                                            <label
                                                className={cx('dateInputGroup')}
                                            >
                                                <span>Đến ngày</span>
                                                <input
                                                    type="date"
                                                    value={
                                                        draftDateFilter.createdTo
                                                    }
                                                    onChange={(event) =>
                                                        setDraftDateFilter(
                                                            (
                                                                previousState
                                                            ) => ({
                                                                ...previousState,
                                                                createdTo:
                                                                    event.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                />
                                            </label>
                                        </div>

                                        {dateError ? (
                                            <p className={cx('dateError')}>
                                                {dateError}
                                            </p>
                                        ) : (
                                            <p className={cx('dateHint')}>
                                                Có thể chọn một trong hai mốc ngày
                                                hoặc cả hai.
                                            </p>
                                        )}

                                        <div className={cx('popoverActions')}>
                                            <button
                                                type="button"
                                                className={cx('textButton')}
                                                onClick={handleCancelCustomRange}
                                            >
                                                Hủy
                                            </button>

                                            <button
                                                type="button"
                                                className={cx('applyButton')}
                                                onClick={handleApplyCustomRange}
                                            >
                                                Áp dụng
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className={cx('actionGroup')}>
                    <Button
                        outlineText
                        className={cx('actionButton')}
                        leftIcon={<MdOutlineFileDownload />}
                        onClick={onExport}
                    >
                        Xuất danh sách
                    </Button>

                    <Button
                        primary
                        className={cx('actionButton')}
                        leftIcon={<MdAdd />}
                        onClick={onOpenCreate}
                    >
                        Thêm gói dịch vụ
                    </Button>
                </div>
            </div>

            <label className={cx('searchBox')}>
                <MdSearch />
                <input
                    type="text"
                    placeholder="Tìm kiếm theo mã hoặc tên gói..."
                    value={searchValue}
                    onChange={(event) => onChangeSearch(event.target.value)}
                />
            </label>
        </div>
    );
}

export default ActionBar;