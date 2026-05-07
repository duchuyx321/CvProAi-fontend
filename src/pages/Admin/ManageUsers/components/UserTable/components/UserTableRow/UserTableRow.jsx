import classNames from "classnames/bind";
import { FiEye, FiLock, FiRefreshCw, FiUnlock } from "react-icons/fi";

import { formatDate } from "~/pages/Admin/ManageUsers/components/UserTable/userTable.utils";
import styles from "./UserTableRow.module.scss";

const cx = classNames.bind(styles);

function UserTableRow({
  user,
  isSubmitting,
  isSelected,
  submitError,
  onViewUser,
  onToggleUserStatus,
}) {
  return (
    <tr
      key={user.id}
      className={cx("tableRow", {
        selected: isSelected,
      })}
    >
      <td data-label="ID" className={cx("monoCell")}>
        #{user.id}
      </td>
      <td data-label="Tên người dùng">
        <div className={cx("userName")}>{user.fullName}</div>
      </td>
      <td data-label="Email" className={cx("contactCell")}>
        {user.email}
      </td>
      <td data-label="Số điện thoại" className={cx("contactCell")}>
        {user.phone}
      </td>
      <td data-label="Gói hiện tại">
        <span className={cx("planBadge")}>{user.planName}</span>
      </td>
      <td data-label="Số CV">{user.cvCount}</td>
      <td data-label="Ngày đăng ký">{formatDate(user.registeredAt)}</td>
      <td data-label="Hành động" className={cx("actionsCell")}>
        <div className={cx("actionButtons")}>
          <button
            type="button"
            className={cx("iconButton")}
            onClick={() => onViewUser(user)}
            aria-label={`Xem chi tiết tài khoản ${user.fullName}`}
          >
            <FiEye />
          </button>

          <button
            type="button"
            className={cx("iconButton", {
              danger: !user.isLocked,
              success: user.isLocked,
            })}
            onClick={() => onToggleUserStatus(user)}
            disabled={isSubmitting}
            aria-label={
              user.isLocked
                ? `Mở khóa tài khoản ${user.fullName}`
                : `Khóa tài khoản ${user.fullName}`
            }
          >
            {isSubmitting ? (
              <FiRefreshCw className={cx("spinning")} />
            ) : user.isLocked ? (
              <FiUnlock />
            ) : (
              <FiLock />
            )}
          </button>
        </div>

        {submitError ? <p className={cx("rowError")}>{submitError}</p> : null}
      </td>
    </tr>
  );
}

export default UserTableRow;
