import classNames from 'classnames/bind';
import {
    MdAutoAwesome,
    MdDescription,
    MdOutlineInventory2,
} from 'react-icons/md';
import styles from './UsageSettingsSection.module.scss';

const cx = classNames.bind(styles);

const LIMIT_ITEMS = [
    {
        key: 'maxCv',
        label: 'Số CV tối đa',
        Icon: MdDescription,
    },
    {
        key: 'aiLimit',
        label: 'Lượt phân tích AI',
        Icon: MdAutoAwesome,
    },
];

const FEATURE_ITEMS = [
    { key: 'premiumCv', label: 'Dùng template premium' },
    { key: 'removeWatermark', label: 'Xuất CV không watermark' },
    { key: 'customDomain', label: 'Tên miền tùy chỉnh' },
    { key: 'support247', label: 'Hỗ trợ 24/7' },
    { key: 'allowAiAddon', label: 'Cho phép mua thêm AI add-on' },
    { key: 'fullAiAnalysis', label: 'Xem full phân tích AI' },
];

function ToggleSwitch({ checked, onClick, disabled = false, label }) {
    return (
        <button
            type="button"
            className={cx('toggle', { checked })}
            onClick={onClick}
            disabled={disabled}
            role="switch"
            aria-checked={checked}
            aria-label={label}
        >
            <span className={cx('knob')} />
        </button>
    );
}

function UsageSettingsSection({
    formData,
    errors = {},
    disabled = false,
    onChangeField,
    onToggleField,
}) {
    return (
        <section className={cx('card')}>
            <div className={cx('sectionBlock')}>
                <div className={cx('sectionTitle')}>
                    <MdOutlineInventory2 />
                    <h3>Giới hạn sử dụng</h3>
                </div>

                <div className={cx('limitList')}>
                    {LIMIT_ITEMS.map((item) => (
                        <div key={item.key} className={cx('limitItem')}>
                            <div className={cx('limitLeft')}>
                                <span className={cx('limitIcon')}>
                                    <item.Icon />
                                </span>
                                <span className={cx('limitLabel')}>
                                    {item.label}
                                </span>
                            </div>

                            <input
                                data-field={item.key}
                                className={cx('limitInput', {
                                    hasError: Boolean(errors[item.key]),
                                })}
                                type="text"
                                inputMode="numeric"
                                value={formData[item.key]}
                                disabled={disabled}
                                onChange={(event) =>
                                    onChangeField(item.key, event.target.value)
                                }
                            />
                        </div>
                    ))}
                </div>

                {(errors.maxCv || errors.aiLimit) ? (
                    <div className={cx('limitErrors')}>
                        {errors.maxCv ? (
                            <small className={cx('error')}>{errors.maxCv}</small>
                        ) : null}
                        {errors.aiLimit ? (
                            <small className={cx('error')}>{errors.aiLimit}</small>
                        ) : null}
                    </div>
                ) : null}
            </div>

            <div className={cx('sectionBlock')}>
                <div className={cx('sectionTitle')}>
                    <MdAutoAwesome />
                    <h3>Quyền lợi &amp; Tính năng</h3>
                </div>

                <div className={cx('featureList')}>
                    {FEATURE_ITEMS.map((item) => (
                        <div key={item.key} className={cx('featureRow')}>
                            <span className={cx('featureLabel')}>{item.label}</span>

                            <ToggleSwitch
                                checked={Boolean(formData[item.key])}
                                onClick={() => onToggleField(item.key)}
                                disabled={disabled}
                                label={item.label}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default UsageSettingsSection;
