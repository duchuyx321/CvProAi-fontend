import classNames from 'classnames/bind';
import { MdAdd, MdOutlineFileDownload, MdSearch } from 'react-icons/md';
import Button from '~/components/Button';
import DatePickerDropdown from './DatePickerDropdown';
import StatusDropdown from './StatusDropdown';
import styles from './ActionBar.module.scss';

const cx = classNames.bind(styles);

function ActionBar({
    filters,
    searchValue,
    onChangeFilter,
    onChangeDateFilter,
    onChangeSearch,
    onExport,
    onOpenCreate,
}) {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('toolbar')}>
                <div className={cx('filterGroup')}>
                    <StatusDropdown
                        value={filters.status}
                        onChange={(value) => onChangeFilter('status', value)}
                    />

                    <DatePickerDropdown
                        filters={filters}
                        onChange={onChangeDateFilter}
                    />
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
                    onChange={(e) => onChangeSearch(e.target.value)}
                />
            </label>
        </div>
    );
}

export default ActionBar;
