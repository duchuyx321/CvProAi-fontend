import { useEffect, useId, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import { LoaderCircle, Search } from 'lucide-react';
import { toast } from 'react-toastify';

import Input from '~/components/Input';
import useDebounce from '~/hooks/useDebounce';

import styles from './GenericAdminToolbar.module.scss';

const cx = classNames.bind(styles);
const SEARCH_DEBOUNCE_DELAY = 500;
const CUSTOM_RANGE_TOAST_IDS = {
    missingStart: 'generic-admin-toolbar-missing-start',
    missingEnd: 'generic-admin-toolbar-missing-end',
    invalidOrder: 'generic-admin-toolbar-invalid-order',
};

function validateCustomRange({ from, to }) {
    if (from && !to) {
        return {
            message: 'Vui lòng chọn ngày kết thúc.',
            toastId: CUSTOM_RANGE_TOAST_IDS.missingEnd,
        };
    }

    if (!from && to) {
        return {
            message: 'Vui lòng chọn ngày bắt đầu.',
            toastId: CUSTOM_RANGE_TOAST_IDS.missingStart,
        };
    }

    if (from && to && from > to) {
        return {
            message: 'Ngày bắt đầu không được sau ngày kết thúc.',
            toastId: CUSTOM_RANGE_TOAST_IDS.invalidOrder,
        };
    }

    return {
        message: '',
        toastId: '',
    };
}

function normalizeRangeToPayload({ value, from, to }) {
    // expected: when custom -> { from, to }, else -> value
    if (value === 'custom') {
        return {
            from: from || null,
            to: to || null,
        };
    }

    return value;
}

function GenericAdminToolbar({
    sortOptions = [],
    rangeOptions = [],
    defaultSortBy = null,
    defaultSortOrder = null,
    defaultRange = null,
    onChange,
    searchPlaceholder = 'Tìm kiếm...',
    initialSearch = '',
    searchLoading = false,
}) {
    const toolbarId = useId();
    const [search, setSearch] = useState(initialSearch);
    const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DELAY);

    const [selectedSortKey, setSelectedSortKey] = useState(defaultSortBy);
    const [selectedSortOrder, setSelectedSortOrder] =
        useState(defaultSortOrder);

    const [selectedRangeValue, setSelectedRangeValue] = useState(defaultRange);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const mergedSortOptions = useMemo(() => {
        // Merge by (sort_by, sort_order) unique.
        const map = new Map();
        (sortOptions || []).forEach((opt) => {
            const key = `${opt?.sort_by}__${opt?.sort_order}`;
            if (!map.has(key)) {
                map.set(key, opt);
            }
        });
        return Array.from(map.values());
    }, [sortOptions]);

    const sortChoices = useMemo(() => {
        // present as combined single select option label
        return mergedSortOptions.map((opt) => ({
            key: `${opt.sort_by}__${opt.sort_order}`,
            label: opt.label,
            sort_by: opt.sort_by,
            sort_order: opt.sort_order,
        }));
    }, [mergedSortOptions]);

    const selectedSortChoice = useMemo(() => {
        const currentChoice = sortChoices.find(
            (choice) =>
                choice.sort_by === selectedSortKey &&
                choice.sort_order === selectedSortOrder,
        );

        return currentChoice || sortChoices[0] || null;
    }, [selectedSortKey, selectedSortOrder, sortChoices]);

    const effectiveRangeValue = useMemo(() => {
        const hasSelectedRange = (rangeOptions || []).some(
            (opt) => opt?.value === selectedRangeValue,
        );

        if (hasSelectedRange) return selectedRangeValue;

        return rangeOptions?.[0]?.value ?? null;
    }, [selectedRangeValue, rangeOptions]);

    const showCustomRange = effectiveRangeValue === 'custom';
    const customRangeValidation = useMemo(
        () => validateCustomRange({ from, to }),
        [from, to],
    );
    const customRangeError = showCustomRange
        ? customRangeValidation.message
        : '';
    const isSearchPending = search !== debouncedSearch;
    const showSearchSpinner = searchLoading || isSearchPending;

    useEffect(() => {
        if (!onChange) return;

        if (effectiveRangeValue === 'custom') {
            if (!from || !to || customRangeValidation.message) return;
        }

        const sortPayload = selectedSortChoice
            ? {
                  sort_by: selectedSortChoice.sort_by,
                  sort_order: selectedSortChoice.sort_order,
              }
            : null;

        let rangePayload = null;

        if (effectiveRangeValue) {
            rangePayload = normalizeRangeToPayload({
                value: effectiveRangeValue,
                from,
                to,
            });
        }

        onChange({
            search: debouncedSearch?.trim() || '',
            sort: sortPayload,
            range: rangePayload,
        });
    }, [
        debouncedSearch,
        selectedSortChoice,
        effectiveRangeValue,
        from,
        to,
        customRangeValidation.message,
        onChange,
    ]);

    const notifyCustomRangeError = (validation) => {
        if (!validation.message) return;

        toast.warning(validation.message, {
            toastId: validation.toastId,
        });
    };

    const handleCustomDateChange = (field, value) => {
        const nextFrom = field === 'from' ? value : from;
        const nextTo = field === 'to' ? value : to;
        const validation = validateCustomRange({
            from: nextFrom,
            to: nextTo,
        });

        if (field === 'from') {
            setFrom(value);
        } else {
            setTo(value);
        }

        notifyCustomRangeError(validation);
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('row')}>
                <div className={cx('searchControl')}>
                    <Input
                        id={`${toolbarId}-search`}
                        value={search}
                        onChange={(e) => setSearch(e?.target?.value ?? '')}
                        placeholder={searchPlaceholder}
                        label="Tìm kiếm"
                        leftIcon={<Search aria-hidden="true" />}
                        rightIcon={
                            showSearchSpinner ? (
                                <LoaderCircle
                                    className={cx('searchSpinner')}
                                    aria-label="Đang tìm kiếm"
                                />
                            ) : null
                        }
                    />
                </div>

                <div className={cx('control')}>
                    <label
                        className={cx('controlLabel')}
                        htmlFor={`${toolbarId}-sort`}
                    >
                        Sắp xếp
                    </label>
                    <select
                        id={`${toolbarId}-sort`}
                        className={cx('select')}
                        value={
                            selectedSortChoice
                                ? selectedSortChoice.key
                                : sortChoices[0]?.key || ''
                        }
                        onChange={(e) => {
                            const [sort_by, sort_order] = (
                                e.target.value || ''
                            ).split('__');
                            setSelectedSortKey(sort_by || null);
                            setSelectedSortOrder(sort_order || null);
                        }}
                    >
                        {sortChoices.map((choice) => (
                            <option key={choice.key} value={choice.key}>
                                {choice.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={cx('rangeControl')}>
                    <div className={cx('control')}>
                        <label
                            className={cx('controlLabel')}
                            htmlFor={`${toolbarId}-range`}
                        >
                            Khoảng thời gian
                        </label>
                        <select
                            id={`${toolbarId}-range`}
                            className={cx('select')}
                            value={effectiveRangeValue || ''}
                            onChange={(e) => {
                                const next = e.target.value;
                                setSelectedRangeValue(next);
                                if (next !== 'custom') {
                                    setFrom('');
                                    setTo('');
                                }
                            }}
                        >
                            {(rangeOptions || []).map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {showCustomRange ? (
                        <div className={cx('customRange')}>
                            <div className={cx('dateField')}>
                                <label
                                    className={cx('dateLabel')}
                                    htmlFor={`${toolbarId}-from`}
                                >
                                    Ngày bắt đầu
                                </label>
                                <input
                                    id={`${toolbarId}-from`}
                                    type="date"
                                    className={cx('dateInput')}
                                    value={from}
                                    max={to || undefined}
                                    onChange={(e) =>
                                        handleCustomDateChange(
                                            'from',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className={cx('dateField')}>
                                <label
                                    className={cx('dateLabel')}
                                    htmlFor={`${toolbarId}-to`}
                                >
                                    Ngày kết thúc
                                </label>
                                <input
                                    id={`${toolbarId}-to`}
                                    type="date"
                                    className={cx('dateInput')}
                                    value={to}
                                    min={from || undefined}
                                    onChange={(e) =>
                                        handleCustomDateChange(
                                            'to',
                                            e.target.value,
                                        )
                                    }
                                />
                            </div>
                            {customRangeError ? (
                                <p className={cx('rangeMessage')}>
                                    {customRangeError}
                                </p>
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export default GenericAdminToolbar;
