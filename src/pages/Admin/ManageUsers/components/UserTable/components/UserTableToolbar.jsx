import classNames from 'classnames/bind';
import { FiDownload, FiSearch, FiUserPlus } from 'react-icons/fi';

import Input from '~/components/Input';

import styles from '../UserTable.module.scss';

const cx = classNames.bind(styles);

function UserTableToolbar({
    searchInput,
    onSearchChange,
    filters,
    planOptions,
    statusOptions,
    onFilterChange,
    onResetFilters,
    onOpenExportModal,
    onAddAccount,
    isLoading,
}) {
    return (
        <>
            <div className={cx('header')}>
                <div>
                    <h2 className={cx('title')}>Danh sách người dùng</h2>
                    <p className={cx('description')}>
                        Theo dõi tài khoản, lọc theo trạng thái vận hành và hỗ
                        trợ Admin chuyển sang màn hình chi tiết khi cần.
                    </p>
                </div>

                <div className={cx('headerActions')}>
                    <button
                        type="button"
                        className={cx('secondaryButton')}
                        onClick={onOpenExportModal}
                        disabled={isLoading}
                    >
                        <FiDownload />
                        <span>Xuất danh sách</span>
                    </button>

                    <button
                        type="button"
                        className={cx('exportButton')}
                        onClick={onAddAccount}
                    >
                        <FiUserPlus />
                        <span>Thêm tài khoản</span>
                    </button>
                </div>
            </div>

            <div className={cx('toolbar')}>
                <div className={cx('searchBox')}>
                    <Input
                        id="admin-manage-user-search"
                        value={searchInput}
                        onChange={onSearchChange}
                        placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                        leftIcon={<FiSearch />}
                    />
                </div>

                <div className={cx('filters')}>
                    <label className={cx('filterField')}>
                        <span className={cx('filterLabel')}>Trạng thái</span>
                        <select
                            className={cx('selectField')}
                            value={filters.status}
                            onChange={(event) =>
                                onFilterChange('status', event.target.value)
                            }
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className={cx('filterField')}>
                        <span className={cx('filterLabel')}>Gói dịch vụ</span>
                        <select
                            className={cx('selectField')}
                            value={filters.plan}
                            onChange={(event) =>
                                onFilterChange('plan', event.target.value)
                            }
                        >
                            {planOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className={cx('filterField')}>
                        <span className={cx('filterLabel')}>Ngày đăng ký</span>
                        <input
                            type="date"
                            className={cx('dateField')}
                            value={filters.registeredAt}
                            onChange={(event) =>
                                onFilterChange(
                                    'registeredAt',
                                    event.target.value,
                                )
                            }
                        />
                    </label>

                    <button
                        type="button"
                        className={cx('resetButton')}
                        onClick={onResetFilters}
                    >
                        Xóa lọc
                    </button>
                </div>
            </div>
        </>
    );
}

export default UserTableToolbar;
