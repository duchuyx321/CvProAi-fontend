import { useEffect, useState } from "react";
import classNames from "classnames/bind";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-toastify";
import ActionModal from "../ActionModals";
import { config } from "~/config";
import {
  exportAdminUsers,
  getAdminUsers,
  updateAdminUserStatus,
} from "~/services/admin-user.service";
import styles from "./UserTable.module.scss";
import {
  DEFAULT_FILTERS,
  DEFAULT_PLAN_OPTION,
  INITIAL_PAGINATION,
  STATUS_FILTER_OPTIONS,
  USER_TABLE_COLUMNS,
} from "./userTable.constants";
import {
  buildAdminUsersQuery,
  buildPaginationItems,
  downloadBlobFile,
  getErrorMessage,
  getPaginationFromPayload,
  getPlanOptionsFromPayload,
  getResponsePayload,
  getUsersFromPayload,
  normalizeAdminUser,
} from "./userTable.utils";
import UserTablePagination from "./components/UserTablePagination";
import UserTableRow from "./components/UserTableRow";
import UserTableToolbar from "./components/UserTableToolbar";

const cx = classNames.bind(styles);

function UserTable({
  className,
  onViewDetail,
  onAddAccount,
  onUserStatusChange,
  selectedUserId,
  fetchUsersAction = getAdminUsers,
  exportUsersAction = exportAdminUsers,
  updateUserStatusAction = updateAdminUserStatus,
}) {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [users, setUsers] = useState([]);
  const [planOptions, setPlanOptions] = useState([DEFAULT_PLAN_OPTION]);
  const [pagination, setPagination] = useState(INITIAL_PAGINATION);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmpty, setIsEmpty] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState("json");
  const [submittingUserId, setSubmittingUserId] = useState("");
  const [submitErrors, setSubmitErrors] = useState({});
  const [reloadIndex, setReloadIndex] = useState(0);

  useEffect(() => {
    const debounceTimer = window.setTimeout(() => {
      setSearchKeyword(searchInput.trim());
    }, 350);
    return () => {
      window.clearTimeout(debounceTimer);
    };
  }, [searchInput]);

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
            keyword: searchKeyword,
            ...filters,
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
        setPlanOptions(getPlanOptionsFromPayload(payload, normalizedUsers));
        setPagination((previousState) => ({
          ...previousState,
          ...nextPagination,
        }));
        setIsEmpty(normalizedUsers.length === 0);
      } catch (error) {
        if (isCancelled) return;

        setUsers([]);
        setPlanOptions([DEFAULT_PLAN_OPTION]);
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
    pagination.currentPage,
    pagination.pageSize,
    reloadIndex,
    searchKeyword,
    filters.status,     
    filters.plan,      
    filters.registeredAt
  ]);

  const handleSearchChange = (event) => {
    setSearchInput(event.target.value);
    setPagination((previousState) => ({
      ...previousState,
      currentPage: 1,
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((previousState) => ({
      ...previousState,
      [key]: value,
    }));
    setPagination((previousState) => ({
      ...previousState,
      currentPage: 1,
    }));
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchKeyword("");
    setFilters(DEFAULT_FILTERS);
    setPagination((previousState) => ({
      ...previousState,
      currentPage: 1,
    }));
    setReloadIndex((previousState) => previousState + 1);
  };

  const handleRetryFetch = () => {
    setReloadIndex((previousState) => previousState + 1);
  };

  const handleOpenExportModal = () => {
    setIsExportModalOpen(true);
  };

  const handleCloseExportModal = () => {
    if (isExporting) return;
    setIsExportModalOpen(false);
  };

  const handleExportUsers = async (format = exportFormat) => {
    if (isExporting) return;

    setIsExporting(true);

    try {
      const response = await exportUsersAction(
        buildAdminUsersQuery({
          keyword: searchKeyword,
          format,
          ...filters,
        }),
      );

      if (response?.success === false) {
        throw new Error(
          getErrorMessage(response, "Không thể xuất danh sách người dùng"),
        );
      }

      const payload = getResponsePayload(response);
      const blobFile =
        response instanceof Blob
          ? response
          : payload instanceof Blob
            ? payload
            : payload?.file instanceof Blob
              ? payload.file
              : null;

      if (blobFile) {
        downloadBlobFile(blobFile, payload?.fileName);
        toast.success("Xuất danh sách người dùng thành công");
        setIsExportModalOpen(false);
        return;
      }

      const downloadUrl =
        payload?.download_url ||
        payload?.downloadUrl ||
        payload?.file_url ||
        payload?.url;

      if (!downloadUrl) {
        throw new Error("Không nhận được file xuất hợp lệ");
      }

      window.open(downloadUrl, "_blank", "noopener,noreferrer");
      toast.success("Xuất danh sách người dùng thành công");
      setIsExportModalOpen(false);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Không thể xuất danh sách người dùng"),
      );
    } finally {
      setIsExporting(false);
    }
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

  const handleAddAccount = () => {
    if (onAddAccount) {
      onAddAccount();
      return;
    }

    navigate(config.router.manageUsersAdd);
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
  const paginationItems = buildPaginationItems(
    pagination.currentPage,
    pagination.totalPages,
  );

  return (
    <section className={cx("wrapper", className)}>
      <UserTableToolbar
        searchInput={searchInput}
        onSearchChange={handleSearchChange}
        filters={filters}
        planOptions={planOptions}
        statusOptions={STATUS_FILTER_OPTIONS}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
        onOpenExportModal={handleOpenExportModal}
        onAddAccount={handleAddAccount}
        isLoading={isLoading}
      />

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

          <UserTablePagination
            pagination={pagination}
            paginationItems={paginationItems}
            resultStart={resultStart}
            resultEnd={resultEnd}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      <ActionModal
        isOpen={isExportModalOpen}
        isSubmitting={isExporting}
        selectedFormat={exportFormat}
        onFormatChange={setExportFormat}
        onClose={handleCloseExportModal}
        onConfirm={handleExportUsers}
      />
    </section>
  );
}

export default UserTable;
