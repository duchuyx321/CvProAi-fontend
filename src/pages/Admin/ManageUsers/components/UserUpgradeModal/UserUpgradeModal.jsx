import { useState, useEffect } from "react";
import classNames from "classnames/bind";
import { toast } from "react-toastify";
import { LoaderCircle } from "lucide-react";

import Modal from "~/components/Modal";
import { upgradeAdminUser, getAdminPlans } from "~/services/admin-user.service";
import { formatCurrency } from "../../manageUsers.utils";

import styles from "./UserUpgradeModal.module.scss";

const cx = classNames.bind(styles);

const DURATION_OPTIONS = [
  { label: "1 tháng", value: 1 },
  { label: "3 tháng", value: 3 },
  { label: "6 tháng", value: 6 },
  { label: "12 tháng", value: 12 },
  { label: "Vĩnh viễn", value: 999 }, 
];

function UserUpgradeModal({ isOpen, onClose, user, onSuccess }) {
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [durationMonths, setDurationMonths] = useState(
    DURATION_OPTIONS[0].value,
  );

  useEffect(() => {
    if (!isOpen) {
      setSelectedPlanId("");
      setDurationMonths(DURATION_OPTIONS[0].value);
      return;
    }

    let ignore = false;
    const fetchPlans = async () => {
      try {
        setLoadingPlans(true);
        const response = await getAdminPlans();
        if (ignore) return;

        const payload = response?.data || response || {};
        const planList = Array.isArray(payload)
          ? payload
          : payload.data || payload.items || payload.list || payload.rows || [];

        const activePlans = Array.isArray(planList)
          ? planList.filter((p) => p.is_active !== false)
          : [];

        setPlans(activePlans);
        if (activePlans.length > 0) {
          setSelectedPlanId(activePlans[0].id);
        }
      } catch {
        if (!ignore) {
          toast.error("Không thể tải danh sách các gói");
        }
      } finally {
        if (!ignore) setLoadingPlans(false);
      }
    };

    fetchPlans();

    return () => {
      ignore = true;
    };
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id || !selectedPlanId) return;

    try {
      setIsSubmitting(true);
      const response = await upgradeAdminUser(user.id, {
        plan_id: selectedPlanId,
        duration_months: durationMonths,
      });

      if (response?.success === false) {
        throw new Error(response?.message || "Có lỗi xảy ra khi nâng cấp");
      }

      toast.success(`Đã nâng cấp tài khoản cho ${user.fullName} thành công!`);
      onSuccess?.(user);
      onClose?.();
    } catch (error) {
      toast.error(error.message || "Không thể nâng cấp tài khoản");
    } finally {
      setIsSubmitting(false);
    }
  };

  const footer = (
    <div className={cx("footerActions")}>
      <button
        type="button"
        className={cx("cancelBtn")}
        onClick={onClose}
        disabled={isSubmitting}
      >
        Hủy
      </button>
      <button
        type="button"
        className={cx("submitBtn")}
        onClick={handleSubmit}
        disabled={isSubmitting || !selectedPlanId || loadingPlans}
      >
        {isSubmitting ? <LoaderCircle className={cx("spinning")} /> : null}
        Nâng cấp
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? undefined : onClose}
      title="Nâng Cấp Tài Khoản"
      description={`Bạn đang thực hiện nâng cấp tài khoản cho người dùng ${user?.fullName || ""}.`}
      size="md"
      footer={footer}
      closeOnEsc={!isSubmitting}
      closeOnOverlayClick={!isSubmitting}
    >
      <div className={cx("body")}>
        {loadingPlans ? (
          <div className={cx("loadingContainer")}>
            <LoaderCircle className={cx("spinning")} />
            <span>Đang tải các gói dịch vụ...</span>
          </div>
        ) : (
          <form className={cx("form")} onSubmit={handleSubmit}>
            <div className={cx("formGroup")}>
              <label htmlFor="plan_id">
                Chọn Gói Dịch Vụ <span className={cx("required")}>*</span>
              </label>
              <div className={cx("planList")}>
                {plans.map((plan) => (
                  <label
                    key={plan.id}
                    className={cx("planItem", {
                      active: selectedPlanId === plan.id,
                    })}
                  >
                    <input
                      type="radio"
                      name="plan_id"
                      value={plan.id}
                      checked={selectedPlanId === plan.id}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                    />
                    <div className={cx("planInfo")}>
                      <strong>{plan.name}</strong>
                      <span className={cx("price")}>
                        {formatCurrency(plan.price, plan.currency || "VND")} /
                        tháng
                      </span>
                    </div>
                  </label>
                ))}
                {plans.length === 0 && !loadingPlans && (
                  <p className={cx("noPlans")}>
                    Không có gói dịch vụ nào khả dụng.
                  </p>
                )}
              </div>
            </div>

            <div className={cx("formGroup")}>
              <label htmlFor="duration">
                Thời Hạn Kích Hoạt <span className={cx("required")}>*</span>
              </label>
              <select
                id="duration"
                className={cx("input")}
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

export default UserUpgradeModal;
