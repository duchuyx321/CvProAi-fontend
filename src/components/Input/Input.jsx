import { forwardRef } from 'react';
import classNames from 'classnames/bind';
import styles from './Input.module.scss';

const cx = classNames.bind(styles);

const Input = forwardRef(function Input(
  {
    label,
    error,
    success = false,

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
    disabled,
  });

  const fieldClasses = cx('fieldWrapper', {
    hasError: !!error,
    success,
    disabled,
    hasLeftIcon: !!leftIcon,
    hasRightIcon: !!rightIcon,
  });

  return (
    <div className={classes}>
      {label && (
        <label className={cx('label')}>
          {label}
        
        </label>
      )}

      <div className={fieldClasses}>
        {leftIcon && <span className={cx('icon', 'leftIcon')}>{leftIcon}</span>}

        <input
          ref={ref}
          className={cx('input', inputClassName)}
          disabled={disabled}
          aria-invalid={!!error}
          {...passProps}
        />

        {rightIcon && <span className={cx('icon', 'rightIcon')}>{rightIcon}</span>}
      </div>


    </div>
  );
});

export default Input;