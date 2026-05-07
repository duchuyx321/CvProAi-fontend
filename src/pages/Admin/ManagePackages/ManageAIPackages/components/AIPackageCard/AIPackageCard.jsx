import classNames from 'classnames/bind';
import styles from './AIPackageCard.module.scss';

const cx = classNames.bind(styles);

function AIPackageCard({ name, description = '', price, features = [] }) {
    return (
        <div className={cx('card')}>
            <div className={cx('header')}>
                <h3 className={cx('name')}>{name}</h3>
                {description && <p className={cx('description')}>{description}</p>}
            </div>

            <div className={cx('price')}>{price}</div>

            {features.length > 0 && (
                <ul className={cx('features')}>
                    {features.map((feature) => (
                        <li key={feature} className={cx('featureItem')}>
                            {feature}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default AIPackageCard;
