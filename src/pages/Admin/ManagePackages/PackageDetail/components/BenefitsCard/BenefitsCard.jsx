import classNames from 'classnames/bind';
import {
    MdAutoAwesome,
    MdCheckCircle,
    MdDescription,
    MdInsights,
} from 'react-icons/md';
import styles from './BenefitsCard.module.scss';

const cx = classNames.bind(styles);

const LIMIT_ITEMS = [
    {
        key: 'maxCv',
        title: 'Số CV tối đa',
        description: 'Giới hạn số lượng bản lưu trong kho',
        Icon: MdDescription,
    },
    {
        key: 'aiLimit',
        title: 'Lượt dùng AI',
        description: 'Sử dụng AI viết nội dung mỗi tháng',
        Icon: MdAutoAwesome,
    },
];

const FEATURE_ITEMS = [
    {
        key: 'premiumCv',
        label: 'Dùng template premium',
    },
    {
        key: 'removeWatermark',
        label: 'Xuất CV không watermark',
    },
    {
        key: 'customDomain',
        label: 'Tên miền tùy chỉnh',
    },
    {
        key: 'support247',
        label: 'Hỗ trợ 24/7',
    },
    {
        key: 'allowAiAddon',
        label: 'Cho phép mua thêm AI add-on',
    },
    {
        key: 'fullAiAnalysis',
        label: 'Xem full phân tích AI',
    },
];

function FeatureToggle({ label, checked, onToggle, disabled = false }) {
    return (
        <button
            type="button"
            className={cx('featureToggle', {
                featureToggleChecked: checked,
                featureToggleDisabled: disabled,
            })}
            onClick={onToggle}
            disabled={disabled}
        >
            <span
                className={cx('featureCheck', {
                    featureCheckActive: checked,
                })}
            >
                {checked ? <MdCheckCircle /> : null}
            </span>

            <span className={cx('featureLabel')}>{label}</span>
        </button>
    );
}

function BenefitsCard({
    formData,
    errors,
    onChangeField,
    onToggleField,
    isReadOnly = false,
}) {
    return (
        <section className={cx('wrapper')}>
            <div className={cx('header')}>
                <span className={cx('icon')}>
                    <MdInsights />
                </span>
                <h3 className={cx('title')}>Quyền lợi &amp; Tính năng</h3>
            </div>

            <div className={cx('content')}>
                <div className={cx('limitList')}>
                    {LIMIT_ITEMS.map(({ key, title, description, Icon }) => (
                        <div key={key} className={cx('limitCard')}>
                            <div className={cx('limitMeta')}>
                                <span className={cx('limitIcon')}>
                                    <Icon />
                                </span>

                                <div className={cx('limitText')}>
                                    <strong>{title}</strong>
                                    <span>{description}</span>
                                </div>
                            </div>

                            <div className={cx('limitControl')}>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={formData[key]}
                                    onChange={(event) =>
                                        onChangeField(key, event.target.value)
                                    }
                                    disabled={isReadOnly}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {!isReadOnly && (errors.maxCv || errors.aiLimit) ? (
                    <div className={cx('errorGroup')}>
                        {errors.maxCv ? (
                            <span className={cx('error')}>{errors.maxCv}</span>
                        ) : null}

                        {errors.aiLimit ? (
                            <span className={cx('error')}>{errors.aiLimit}</span>
                        ) : null}
                    </div>
                ) : null}

                <div className={cx('featureGrid')}>
                    {FEATURE_ITEMS.map((item) => (
                        <FeatureToggle
                            key={item.key}
                            label={item.label}
                            checked={Boolean(formData[item.key])}
                            onToggle={() =>
                                !isReadOnly && onToggleField(item.key)
                            }
                            disabled={isReadOnly}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

export default BenefitsCard;