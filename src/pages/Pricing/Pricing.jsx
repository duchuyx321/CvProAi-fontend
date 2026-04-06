import classNames from 'classnames/bind';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';

import Button from '~/components/Button';
import { config } from '~/config';
import styles from './Pricing.module.scss';

const cx = classNames.bind(styles);

const LIST_PLANS = [
    {
        key: 'free',
        title: 'Gói Miễn phí',
        price: '0đ',
        unit: '/vĩnh viễn',
        features: [
            'Phân tích AI giới hạn (5 lần/tháng)',
            'Xuất PDF có watermark',
        ],
        buttonText: 'Bắt đầu ngay',
        popular: false,
        to: config.router.register,
    },
    {
        key: 'premium',
        title: 'Gói Premium',
        price: '199.000đ',
        unit: '/tháng',
        features: [
            'Tạo CV không giới hạn',
            'Phân tích AI nâng cao (Không giới hạn)',
            'PDF không watermark (Chất lượng cao)',
            'Xem lịch sử phân tích và giao dịch',
        ],
        buttonText: 'Nâng cấp Premium',
        popular: true,
        to: config.router.register,
    },
];

function PricingCard({
    title,
    price,
    unit,
    features = [],
    buttonText,
    popular = false,
    to,
}) {
    return (
        <article className={cx('card', { popular })}>
            {popular ? (
                <div className={cx('badge')}>PHỔ BIẾN NHẤT</div>
            ) : null}

            <div className={cx('head')}>
                <h2 className={cx('cardTitle')}>{title}</h2>

                <div className={cx('priceBox')}>
                    <span className={cx('price')}>{price}</span>
                    <span className={cx('unit')}>{unit}</span>
                </div>
            </div>

            <div className={cx('list')}>
                {features.map((item, index) => (
                    <div key={`${title}-${index}`} className={cx('item')}>
                        <span className={cx('itemIcon')}>
                            <IoCheckmarkCircleOutline />
                        </span>
                        <span className={cx('itemText')}>{item}</span>
                    </div>
                ))}
            </div>

            <div className={cx('actions')}>
                <Button
                    to={to}
                    primary={popular}
                    className={cx('btn', { btnPrimary: popular })}
                >
                    {buttonText}
                </Button>
            </div>
        </article>
    );
}

function Pricing() {
    return (
        <section className={cx('wrapper')}>
            <div className={cx('inner')}>
                <div className={cx('header')}>
                    <h1 className={cx('title')}>Gói dịch vụ phù hợp</h1>
                    <p className={cx('desc')}>
                        Chọn gói phù hợp để tối đa khả năng trúng tuyển.
                    </p>
                </div><div className={cx('grid')}>
                    {LIST_PLANS.map((item) => (
                        <PricingCard
                            key={item.key}
                            title={item.title}
                            price={item.price}
                            unit={item.unit}
                            features={item.features}
                            buttonText={item.buttonText}
                            popular={item.popular}
                            to={item.to}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Pricing;