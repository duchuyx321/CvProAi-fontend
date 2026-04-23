import classNames from 'classnames/bind';
import { useEffect } from 'react';
import {
    MdClose,
    MdDescription,
    MdDownload,
    MdGridOn,
    MdOutlineCalendarMonth,
    MdPictureAsPdf,
} from 'react-icons/md';
import styles from './ExportModal.module.scss';

const cx = classNames.bind(styles);

const FORMAT_OPTIONS = [
    {
        value: 'json',
        label: 'JSON',
        Icon: MdDescription,
    },
    {
        value: 'excel',
        label: 'Excel',
        Icon: MdGridOn,
    },
    {
        value: 'pdf',
        label: 'PDF',
        Icon: MdPictureAsPdf,
    },
];

function ExportModal({
    value,
    columnOptions = [],
    dateRangeOptions = [],
    onChange,
    onClose,
    onConfirm,
}) {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose]);

    const allColumnValues = columnOptions.map((item) => item.value);
    const allSelected =
        allColumnValues.length > 0 &&
        allColumnValues.every((column) => value.columns.includes(column));

    const handleChangeFormat = (format) => {
        onChange({
            ...value,
            format,
        });
    };

    const handleToggleColumn = (column) => {
        const nextColumns = value.columns.includes(column)
            ? value.columns.filter((item) => item !== column)
            : [...value.columns, column];

        onChange({
            ...value,
            columns: nextColumns,
        });
    };

    const handleToggleAllColumns = () => {
        onChange({
            ...value,
            columns: allSelected ? [] : allColumnValues,
        });
    };

    const handleChangeDateRange = (event) => {
        onChange({
            ...value,
            dateRange: event.target.value,
        });
    };

    const handleConfirm = () => {
        onConfirm(value);
    };

    return (
        <div
            className={cx('overlay')}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div
                className={cx('modal')}
                role="dialog"
                aria-modal="true"
                aria-labelledby="export-modal-title"
            >
                <div className={cx('header')}>
                    <div>
                        <h3 id="export-modal-title" className={cx('title')}>
                            Xuất danh sách gói dịch vụ
                        </h3>
                        <p className={cx('subtitle')}>
                            Chọn định dạng và các trường dữ liệu bạn muốn tải về.
                        </p>
                    </div>

                    <button
                        type="button"
                        className={cx('closeBtn')}
                        onClick={onClose}
                        aria-label="Đóng"
                    >
                        <MdClose />
                    </button>
                </div>

                <div className={cx('body')}>
                    <section className={cx('section')}>
                        <p className={cx('sectionTitle')}>Định dạng tệp</p>

                        <div className={cx('formatGrid')}>
                            {FORMAT_OPTIONS.map(
                                ({ value: optionValue, label, Icon }) => (
                                    <button
                                        key={optionValue}
                                        type="button"
                                        className={cx('formatBtn', {
                                            formatBtnActive:
                                                value.format === optionValue,
                                        })}
                                        onClick={() =>
                                            handleChangeFormat(optionValue)
                                        }
                                    >
                                        <Icon />
                                        <span>{label}</span>
                                    </button>
                                )
                            )}
                        </div>
                    </section>

                    <section className={cx('section')}>
                        <div className={cx('sectionHead')}>
                            <p className={cx('sectionTitle')}>Cột dữ liệu</p>

                            <button
                                type="button"
                                className={cx('linkBtn')}
                                onClick={handleToggleAllColumns}
                            >
                                {allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                            </button>
                        </div>

                        <div className={cx('columnPanel')}>
                            <div className={cx('columnGrid')}>
                                {columnOptions.map((item) => (
                                    <label
                                        key={item.value}
                                        className={cx('checkboxItem')}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={value.columns.includes(
                                                item.value
                                            )}
                                            onChange={() =>
                                                handleToggleColumn(item.value)
                                            }
                                        />
                                        <span>{item.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className={cx('section')}>
                        <p className={cx('sectionTitle')}>
                            Khoảng thời gian tạo
                        </p>

                        <div className={cx('dateSelectWrap')}>
                            <MdOutlineCalendarMonth
                                className={cx('dateSelectIcon')}
                            />

                            <select
                                className={cx('dateSelect')}
                                value={value.dateRange}
                                onChange={handleChangeDateRange}
                            >
                                {dateRangeOptions.map((item) => (
                                    <option
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>
                </div>

                <div className={cx('footer')}>
                    <button
                        type="button"
                        className={cx('btn', 'btnGhost')}
                        onClick={onClose}
                    >
                        Hủy bỏ
                    </button>

                    <button
                        type="button"
                        className={cx('btn', 'btnPrimary')}
                        onClick={handleConfirm}
                        disabled={value.columns.length === 0}
                    >
                        <MdDownload />
                        Xuất dữ liệu ngay
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExportModal;