import classNames from 'classnames/bind';
import styles from './Button.module.scss';
import { Link } from 'react-router-dom';
import { forwardRef } from 'react';

const cx = classNames.bind(styles);

const Button = forwardRef(
  (
    {
      to,
      href,
      primary = false,
      outline = false,
      outlineText = false,
      disabled = false,
      text = false,
      small = false,
      large = false,
      leftIcon = false,
      rightIcon = false,
      children,
      className,
      onClick,
      rounded,
      ...passPops
    },
    ref,
  ) => {
    let Components = 'button';

    let props = {
      onClick,
      ...passPops,
    };

    if (to) {
      props.to = to;
      Components = Link;
    } else if (href) {
      props.href = href;
      Components = 'a';
    }

    const classes = cx('wrapper', {
      [className]: className,
      primary,
      outline,
      outlineText,
      text,
      small,
      large,
      disabled,
      rounded,
    });

    return (
      <Components ref={ref} className={classes} {...props}>
        {leftIcon && <span className={cx('icon')}>{leftIcon}</span>}
        <span className={cx('title')}>{children}</span>
        {rightIcon && <span className={cx('icon')}>{rightIcon}</span>}
      </Components>
    );
  },
);

export default Button;
