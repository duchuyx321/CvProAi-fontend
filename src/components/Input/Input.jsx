import { forwardRef } from 'react';
import classNames from 'classnames/bind';
import styles from './Input.module.scss';

const cx = classNames.bind(styles);

const Input = forwardRef(function Input(
  {
    id,
    type = 'text',
    label,
    error,
    disabled = false,
    leftIcon,
    rightIcon,
    fullWidth = true,
    className,
    inputClassName,
    ...passProps
  },
  ref,
) {
  const classes = cx('wrapper', className, {
    fullWidth,
  });

  const fieldClasses = cx('fieldWrapper', {
    hasError: !!error,
    disabled,
    hasLeftIcon: !!leftIcon,
    hasRightIcon: !!rightIcon,
  });

  return (
    <div className={classes}>
      {label && (
        <label className={cx('label')} htmlFor={id}>
          {label}
        </label>
      )}

      <div className={fieldClasses}>
        {leftIcon && <span className={cx('icon', 'leftIcon')}>{leftIcon}</span>}

        <input
          id={id}
          ref={ref}
          type={type}
          className={cx('input', inputClassName)}
          disabled={disabled}
          aria-invalid={!!error}
          {...passProps}
        />

        {rightIcon && <span className={cx('icon', 'rightIcon')}>{rightIcon}</span>}
      </div>

      {error && <p className={cx('message', 'error')}>{error}</p>}
    </div>
  );
});

export default Input;