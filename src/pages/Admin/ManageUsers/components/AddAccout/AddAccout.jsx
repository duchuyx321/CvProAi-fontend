import { useMemo, useState } from "react";
import classNames from "classnames/bind";
import { useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiMail,
  FiPhone,
  FiSend,
  FiUser,
  FiUserPlus,
} from "react-icons/fi";
import { toast } from "react-toastify";

import Input from "~/components/Input";
import { config } from "~/config";
import { createAdminUser } from "~/services/admin-user.service";

import styles from "./AddAccout.module.scss";

const cx = classNames.bind(styles);

const DEFAULT_PLAN_OPTIONS = [
  { label: "Miễn phí (Free)", value: "free" },
  { label: "Pro", value: "pro" },
  { label: "Premium", value: "premium" },
];

const INITIAL_FORM = {
  fullName: "",
  email: "",
  phoneNumber: "",
  plan: "free",
  sendActivationEmail: false,
};

const validateForm = (values) => {
  const nextErrors = {};

  if (!values.fullName.trim()) {
    nextErrors.fullName = "Vui lòng nhập họ và tên người dùng";
  }

  if (!values.email.trim()) {
    nextErrors.email = "Vui lòng nhập địa chỉ email";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    nextErrors.email = "Địa chỉ email không hợp lệ";
  }

  if (!values.phoneNumber.trim()) {
    nextErrors.phoneNumber = "Vui lòng nhập số điện thoại";
  } else if (!/^[0-9+\s]{9,15}$/.test(values.phoneNumber.trim())) {
    nextErrors.phoneNumber = "Số điện thoại không hợp lệ";
  }

  if (!values.plan) {
    nextErrors.plan = "Vui lòng chọn gói dịch vụ";
  }

  return nextErrors;
};

function AddAccout({
  onBack,
  onSuccess,
  createUserAction = createAdminUser,
  planOptions = DEFAULT_PLAN_OPTIONS,
}) {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPlanLabel = useMemo(() => {
    return (
      planOptions.find((option) => option.value === formValues.plan)?.label ||
      "Miễn phí (Free)"
    );
  }, [formValues.plan, planOptions]);

  const handleChange = (field, value) => {
    setFormValues((previousState) => ({
      ...previousState,
      [field]: value,
    }));
    setErrors((previousState) => {
      const nextState = { ...previousState };
      delete nextState[field];
      return nextState;
    });
    setSubmitError("");
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    navigate(config.router.manageUsers);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateForm(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await createUserAction({
        full_name: formValues.fullName.trim(),
        email: formValues.email.trim(),
        phone_number: formValues.phoneNumber.trim(),
        plan: formValues.plan,
        send_activation_email: formValues.sendActivationEmail,
      });

      if (response?.success === false) {
        throw new Error(response?.message || "Không thể tạo tài khoản mới");
      }

      toast.success("Tạo tài khoản người dùng thành công");

      if (onSuccess) {
        onSuccess(response?.data || response);
      } else {
        navigate(config.router.manageUsers);
      }

      setFormValues(INITIAL_FORM);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tạo tài khoản người dùng";

      setSubmitError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className={cx("wrapper")}>
      <div className={cx("topbar")}>
        <div className={cx("breadcrumbs")}>
          <span className={cx("brand")}>CvProAI</span>
          <span className={cx("separator")}>›</span>
          <span className={cx("muted")}>Quản lý tài khoản</span>
          <span className={cx("separator")}>›</span>
          <span className={cx("active")}>Thêm tài khoản</span>
        </div>
      </div>

      <form className={cx("formCard")} onSubmit={handleSubmit}>
        <div className={cx("fieldRow", "fullRow")}>
          <Input
            id="add-account-full-name"
            label="Họ và tên"
            value={formValues.fullName}
            onChange={(event) => handleChange("fullName", event.target.value)}
            placeholder="Nhập tên đầy đủ của người dùng"
            leftIcon={<FiUser />}
            error={errors.fullName}
          />
        </div>

        <div className={cx("fieldGrid")}>
          <Input
            id="add-account-email"
            label="Địa chỉ Email"
            type="email"
            value={formValues.email}
            onChange={(event) => handleChange("email", event.target.value)}
            placeholder="example@domain.com"
            leftIcon={<FiMail />}
            error={errors.email}
          />

          <Input
            id="add-account-phone"
            label="Số điện thoại"
            value={formValues.phoneNumber}
            onChange={(event) =>
              handleChange("phoneNumber", event.target.value)
            }
            placeholder="09xx xxx xxx"
            leftIcon={<FiPhone />}
            error={errors.phoneNumber}
          />
        </div>

        <div className={cx("fieldRow", "fullRow")}>
          <label className={cx("selectWrapper")}>
            <span className={cx("selectLabel")}>Gói dịch vụ</span>
            <span
              className={cx("selectField", {
                hasError: errors.plan,
              })}
            >
              <span className={cx("selectValue")}>{currentPlanLabel}</span>
              <FiChevronDown />
              <select
                value={formValues.plan}
                onChange={(event) => handleChange("plan", event.target.value)}
              >
                {planOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </span>
            {errors.plan ? (
              <span className={cx("selectError")}>{errors.plan}</span>
            ) : null}
          </label>

          <p className={cx("helperText")}>
            Người dùng có thể nâng cấp gói sau khi kích hoạt tài khoản.
          </p>
        </div>

        <label className={cx("checkboxRow")}>
          <input
            type="checkbox"
            checked={formValues.sendActivationEmail}
            onChange={(event) =>
              handleChange("sendActivationEmail", event.target.checked)
            }
          />
          <span className={cx("checkboxFake")} />
          <span className={cx("checkboxLabel")}>
            Gửi email thông báo kích hoạt tài khoản cho người dùng.
          </span>
        </label>

        {submitError ? (
          <p className={cx("submitError")}>{submitError}</p>
        ) : null}

        <div className={cx("actions")}>
          <button
            type="button"
            className={cx("ghostButton")}
            onClick={handleBack}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </button>

          <button
            type="submit"
            className={cx("primaryButton")}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FiSend />
                <span>Đang tạo tài khoản...</span>
              </>
            ) : (
              <>
                <FiUserPlus />
                <span>Thêm tài khoản</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AddAccout;
