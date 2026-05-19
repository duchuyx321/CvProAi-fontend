import classNames from 'classnames/bind';

import Button from '~/components/Button';
import styles from './AddonCard.module.scss';

const cx = classNames.bind(styles);

function toNumber(value) {
    return Number(value) || 0;
}

function formatPrice(value, currency = 'VND') {
    const amount = toNumber(value);

    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency,
        maximumFractionDigits: currency === 'VND' ? 0 : 2,
    }).format(amount);
}

function AddonCard({
    addon = {},
    isBuying = false,
    isDisabled = false,
    onBuy,
}) {
    const isPopular = Boolean(addon?.is_popular);

    return (
        <article
            className={cx('card', {
                popular: isPopular,
            })}
        >
            {isPopular ? (
                <span className={cx('badge')}>Phổ biến</span>
            ) : null}

            <h3 className={cx('title')}>{addon.name || '--'}</h3>

            <strong className={cx('price')}>
                {formatPrice(addon.price, addon.currency || 'VND')}
            </strong>

            <p className={cx('desc')}>
                {addon.description ||
                    `+${addon.runs || 0} lượt phân tích CV bằng AI.`}
            </p>

            <Button
                type="button"
                primary={isPopular}
                className={cx('button')}
                disabled={isBuying || isDisabled}
                onClick={() => onBuy?.(addon)}
            >
                {isBuying ? 'Đang tạo đơn hàng...' : 'Mua ngay'}
            </Button>
        </article>
    );
}

export default AddonCard;