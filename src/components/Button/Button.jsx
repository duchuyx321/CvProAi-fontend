import classNames from 'classnames/bind';
import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './Button.module.scss';

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
            type = 'button',
            ...passProps
        },
        ref
    ) => {
        let Component = 'button';

        const props = {
            ...passProps,
        };

        if (to) {
            props.to = to;
            Component = Link;
        } else if (href) {
            props.href = href;
            Component = 'a';
        } else {
            props.type = type;
            props.disabled = disabled;
        }

        const handleClick = (event) => {
            if (disabled) {
                event.preventDefault();
                return;
            }

            onClick?.(event);
        };

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
            <Component
                ref={ref}
                className={classes}
                onClick={handleClick}
                aria-disabled={disabled || undefined}
                {...props}
            >
                {leftIcon ? <span className={cx('icon')}>{leftIcon}</span> : null}
                <span className={cx('title')}>{children}</span>
                {rightIcon ? <span className={cx('icon')}>{rightIcon}</span> : null}
            </Component>
        );
    }
);

export default Button;