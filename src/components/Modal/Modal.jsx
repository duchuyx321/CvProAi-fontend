import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames/bind';
import { MdClose } from 'react-icons/md';
import styles from './Modal.module.scss';

const cx = classNames.bind(styles);

function Modal({
    isOpen = false,
    onClose,
    title,
    description,
    children,
    footer,
    size = 'md',
    className,
    closeOnOverlayClick = true,
    closeOnEsc = true,
    showCloseButton = true,
}) {
    useEffect(() => {
        if (!isOpen) return undefined;

        const originalOverflow = document.body.style.overflow;
        const originalPaddingRight = document.body.style.paddingRight;

        const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = 'hidden';

        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        return () => {
            document.body.style.overflow = originalOverflow;
            document.body.style.paddingRight = originalPaddingRight;
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !closeOnEsc) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose?.();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, closeOnEsc, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (event) => {
        if (!closeOnOverlayClick) return;

        if (event.target === event.currentTarget) {
            onClose?.();
        }
    };

    return createPortal(
        <div className={cx('overlay')} onClick={handleOverlayClick}>
            <div
                className={cx('modal', `size-${size}`, className)}
                role="dialog"
                aria-modal="true"
            >
                {(title || description || showCloseButton) && (
                    <div className={cx('header')}>
                        <div className={cx('headerContent')}>
                            {title ? (
                                <h3 className={cx('title')}>{title}</h3>
                            ) : null}

                            {description ? (
                                <p className={cx('description')}>
                                    {description}
                                </p>
                            ) : null}
                        </div>

                        {showCloseButton && (
                            <button
                                type="button"
                                className={cx('closeButton')}
                                onClick={onClose}
                                aria-label="Close modal"
                            >
                                <MdClose />
                            </button>
                        )}
                    </div>
                )}

                <div className={cx('body')}>{children}</div>

                {footer ? <div className={cx('footer')}>{footer}</div> : null}
            </div>
        </div>,
        document.body,
    );
}

export default Modal;