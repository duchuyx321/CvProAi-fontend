import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import classNames from 'classnames/bind';

import Button from '~/components/Button';
import styles from './PricingCard.module.scss';

const cx = classNames.bind(styles);

function PricingCard({ plan = {} }) {
    const {
        title,
        description,
        pricePrefix,
        price,
        unit,
        featureTitle,
        features = [],
        buttonText,
        popular = false,
        badgeText,
        note,
        to,
    } = plan;

    return (
        <article className={cx('card', { popular })}>
            {popular && badgeText ? (
                <span className={cx('badge')}>{badgeText}</span>
            ) : null}

            <div className={cx('head')}>
                <h2 className={cx('cardTitle')}>{title}</h2>

                {description ? (
                    <p className={cx('cardDesc')}>{description}</p>
                ) : null}

                <div className={cx('priceBox')}>
                    {pricePrefix ? (
                        <span className={cx('pricePrefix')}>{pricePrefix}</span>
                    ) : null}

                    <span className={cx('price')}>{price}</span>
                    <span className={cx('unit')}>{unit}</span>
                </div>
            </div>

            <div className={cx('body')}>
                {featureTitle ? (
                    <p className={cx('featureTitle')}>{featureTitle}</p>
                ) : null}

                <ul className={cx('list')}>
                    {features.map((item) => (
                        <li key={`${title}-${item}`} className={cx('item')}>
                            <span className={cx('itemIcon')}>
                                <IoCheckmarkCircleOutline />
                            </span>
                            <span className={cx('itemText')}>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className={cx('actions')}>
                <Button
                    to={to}
                    primary={popular}
                    className={cx('btn', { btnPrimary: popular })}
                >
                    {buttonText || 'Xem chi tiết'}
                </Button>
            </div>

            {note ? <p className={cx('note')}>{note}</p> : null}
        </article>
    );
}

export default PricingCard;