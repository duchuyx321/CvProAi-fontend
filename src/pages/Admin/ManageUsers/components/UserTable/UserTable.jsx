import { useCallback, useEffect, useState } from "react";
import classNames from "classnames/bind";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";

import GenericAdminToolbar from "~/components/GenericAdminToolbar";
import Pagination from "~/components/Pagination";
import { config } from "~/config";
import {
  getAdminUsers,
  updateAdminUserStatus,
} from "~/services/admin-user.service";

import styles from "./UserTable.module.scss";
import {
  DEFAULT_FILTERS,
  INITIAL_PAGINATION,
  USER_RANGE_OPTIONS,
  USER_SORT_OPTIONS,
  USER_TABLE_COLUMNS,
} from "./userTable.constants";
import {
  buildAdminUsersQuery,
  getErrorMessage,
  getPaginationFromPayload,
  getResponsePayload,
  getUsersFromPayload,
  normalizeAdminUser,
} from "./userTable.utils";
import UserTableRow from "./components/UserTableRow/UserTableRow";

const cx = classNames.bind(styles);

function UserTable({
  className,
  onViewDetail,
  onUserStatusChange,
  selectedUserId,
  fetchUsersAction = getAdminUsers,
  updateUserStatusAction = updateAdminUserStatus,
}) {
  const navigate = useNavigate();
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmpty, setIsEmpty] = useState(false);
  const [submittingUserId, setSubmittingUserId] = useState("");
  const [submitErrors, setSubmitErrors] = useState({});
  const [reloadIndex, setReloadIndex] = useState(0);
  const { from, range, search, sort_by, sort_order, to } = filters;

  useEffect(() => {
    let isCancelled = false;

    const loadUsers = async () => {
      setIsLoading(true);
      setIsError(false);
      setErrorMessage("");

      try {
        const response = await fetchUsersAction(
          buildAdminUsersQuery({
            page: pagination.currentPage,
            limit: pagination.pageSize,
            from,
            range,
            search,
            sort_by,
            sort_order,
            to,
          }),
        );

        if (response?.success === false) {
          throw new Error(
            getErrorMessage(response, "Không thể tải danh sách người dùng"),
          );
        }

        const payload = getResponsePayload(response);
        const normalizedUsers =
          getUsersFromPayload(payload).map(normalizeAdminUser);
        const nextPagination = getPaginationFromPayload(
          payload,
          pagination.pageSize,
        );

        if (isCancelled) return;

        setUsers(normalizedUsers);
        setPagination((previousState) => ({
          ...previousState,
          ...nextPagination,
        }));
        setIsEmpty(normalizedUsers.length === 0);
      } catch (error) {
        if (isCancelled) return;

        setUsers([]);
        setIsEmpty(false);
        setIsError(true);
        setErrorMessage(
          getErrorMessage(error, "Không thể tải danh sách người dùng"),
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadUsers();

    return () => {
      isCancelled = true;
    };
  }, [
    fetchUsersAction,
    from,
    pagination.currentPage,
    pagination.pageSize,
    range,
    reloadIndex,
    search,
    sort_by,
    sort_order,
    to,
  ]);

  const handleToolbarChange = useCallback(({ search, sort, range }) => {
    setFilters((previousState) => {
      const nextFilters = {
        ...previousState,
        search: search || "",
        sort_by: sort?.sort_by || DEFAULT_FILTERS.sort_by,
        sort_order: sort?.sort_order || DEFAULT_FILTERS.sort_order,
        range: "all",
        from: "",
        to: "",
      };

      if (typeof range === "string") {
        nextFilters.range = range;
      } else if (range) {
        nextFilters.range = "custom";
        nextFilters.from = range?.from || "";
        nextFilters.to = range?.to || "";
      }

      return nextFilters;
    });

    setPagination((previousState) => ({
      ...previousState,
      currentPage: 1,
    }));
  }, []);

  const handleRetryFetch = () => {
    setReloadIndex((previousState) => previousState + 1);
  };

  const handleToggleUserStatus = async (user) => {
    if (!user?.id || submittingUserId === user.id) {
      return;
    }

    const shouldLock = !user.isLocked;

    setSubmittingUserId(user.id);
    setSubmitErrors((previousState) => {
      const nextState = { ...previousState };
      delete nextState[user.id];
      return nextState;
    });

    try {
      const response = await updateUserStatusAction(user.id, {
        action: shouldLock ? "lock" : "unlock",
      });

      if (response?.success === false) {
        throw new Error(
          getErrorMessage(
            response,
            shouldLock
              ? "Không thể khóa tài khoản"
              : "Không thể mở khóa tài khoản",
          ),
        );
      }

      const payload = getResponsePayload(response);
      const updatedUser = normalizeAdminUser({
        ...user.raw,
        ...payload,
        is_locked: shouldLock,
        isLocked: shouldLock,
        is_banned: shouldLock,
        isBanned: shouldLock,
        status: shouldLock ? "BANNED" : "ACTIVE",
        account_status: shouldLock ? "BANNED" : "ACTIVE",
        accountStatus: shouldLock ? "BANNED" : "ACTIVE",
        is_online:
          payload?.is_online ??
          payload?.isOnline ??
          (shouldLock ? false : user.isOnline),
      });

      setUsers((previousUsers) =>
        previousUsers.map((currentUser) =>
          currentUser.id === user.id ? updatedUser : currentUser,
        ),
      );

      onUserStatusChange?.(updatedUser);
      toast.success(
        shouldLock
          ? "Đã khóa tài khoản người dùng"
          : "Đã mở khóa tài khoản người dùng",
      );
    } catch (error) {
      const message = getErrorMessage(
        error,
        shouldLock
          ? "Không thể khóa tài khoản người dùng"
          : "Không thể mở khóa tài khoản người dùng",
      );

      setSubmitErrors((previousState) => ({
        ...previousState,
        [user.id]: message,
      }));
      toast.error(message);
    } finally {
      setSubmittingUserId("");
    }
  };

  const handleViewUser = (user) => {
    if (onViewDetail) {
      onViewDetail(user);
      return;
    }

    navigate(config.router.manageUsersDetail.replace(":userId", user.id), {
      state: { user },
    });
  };

  const handlePageChange = (nextPage) => {
    setPagination((previousState) => ({
      ...previousState,
      currentPage: nextPage,
    }));
  };

  const resultStart =
    pagination.totalItems === 0
      ? 0
      : (pagination.currentPage - 1) * pagination.pageSize + 1;
  const resultEnd = Math.min(
    pagination.currentPage * pagination.pageSize,
    pagination.totalItems,
  );

  return (
    <section className={cx("wrapper", className)}>
      <header className={cx("pageHeader")}>
        <div className={cx("pageHeaderContent")}>
          <span className={cx("pageEyebrow")}>Quản trị người dùng</span>
          <h2 className={cx("pageTitle")}>Danh sách người dùng</h2>
          <p className={cx("pageDescription")}>
            Theo dõi tài khoản, lọc nhanh theo thời gian và khóa hoặc mở khóa
            trực tiếp ngay trên bảng.
          </p>
        </div>

        <div className={cx("pageStats")}>
          <span className={cx("pageStatsLabel")}>Tổng người dùng</span>
          <strong className={cx("pageStatsValue")}>
            {pagination.totalItems}
          </strong>
          <span className={cx("pageStatsCaption")}>
            {isLoading
              ? "Đang cập nhật dữ liệu..."
              : `Trang ${pagination.currentPage}/${pagination.totalPages}`}
          </span>
        </div>
      </header>

      <div className={cx("toolbarStack")}>
        <GenericAdminToolbar
          sortOptions={USER_SORT_OPTIONS}
          rangeOptions={USER_RANGE_OPTIONS}
          defaultSortBy={DEFAULT_FILTERS.sort_by}
          defaultSortOrder={DEFAULT_FILTERS.sort_order}
          defaultRange={DEFAULT_FILTERS.range}
          onChange={handleToolbarChange}
          searchPlaceholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
          searchLoading={isLoading && Boolean(search)}
        />
      </div>

      {isError ? (
        <div className={cx("stateCard", "errorState")}>
          <div className={cx("stateIcon")}>
            <FiAlertCircle />
          </div>

          <div className={cx("stateContent")}>
            <h3>Không thể tải danh sách người dùng</h3>
            <p>{errorMessage}</p>
          </div>

          <button
            type="button"
            className={cx("stateButton")}
            onClick={handleRetryFetch}
          >
            <FiRefreshCw />
            <span>Thử lại</span>
          </button>
        </div>
      ) : (
        <div className={cx("tableCard")}>
          <div className={cx("tableWrapper")}>
            <table className={cx("table")}>
              <thead>
                <tr>
                  {USER_TABLE_COLUMNS.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={USER_TABLE_COLUMNS.length}
                      className={cx("stateCell")}
                    >
                      <div className={cx("stateInline")}>
                        Đang tải danh sách người dùng...
                      </div>
                    </td>
                  </tr>
                ) : null}

                {!isLoading && isEmpty ? (
                  <tr>
                    <td
                      colSpan={USER_TABLE_COLUMNS.length}
                      className={cx("stateCell")}
                    >
                      <div className={cx("stateInline")}>
                        Không tìm thấy người dùng phù hợp với bộ lọc hiện tại.
                      </div>
                    </td>
                  </tr>
                ) : null}

                {!isLoading && !isEmpty
                  ? users.map((user) => (
                      <UserTableRow
                        key={user.id}
                        user={user}
                        isSubmitting={submittingUserId === user.id}
                        isSelected={selectedUserId === user.id}
                        submitError={submitErrors[user.id]}
                        onViewUser={handleViewUser}
                        onToggleUserStatus={handleToggleUserStatus}
                      />
                    ))
                  : null}
              </tbody>
            </table>
          </div>

          <div className={cx("footer")}>
            <p className={cx("summary")}>
              Hiển thị {resultStart} đến {resultEnd} trong tổng số{" "}
              <strong>{pagination.totalItems}</strong> người dùng
            </p>

            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              disabled={isLoading}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      )}
    </section>
  );
}

export default UserTable;
