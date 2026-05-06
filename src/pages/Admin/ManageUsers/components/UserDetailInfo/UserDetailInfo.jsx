import { useEffect, useMemo, useState } from "react";
import classNames from "classnames/bind";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  FiActivity,
  FiCalendar,
  FiCheckCircle,
  FiCpu,
  FiCreditCard,
  FiDownload,
  FiFileText,
  FiLock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiShield,
  FiUnlock,
  FiUser,
} from "react-icons/fi";
import { toast } from "react-toastify";

import { config } from "~/config";
import {
  getAdminUserDetail,
  updateAdminUserStatus,
} from "~/services/admin-user.service";

import styles from "./UserDetailInfo.module.scss";
import {
  buildFallbackUserDetail,
  formatCurrency,
  formatDate,
  formatDateTime,
  getQuotaText,
  getUserDetailErrorMessage,
  normalizeAdminUserDetail,
} from "./userDetail.utils";

const cx = classNames.bind(styles);

const buildInitialLetters = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item[0]?.toUpperCase())
    .join("");
};

function UserDetailInfo({
  user,
  onBack,
  onUserStatusChange,
  fetchUserDetailAction = getAdminUserDetail,
  updateUserStatusAction = updateAdminUserStatus,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId } = useParams();
  const selectedUser = user || location.state?.user || null;
  const fallbackDetail = useMemo(
    () => buildFallbackUserDetail(selectedUser),
    [selectedUser],
  );
  const [detail, setDetail] = useState(fallbackDetail);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmpty, setIsEmpty] = useState(false);
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);
  const [statusActionError, setStatusActionError] = useState("");

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate(config.router.manageUsers);
  };

  useEffect(() => {
    let isCancelled = false;

    const loadUserDetail = async () => {
      if (!userId) {
        setIsLoading(false);
        setIsEmpty(true);
        return;
      }

      setIsLoading(true);
      setIsError(false);
      setErrorMessage("");
      setIsEmpty(false);

      try {
        const response = await fetchUserDetailAction(userId);

        if (response?.success === false) {
          throw new Error(
            getUserDetailErrorMessage(
              response,
              "Không thể tải chi tiết người dùng",
            ),
          );
        }

        const payload = response?.data || response;

        if (
          !payload ||
          (typeof payload === "object" && !Object.keys(payload).length)
        ) {
          if (!isCancelled) {
            setIsEmpty(true);
            setDetail(null);
          }
          return;
        }

        if (!isCancelled) {
          setDetail(normalizeAdminUserDetail(payload, selectedUser));
        }
      } catch (error) {
        if (isCancelled) return;

        setIsError(true);
        setErrorMessage(
          getUserDetailErrorMessage(error, "Không thể tải chi tiết người dùng"),
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadUserDetail();

    return () => {
      isCancelled = true;
    };
  }, [fetchUserDetailAction, selectedUser, userId]);

  const handleToggleStatus = async () => {
    if (!detail?.id || isSubmittingStatus) return;

    const shouldLock = !detail.isLocked;

    setIsSubmittingStatus(true);
    setStatusActionError("");

    try {
      const response = await updateUserStatusAction(detail.id, {
        action: shouldLock ? "lock" : "unlock",
      });

      if (response?.success === false) {
        throw new Error(
          getUserDetailErrorMessage(
            response,
            shouldLock
              ? "Không thể khóa tài khoản"
              : "Không thể mở khóa tài khoản",
          ),
        );
      }

      const payload = response?.data || response;
      const updatedDetail = normalizeAdminUserDetail(
        {
          ...detail.raw,
          ...(payload || {}),
          is_locked: shouldLock,
          is_online:
            payload?.is_online ??
            payload?.isOnline ??
            (shouldLock ? false : detail.isOnline),
          audit_logs: [
            {
              action: shouldLock ? "Khóa tài khoản" : "Mở khóa tài khoản",
              actor_name: "Admin",
              description: shouldLock
                ? "Khóa tài khoản từ màn hình chi tiết"
                : "Mở khóa tài khoản từ màn hình chi tiết",
              created_at: new Date().toISOString(),
            },
          ].concat(detail.auditLogs || []),
        },
        detail,
      );

      setDetail(updatedDetail);

      if (onUserStatusChange) {
        onUserStatusChange(updatedDetail);
      }

      toast.success(
        shouldLock
          ? "Đã khóa tài khoản người dùng"
          : "Đã mở khóa tài khoản người dùng",
      );
    } catch (error) {
      const message = getUserDetailErrorMessage(
        error,
        "Không thể cập nhật trạng thái tài khoản",
      );

      setStatusActionError(message);
      toast.error(message);
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  if (isLoading && !detail) {
    return (
      <section className={cx("stateScreen")}>
        <p>Đang tải chi tiết người dùng...</p>
      </section>
    );
  }

  if (isError && !detail) {
    return (
      <section className={cx("stateScreen", "error")}>
        <h3>Không thể tải chi tiết người dùng</h3>
        <p>{errorMessage}</p>
        <button
          type="button"
          className={cx("retryButton")}
          onClick={handleBack}
        >
          Quay lại danh sách
        </button>
      </section>
    );
  }

  if (isEmpty || !detail) {
    return (
      <section className={cx("stateScreen")}>
        <h3>Không có dữ liệu người dùng</h3>
        <p>Không tìm thấy hồ sơ phù hợp để hiển thị chi tiết.</p>
        <button
          type="button"
          className={cx("retryButton")}
          onClick={handleBack}
        >
          Quay lại danh sách
        </button>
      </section>
    );
  }

  const aiQuotaPercent = detail.quotas.aiLimit
    ? Math.min(
        Math.round((detail.quotas.aiUsed / detail.quotas.aiLimit) * 100),
        100,
      )
    : 0;
  const exportQuotaPercent = detail.quotas.exportLimit
    ? Math.min(
        Math.round(
          (detail.quotas.exportUsed / detail.quotas.exportLimit) * 100,
        ),
        100,
      )
    : 0;

  return (
    <section className={cx("wrapper")}>
      <div className={cx("topbar")}>
        <div className={cx("breadcrumbs")}>
          <span className={cx("brand")}>CvProAI</span>
          <span className={cx("separator")}>›</span>
          <span className={cx("muted")}>Người dùng</span>
          <span className={cx("separator")}>›</span>
          <span className={cx("active")}>Chi tiết người dùng</span>
        </div>
      </div>

      {isError ? (
        <div className={cx("warningBanner")}>
          <FiActivity />
          <span>{errorMessage}</span>
        </div>
      ) : null}

      <div className={cx("hero")}>
        <h1 className={cx("heroTitle")}>Hồ sơ người dùng</h1>
        <p className={cx("heroMeta")}>
          ID: #{detail.id} • {detail.statusLabel} • Thành viên từ{" "}
          {formatDate(detail.registeredAt)}
        </p>
      </div>

      <div className={cx("contentGrid")}>
        <aside className={cx("sidebar")}>
          <article className={cx("profileCard")}>
            <div className={cx("avatar")}>
              {detail.avatarUrl ? (
                <img src={detail.avatarUrl} alt={detail.fullName} />
              ) : (
                <span>{buildInitialLetters(detail.fullName) || "U"}</span>
              )}
            </div>

            <h2 className={cx("profileName")}>{detail.fullName}</h2>
            <p className={cx("profilePlan")}>Gói: {detail.packageName}</p>

            <div className={cx("infoList")}>
              <p>
                <FiMail /> <span>{detail.email}</span>
              </p>
              <p>
                <FiPhone /> <span>{detail.phone}</span>
              </p>
              <p>
                <FiCalendar />{" "}
                <span>Tham gia: {formatDate(detail.registeredAt)}</span>
              </p>
              <p>
                <FiMapPin /> <span>{detail.location}</span>
              </p>
            </div>
          </article>

          <article className={cx("actionCard")}>
            <h3 className={cx("cardTitle")}>
              <FiShield />
              <span>Hành động quản trị</span>
            </h3>

            <button
              type="button"
              className={cx("actionButton", {
                lock: !detail.isLocked,
                unlock: detail.isLocked,
              })}
              onClick={handleToggleStatus}
              disabled={isSubmittingStatus}
            >
              {isSubmittingStatus ? (
                <FiRefreshCw className={cx("spinning")} />
              ) : detail.isLocked ? (
                <FiUnlock />
              ) : (
                <FiLock />
              )}
              <span>
                {detail.isLocked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
              </span>
            </button>

            {statusActionError ? (
              <p className={cx("actionError")}>{statusActionError}</p>
            ) : null}

            <div className={cx("auditList")}>
              <h4 className={cx("subTitle")}>Audit log</h4>

              {detail.auditLogs.length === 0 ? (
                <p className={cx("emptyText")}>
                  Chưa có audit log nào cho tài khoản này.
                </p>
              ) : (
                detail.auditLogs.map((log) => (
                  <div key={log.id} className={cx("auditItem")}>
                    <strong>{log.action}</strong>
                    <span>{log.actor}</span>
                    <span>{formatDateTime(log.timestamp)}</span>
                    {log.note ? <p>{log.note}</p> : null}
                  </div>
                ))
              )}
            </div>
          </article>
        </aside>

        <div className={cx("mainContent")}>
          <div className={cx("statsGrid")}>
            <article className={cx("statCard")}>
              <span className={cx("statIcon", "blue")}>
                <FiFileText />
              </span>
              <p className={cx("statLabel")}>Số CV đã tạo</p>
              <strong className={cx("statValue")}>
                {detail.stats.cvCount}
              </strong>
            </article>

            <article className={cx("statCard")}>
              <span className={cx("statIcon", "violet")}>
                <FiCpu />
              </span>
              <p className={cx("statLabel")}>Số lần sử dụng AI</p>
              <strong className={cx("statValue")}>
                {detail.stats.aiUsageCount}
              </strong>
              <span className={cx("statHint")}>
                Đã dùng {aiQuotaPercent}% hạn mức tháng
              </span>
            </article>

            <article className={cx("statCard")}>
              <span className={cx("statIcon", "amber")}>
                <FiUser />
              </span>
              <p className={cx("statLabel")}>Gói hiện tại</p>
              <strong className={cx("statValue")}>{detail.packageName}</strong>
              <span className={cx("statHint")}>
                Hết hạn: {formatDate(detail.packageExpiredAt)}
              </span>
            </article>

            <article className={cx("statCard")}>
              <span className={cx("statIcon", "green")}>
                <FiCreditCard />
              </span>
              <p className={cx("statLabel")}>Tổng thanh toán</p>
              <strong className={cx("statValue")}>
                {formatCurrency(detail.stats.totalSpent)}
              </strong>
              <span className={cx("statHint")}>
                {detail.stats.totalTransactions} giao dịch
              </span>
            </article>
          </div>

          <div className={cx("infoPanels")}>
            <article className={cx("panelCard")}>
              <h3 className={cx("panelTitle")}>
                Thông tin tài khoản & Trạng thái
              </h3>
              <div className={cx("panelGrid")}>
                <div>
                  <span>Email</span>
                  <strong>{detail.email}</strong>
                </div>
                <div>
                  <span>Số điện thoại</span>
                  <strong>{detail.phone}</strong>
                </div>
                <div>
                  <span>Trạng thái</span>
                  <strong>{detail.statusLabel}</strong>
                </div>
                <div>
                  <span>Ngày đăng ký</span>
                  <strong>{formatDate(detail.registeredAt)}</strong>
                </div>
              </div>
            </article>

            <article className={cx("panelCard")}>
              <h3 className={cx("panelTitle")}>
                Gói dịch vụ hiện tại & Quota sử dụng
              </h3>
              <div className={cx("quotaList")}>
                <div className={cx("quotaItem")}>
                  <div className={cx("quotaTop")}>
                    <span>AI quota</span>
                    <strong>
                      {getQuotaText(
                        detail.quotas.aiUsed,
                        detail.quotas.aiLimit,
                      )}
                    </strong>
                  </div>
                  <div className={cx("quotaBar")}>
                    <span
                      style={{
                        width: `${aiQuotaPercent}%`,
                      }}
                    />
                  </div>
                </div>

                <div className={cx("quotaItem")}>
                  <div className={cx("quotaTop")}>
                    <span>Export quota</span>
                    <strong>
                      {getQuotaText(
                        detail.quotas.exportUsed,
                        detail.quotas.exportLimit,
                      )}
                    </strong>
                  </div>
                  <div className={cx("quotaBar")}>
                    <span
                      className={cx("greenBar")}
                      style={{
                        width: `${exportQuotaPercent}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </article>
          </div>

          <div className={cx("bottomGrid")}>
            <article className={cx("tableCard")}>
              <div className={cx("sectionHeader")}>
                <h3>Lịch sử giao dịch</h3>
                <span>{detail.transactions.length} hoạt động</span>
              </div>

              {detail.transactions.length === 0 ? (
                <p className={cx("emptyText")}>
                  Chưa có giao dịch nào được ghi nhận.
                </p>
              ) : (
                <div className={cx("historyList")}>
                  {detail.transactions.map((transaction) => (
                    <div key={transaction.id} className={cx("historyItem")}>
                      <div className={cx("historyIcon")}>
                        <FiCheckCircle />
                      </div>
                      <div className={cx("historyContent")}>
                        <strong>{transaction.title}</strong>
                        <span>
                          {formatDate(transaction.date)}
                          {transaction.reference
                            ? ` • ${transaction.reference}`
                            : ""}
                        </span>
                      </div>
                      <div className={cx("historyAmount")}>
                        {formatCurrency(
                          transaction.amount,
                          transaction.currency,
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </article>

            <article className={cx("tableCard")}>
              <div className={cx("sectionHeader")}>
                <h3>Thống kê số lượng CV / AI / Export</h3>
              </div>

              <div className={cx("metricsList")}>
                <div className={cx("metricRow")}>
                  <span>
                    <FiFileText /> Số CV đã tạo
                  </span>
                  <strong>{detail.stats.cvCount}</strong>
                </div>
                <div className={cx("metricRow")}>
                  <span>
                    <FiCpu /> Số lần dùng AI
                  </span>
                  <strong>{detail.stats.aiUsageCount}</strong>
                </div>
                <div className={cx("metricRow")}>
                  <span>
                    <FiDownload /> Tổng lượt export
                  </span>
                  <strong>{detail.stats.exportCount}</strong>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

export default UserDetailInfo;
