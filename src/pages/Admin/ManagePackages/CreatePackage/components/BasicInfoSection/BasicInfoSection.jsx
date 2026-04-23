import classNames from 'classnames/bind';
import { MdInfoOutline, MdKeyboardArrowDown } from 'react-icons/md';
import styles from './BasicInfoSection.module.scss';

const cx = classNames.bind(styles);

function BasicInfoSection({
    formData,
    errors = {},
    disabled = false,
    onChangeField,
}) {
    return (
        <section className={cx('card')}>
            <div className={cx('sectionTitle')}>
                <MdInfoOutline />
                <h3>Thông tin cơ bản</h3>
            </div>

            <div className={cx('fieldGroup')}>
                <label className={cx('field')}>
                    <span className={cx('label')}>Tên gói dịch vụ</span>
                    <input
                        data-field="name"
                        className={cx('control', { hasError: Boolean(errors.name) })}
                        type="text"
                        value={formData.name}
                        disabled={disabled}
                        placeholder="Ví dụ: Gói Chuyên Nghiệp (Pro)"
                        onChange={(event) =>
                            onChangeField('name', event.target.value)
                        }
                    />
                    {errors.name ? (
                        <small className={cx('error')}>{errors.name}</small>
                    ) : null}
                </label>

                <label className={cx('field')}>
                    <span className={cx('label')}>Mô tả gói</span>
                    <textarea
                        data-field="description"
                        className={cx('control', 'textarea', {
                            hasError: Boolean(errors.description),
                        })}
                        rows={4}
                        value={formData.description}
                        disabled={disabled}
                        placeholder="Nhập mô tả ngắn gọn về giá trị của gói dịch vụ này..."
                        onChange={(event) =>
                            onChangeField('description', event.target.value)
                        }
                    />
                    {errors.description ? (
                        <small className={cx('error')}>
                            {errors.description}
                        </small>
                    ) : null}
                </label>

                <div className={cx('rowTwo')}>
                    <label className={cx('field')}>
                        <span className={cx('label')}>Giá tiền</span>
                        <input
                            data-field="price"
                            className={cx('control', { hasError: Boolean(errors.price) })}
                            type="text"
                            inputMode="numeric"
                            value={formData.price}
                            disabled={disabled}
                            placeholder="0.00"
                            onChange={(event) =>
                                onChangeField('price', event.target.value)
                            }
                        />
                        {errors.price ? (
                            <small className={cx('error')}>{errors.price}</small>
                        ) : null}
                    </label>

                    <label className={cx('field')}>
                        <span className={cx('label')}>Đơn vị tiền tệ</span>
                        <span className={cx('selectWrap')}>
                            <select
                                data-field="currency"
                                className={cx('control', 'selectControl', {
                                    hasError: Boolean(errors.currency),
                                })}
                                value={formData.currency}
                                disabled={disabled}
                                onChange={(event) =>
                                    onChangeField('currency', event.target.value)
                                }
                            >
                                <option value="VND">VND</option>
                                <option value="USD">USD</option>
                            </select>
                            <MdKeyboardArrowDown className={cx('selectIcon')} />
                        </span>
                        {errors.currency ? (
                            <small className={cx('error')}>{errors.currency}</small>
                        ) : null}
                    </label>
                </div>

                <div className={cx('rowTwo')}>
                    <label className={cx('field')}>
                        <span className={cx('label')}>Chu kỳ thanh toán</span>
                        <span className={cx('selectWrap')}>
                            <select
                                data-field="durationUnit"
                                className={cx('control', 'selectControl', {
                                    hasError: Boolean(errors.durationUnit),
                                })}
                                value={formData.durationUnit}
                                disabled={disabled}
                                onChange={(event) =>
                                    onChangeField('durationUnit', event.target.value)
                                }
                            >
                                <option value="year">Hàng năm</option>
                                <option value="month">Hàng tháng</option>
                                <option value="permanent">Vĩnh viễn</option>
                            </select>
                            <MdKeyboardArrowDown className={cx('selectIcon')} />
                        </span>
                        {errors.durationUnit ? (
                            <small className={cx('error')}>
                                {errors.durationUnit}
                            </small>
                        ) : null}
                    </label>

                    <div className={cx('field')}>
                        <span className={cx('label')}>Trạng thái hoạt động</span>

                        <div className={cx('statusField')}>
                            <span className={cx('statusText')}>
                                {formData.status === 'ACTIVE'
                                    ? 'Trạng thái hoạt động'
                                    : 'Tạm ngưng'}
                            </span>

                            <button
                                type="button"
                                className={cx('toggle', {
                                    checked: formData.status === 'ACTIVE',
                                })}
                                onClick={() =>
                                    onChangeField(
                                        'status',
                                        formData.status === 'ACTIVE'
                                            ? 'PAUSED'
                                            : 'ACTIVE'
                                    )
                                }
                                disabled={disabled}
                                role="switch"
                                aria-checked={formData.status === 'ACTIVE'}
                                aria-label="Trạng thái hoạt động"
                            >
                                <span className={cx('knob')} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default BasicInfoSection;