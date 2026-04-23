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
import styles from './ActionBar.module.scss';

const cx = classNames.bind(styles);

const STATUS_OPTIONS = [
    { value: 'ALL', label: 'Trạng thái: Tất cả' },
    { value: 'ACTIVE', label: 'Trạng thái: Hoạt động' },
    { value: 'PAUSED', label: 'Trạng thái: Tạm ngưng' },
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
            <div className={cx('topRow')}>
                <div className={cx('filters')}>
                    <div className={cx('statusFieldWrap')} ref={statusPopoverRef}>
                        <button
                            type="button"
                            className={cx('statusField', {
                                statusFieldActive: filters.status !== 'ALL',
                            })}
                            onClick={() =>
                                setIsStatusPopoverOpen(
                                    (previousState) => !previousState
                                )
                            }
                            aria-label="Lọc theo trạng thái"
                        >
                            <span className={cx('statusLabel')}>
                                {activeStatusOption.label}
                            </span>
                            <MdKeyboardArrowDown className={cx('statusArrow')} />
                        </button>

                        {isStatusPopoverOpen ? (
                            <div className={cx('statusPopover')}>
                                <div className={cx('statusOptionList')}>
                                    {STATUS_OPTIONS.map((item) => {
                                        const isActive =
                                            item.value === filters.status;

                                        return (
                                            <button
                                                key={item.value}
                                                type="button"
                                                className={cx('statusOption', {
                                                    statusOptionActive: isActive,
                                                })}
                                                onClick={() =>
                                                    handleSelectStatus(item.value)
                                                }
                                            >
                                                <span className={cx('statusOptionText')}>
                                                    {item.label}
                                                </span>

                                                {isActive ? (
                                                    <MdCheck
                                                        className={cx(
                                                            'statusOptionIcon'
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

                    <div className={cx('dateFieldWrap')} ref={datePopoverRef}>
                        <button
                            type="button"
                            className={cx('dateField', {
                                dateFieldActive: hasActiveDateFilter,
                            })}
                            onClick={() =>
                                setIsDatePopoverOpen(
                                    (previousState) => !previousState
                                )
                            }
                            aria-label="Lọc theo ngày tạo gói"
                        >
                            <MdOutlineCalendarMonth className={cx('dateIcon')} />

                            <span
                                className={cx('dateLabel', {
                                    dateLabelPlaceholder: !hasActiveDateFilter,
                                })}
                            >
                                {getDateFilterLabel(filters)}
                            </span>

                            <MdKeyboardArrowDown className={cx('dateArrow')} />
                        </button>

                        {hasActiveDateFilter ? (
                            <button
                                type="button"
                                className={cx('clearDateBtn')}
                                onClick={handleClearDateFilter}
                                aria-label="Xóa bộ lọc ngày tạo gói"
                            >
                                <MdClose />
                            </button>
                        ) : null}

                        {isDatePopoverOpen ? (
                            <div className={cx('datePopover')}>
                                <div className={cx('popoverSection')}>
                                    <p className={cx('popoverTitle')}>
                                        Lọc theo ngày tạo gói
                                    </p>

                                    <div className={cx('presetList')}>
                                        <button
                                            type="button"
                                            className={cx('presetBtn', {
                                                presetBtnActive:
                                                    filters.createdPreset ===
                                                        'all' &&
                                                    !filters.createdFrom &&
                                                    !filters.createdTo,
                                            })}
                                            onClick={() => handleSelectPreset('all')}
                                        >
                                            Tất cả
                                        </button>

                                        <button
                                            type="button"
                                            className={cx('presetBtn', {
                                                presetBtnActive:
                                                    filters.createdPreset ===
                                                    '7days',
                                            })}
                                            onClick={() =>
                                                handleSelectPreset('7days')
                                            }
                                        >
                                            7 ngày gần đây
                                        </button>

                                        <button
                                            type="button"
                                            className={cx('presetBtn', {
                                                presetBtnActive:
                                                    filters.createdPreset ===
                                                    '30days',
                                            })}
                                            onClick={() =>
                                                handleSelectPreset('30days')
                                            }
                                        >
                                            30 ngày gần đây
                                        </button>

                                        <button
                                            type="button"
                                            className={cx('presetBtn', {
                                                presetBtnActive:
                                                    draftDateFilter.createdPreset ===
                                                    'custom',
                                            })}
                                            onClick={() =>
                                                handleSelectPreset('custom')
                                            }
                                        >
                                            Tùy chọn
                                        </button>
                                    </div>
                                </div>

                                {draftDateFilter.createdPreset === 'custom' ? (
                                    <div className={cx('customDateSection')}>
                                        <div className={cx('dateRangeGrid')}>
                                            <label className={cx('dateInputGroup')}>
                                                <span
                                                    className={cx(
                                                        'dateInputLabel'
                                                    )}
                                                >
                                                    Từ ngày
                                                </span>
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
                                                    className={cx('dateInput')}
                                                />
                                            </label>

                                            <label className={cx('dateInputGroup')}>
                                                <span
                                                    className={cx(
                                                        'dateInputLabel'
                                                    )}
                                                >
                                                    Đến ngày
                                                </span>
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
                                                    className={cx('dateInput')}
                                                />
                                            </label>
                                        </div>

                                        {dateError ? (
                                            <p className={cx('dateError')}>
                                                {dateError}
                                            </p>
                                        ) : (
                                            <p className={cx('dateHint')}>
                                                Chọn khoảng thời gian tạo gói từ
                                                ngày này đến ngày này.
                                            </p>
                                        )}

                                        <div className={cx('popoverActions')}>
                                            <button
                                                type="button"
                                                className={cx('textBtn')}
                                                onClick={() => {
                                                    setIsDatePopoverOpen(false);
                                                    setDateError('');
                                                    setDraftDateFilter({
                                                        createdPreset:
                                                            filters.createdPreset,
                                                        createdFrom:
                                                            filters.createdFrom,
                                                        createdTo:
                                                            filters.createdTo,
                                                    });
                                                }}
                                            >
                                                Hủy
                                            </button>

                                            <button
                                                type="button"
                                                className={cx('applyBtn')}
                                                onClick={
                                                    handleApplyCustomRange
                                                }
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

                <div className={cx('actions')}>
                    <button
                        type="button"
                        className={cx('btn', 'btnGhost')}
                        onClick={onExport}
                    >
                        <MdOutlineFileDownload />
                        Xuất danh sách
                    </button>

                    <button
                        type="button"
                        className={cx('btn', 'btnPrimary')}
                        onClick={onOpenCreate}
                    >
                        <MdAdd />
                        Thêm gói dịch vụ
                    </button>
                </div>
            </div>

            <label className={cx('searchBox')}>
                <MdSearch />
                <input
                    type="text"
                    placeholder="Tìm kiếm gói dịch vụ..."
                    value={searchValue}
                    onChange={(event) => onChangeSearch(event.target.value)}
                />
            </label>
        </div>
    );
}

export default ActionBar;