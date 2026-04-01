import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import classNames from "classnames/bind";
import { MdOutlinePerson,MdOutlinePersonOutline, MdOutlineEmail, MdOutlineLock, MdOutlineSecurity } from "react-icons/md";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { RiLoader2Fill } from "react-icons/ri";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { config } from "~/config";
import Button from "~/components/Button";
import Input from "~/components/Input";
import { register } from "~/services/auth.service";
import { validateRegisterForm } from "~/utils/auth.validator";
import styles from "./RegisterLeft.module.scss";

const cx = classNames.bind(styles);

function RegisterLeft() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isEyePassword, setIsEyePassword] = useState(false);
  const [isEyeConfirmPassword, setIsEyeConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isDisabled = useMemo(() => {
    return (
      loading ||
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !agreed
    );
  }, [fullName, email, password, confirmPassword, agreed, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    const errorMessage = validateRegisterForm({
      fullName,
      email,
      password,
      confirmPassword,
      agreed,
    });

    if (errorMessage) {
      toast.warning(errorMessage);
      return;
    }

    try {
      setLoading(true);

      const result = await register({
        fullName,
        email,
        password,
        confirmPassword,
      });

      if (!result?.success) {
        toast.error(result?.message || "Đăng ký thất bại");
        return;
      }

      toast.success(result?.message || "Đăng ký tài khoản thành công");

      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAgreed(false);
      setIsEyePassword(false);
      setIsEyeConfirmPassword(false);

      setTimeout(() => {
        navigate(config.router.login);
      }, 800);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Có lỗi xảy ra, vui lòng thử lại sau",
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleEye = (type) => {
        if (type === 'password') setIsEyePassword(!isEyePassword);
        else setIsEyeConfirmPassword(!isEyeConfirmPassword);
    };

  return (
    <form className={cx("form")} onSubmit={handleSubmit}>
      <div className={cx("field")}>
        <Input
          id="fullname"
          label="Họ tên"
          type="text"
          name="fullname"
          leftIcon={<MdOutlinePersonOutline />}
          className={cx("authInput")}
          inputClassName={cx("authInputControl")}
          placeholder="Nhập họ và tên của bạn"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={loading}
          autoComplete="name"
        />
      </div>

      <div className={cx("field")}>
        <Input
          id="email"
          label="Email"
          type="text"
          name="email"
          leftIcon={<MdOutlineEmail />}
          className={cx("authInput")}
          inputClassName={cx("authInputControl")}
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      <div className={cx("formRow")}>
        <div className={cx("field")}>
          <Input
            id="password"
            label="Password"
            type={isEyePassword ? "text" : "password"}
            name="password"
            leftIcon={<MdOutlineLock />}
            rightIcon={
              <button
                type="button"
                className={cx("btnEye")}
                onClick={() => toggleEye("password")}
              >
                {isEyePassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            }
            className={cx("authInput")}
            inputClassName={cx("authInputControl")}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className={cx("field")}>
          <Input
            id="confirmPassword"
            label="Xác nhận"
            type={isEyeConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            leftIcon={<MdOutlineSecurity />}
            rightIcon={
              <button
                type="button"
                className={cx("btnEye")}
                onClick={() => toggleEye("confirmPassword")}
              >
                {isEyeConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            }
            className={cx("authInput")}
            inputClassName={cx("authInputControl")}
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
      </div>

      <div className={cx("options")}>
        <label htmlFor="agreedTerms" className={cx("checkbox")}>
          <input
            id="agreedTerms"
            type="checkbox"
            name="agreedTerms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className={cx("checkboxInput")}
          />
          <span className={cx("checkboxText")}>
            Tôi đồng ý với{" "}
            <Button to="/terms" text className={cx("forgot")}>
              Điều khoản sử dụng
            </Button>{" "}
            và{" "}
            <Button to="/privacy" text className={cx("forgot")}>
              Chính sách bảo mật
            </Button>
            .
          </span>
        </label>
      </div>

      <Button
        primary
        className={cx("submit")}
        disabled={isDisabled}
        type="submit"
      >
        {loading ? (
          <>
            <RiLoader2Fill className={cx("spinner")} />
            Đang tạo tài khoản...
          </>
        ) : (
          "Đăng ký tài khoản"
        )}
      </Button>
    </form>
  );
}

export default RegisterLeft;
