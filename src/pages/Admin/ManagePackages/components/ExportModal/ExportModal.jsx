import classNames from 'classnames/bind';
import {
    MdDescription,
    MdDownload,
    MdGridOn,
    MdOutlineCalendarMonth,
    MdPictureAsPdf,
} from 'react-icons/md';
import Button from '~/components/Button';
import Modal from '~/components/Modal';
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
    open = false,
    value,
    columnOptions = [],
    dateRangeOptions = [],
    onChange,
    onClose,
    onConfirm,
}) {
    const selectedColumns = value?.columns || [];
    const allColumnValues = columnOptions.map((item) => item.value);

    const allSelected =
        allColumnValues.length > 0 &&
        allColumnValues.every((column) => selectedColumns.includes(column));

    const handleChangeFormat = (format) => {
        onChange?.({
            ...value,
            format,
        });
    };

    const handleToggleColumn = (column) => {
        const nextColumns = selectedColumns.includes(column)
            ? selectedColumns.filter((item) => item !== column)
            : [...selectedColumns, column];

        onChange?.({
            ...value,
            columns: nextColumns,
        });
    };

    const handleToggleAllColumns = () => {
        onChange?.({
            ...value,
            columns: allSelected ? [] : allColumnValues,
        });
    };

    const handleChangeDateRange = (event) => {
        onChange?.({
            ...value,
            dateRange: event.target.value,
        });
    };

    const handleConfirm = () => {
        if (selectedColumns.length === 0) {
            return;
        }

        onConfirm?.(value);
    };

    return (
        <Modal
            isOpen={open}
            onClose={onClose}
            title="Xuất danh sách gói dịch vụ"
            description="Chọn định dạng và các trường dữ liệu bạn muốn tải về."
            size="md"
            footer={
                <>
                    <Button outlineText onClick={onClose}>
                        Hủy bỏ
                    </Button>

                    <Button
                        primary
                        leftIcon={<MdDownload />}
                        onClick={handleConfirm}
                        disabled={selectedColumns.length === 0}
                    >
                        Xuất dữ liệu ngay
                    </Button>
                </>
            }
        >
            <div className={cx('content')}>
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
                                            value?.format === optionValue,
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
                                        checked={selectedColumns.includes(
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
                            value={value?.dateRange || 'all'}
                            onChange={handleChangeDateRange}
                        >
                            {dateRangeOptions.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </section>
            </div>
        </Modal>
    );
}

export default ExportModal;