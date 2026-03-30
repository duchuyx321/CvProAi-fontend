import { forwardRef, useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import images from '~/assets';
import styles from './Image.module.scss';

const cx = classNames.bind(styles);

const Image = forwardRef(
    (
        {
            src,
            alt = '',
            className,
            fallback = images.noImage,
            rounded = 'md',
            fit = 'cover',
            ratio,
            width,
            height,
            loading = 'lazy',
            onClick,
            ...passProps
        },
        ref,
    ) => {
        const [imageSrc, setImageSrc] = useState(fallback);

        useEffect(() => {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setImageSrc(src || fallback);
        }, [src, fallback]);

        const handleError = () => {
            if (imageSrc !== fallback) {
                setImageSrc(fallback);
            }
        };

        const wrapperStyle = {
            ...(ratio ? { aspectRatio: ratio } : {}),
            ...(width ? { width } : {}),
            ...(height ? { height } : {}),
        };

        const classes = cx('wrapper', className, {
            [`rounded-${rounded}`]: rounded,
            [`fit-${fit}`]: fit,
            clickable: !!onClick,
        });

        return (
            <div className={classes} style={wrapperStyle} onClick={onClick}>
                <img
                    ref={ref}
                    className={cx('image')}
                    src={imageSrc}
                    alt={alt}
                    onError={handleError}
                    loading={loading}
                    {...passProps}
                />
            </div>
        );
    },
);

export default Image;