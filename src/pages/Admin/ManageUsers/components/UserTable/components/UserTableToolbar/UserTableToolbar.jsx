import classNames from "classnames/bind";

import DataToolbar from "~/components/DataToolbar";

import RegistrationDateFilter from "../RegistrationDateFilter";
import styles from "./UserTableToolbar.module.scss";

const cx = classNames.bind(styles);

function UserTableToolbar({
  searchInput,
  onSearchChange,
  filters,
  statusOptions,
  onFilterChange,
  onDateFilterChange,
  onResetFilters,
}) {
  return (
    <DataToolbar
      title="Danh sách người dùng"
      description="Theo dõi tài khoản, lọc danh sách nhanh và chuyển sang màn hình chi tiết khi cần."
      searchId="admin-manage-user-search"
      searchValue={searchInput}
      onSearchChange={onSearchChange}
      searchPlaceholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
      onResetFilters={onResetFilters}
    >
      <label className={cx("filterField")}>
        <span className={cx("filterLabel")}>Trạng thái</span>
        <select
          className={cx("selectField")}
          value={filters.status}
          onChange={(event) => onFilterChange("status", event.target.value)}
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <RegistrationDateFilter value={filters} onChange={onDateFilterChange} />
    </DataToolbar>
  );
}

export default UserTableToolbar;
