import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import {
  MdOutlinePersonOutline,
  MdOutlineEmail,
  MdOutlineLock,
  MdOutlineSecurity,
} from 'react-icons/md';
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';

import { config } from '~/config';
import Button from '~/components/Button';
import Input from '~/components/Input';
import { register } from '~/services/auth.service';
import { validateRegisterForm } from '~/utils/auth.validator';
import styles from './RegisterLeft.module.scss';

const cx = classNames.bind(styles);

function RegisterLeft() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isEyePassword, setIsEyePassword] = useState(false);
  const [isEyeConfirmPassword, setIsEyeConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isDisabled = useMemo(() => {
    return (
      submitting ||
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim() ||
      !agreed
    );
  }, [fullName, email, password, confirmPassword, agreed, submitting]);

  const toggleEye = (type) => {
    if (type === 'password') {
      setIsEyePassword((prev) => !prev);
    } else {
      setIsEyeConfirmPassword((prev) => !prev);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitting) return;

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
      setSubmitting(true);

      const registerPromise = register({
        full_name:fullName,
        email,
        password,
      }).then((result) => {
        if (!result?.success) {
          throw new Error(result?.message || 'Đăng ký thất bại');
        }

        return result;
      });

      const result = await toast.promise(registerPromise, {
        pending: 'Đang tạo tài khoản...',
        success: {
          render({ data }) {
            return data?.message || 'Đăng ký tài khoản thành công';
          },
        },
        error: {
          render({ data }) {
            return data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau';
          },
        },
      });

      if (result?.success) {
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setAgreed(false);
        setIsEyePassword(false);
        setIsEyeConfirmPassword(false);

        setTimeout(() => {
          navigate(config.router.login);
        }, 800);
      }
    } catch (error) {
      console.log('Register error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className={cx('form')} onSubmit={handleSubmit}>
      <div className={cx('field')}>
        <Input
          id="fullName"
          label="Họ tên"
          type="text"
          name="fullName"
          leftIcon={<MdOutlinePersonOutline />}
          className={cx('authInput')}
          inputClassName={cx('authInputControl')}
          placeholder="Nhập họ và tên của bạn"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={submitting}
          autoComplete="name"
        />
      </div>

      <div className={cx('field')}>
        <Input
          id="email"
          label="Email"
          type="text"
          name="email"
          leftIcon={<MdOutlineEmail />}
          className={cx('authInput')}
          inputClassName={cx('authInputControl')}
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          disabled={submitting}
        />
      </div>

      <div className={cx('formRow')}>
        <div className={cx('field')}>
          <Input
            id="password"
            label="Mật khẩu"
            type={isEyePassword ? 'text' : 'password'}
            name="password"
            leftIcon={<MdOutlineLock />}
            rightIcon={
              <button
                type="button"
                className={cx('btnEye')}
                onClick={() => toggleEye('password')}
                aria-label={isEyePassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {isEyePassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            }
            className={cx('authInput')}
            inputClassName={cx('authInputControl')}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={submitting}
          />
        </div>

        <div className={cx('field')}>
          <Input
            id="confirmPassword"
            label="Xác nhận"
            type={isEyeConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            leftIcon={<MdOutlineSecurity />}
            rightIcon={
              <button
                type="button"
                className={cx('btnEye')}
                onClick={() => toggleEye('confirmPassword')}
                aria-label={
                  isEyeConfirmPassword
                    ? 'Ẩn xác nhận mật khẩu'
                    : 'Hiện xác nhận mật khẩu'
                }
              >
                {isEyeConfirmPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            }
            className={cx('authInput')}
            inputClassName={cx('authInputControl')}
            placeholder="********"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            disabled={submitting}
          />
        </div>
      </div>

      <div className={cx('options')}>
        <label htmlFor="agreedTerms" className={cx('checkbox')}>
          <input
            id="agreedTerms"
            type="checkbox"
            name="agreedTerms"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className={cx('checkboxInput')}
            disabled={submitting}
          />
          <span className={cx('checkboxText')}>
            Tôi đồng ý với{' '}
            <Button to="/terms" text className={cx('forgot')}>
              Điều khoản sử dụng
            </Button>{' '}
            và{' '}
            <Button to="/privacy" text className={cx('forgot')}>
              Chính sách bảo mật
            </Button>
            .
          </span>
        </label>
      </div>

      <Button
        primary
        className={cx('submit')}
        disabled={isDisabled}
        type="submit"
      >
        Đăng ký tài khoản
      </Button>
    </form>
  );
}

export default RegisterLeft;