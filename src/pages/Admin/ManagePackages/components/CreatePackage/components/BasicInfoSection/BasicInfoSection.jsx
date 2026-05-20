import classNames from 'classnames/bind';
import { MdInfoOutline, MdKeyboardArrowDown } from 'react-icons/md';
import PriceInput from '../../../PriceInput';
import styles from './BasicInfoSection.module.scss';

const cx = classNames.bind(styles);

function BasicInfoSection({
    formData,
    errors = {},
    disabled = false,
    onChangeField,
}) {
    const isActive = formData.status === 'ACTIVE';

    const renderError = (field) => {
        if (!errors[field]) {
            return null;
        }

        return <small className={cx('error')}>{errors[field]}</small>;
    };

    const handleChange = (field) => (event) => {
        onChangeField(field, event.target.value);
    };

    const handleToggleStatus = () => {
        onChangeField('status', isActive ? 'PAUSED' : 'ACTIVE');
    };

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
                        className={cx('control', {
                            hasError: Boolean(errors.name),
                        })}
                        type="text"
                        value={formData.name}
                        disabled={disabled}
                        placeholder="Ví dụ: Gói Chuyên Nghiệp (Pro)"
                        onChange={handleChange('name')}
                    />

                    {renderError('name')}
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
                        onChange={handleChange('description')}
                    />

                    {renderError('description')}
                </label>

                <div className={cx('rowTwo')}>
                    <label className={cx('field')}>
                        <span className={cx('label')}>Giá tiền</span>

                        <PriceInput
                            data-field="price"
                            className={cx('control', {
                                hasError: Boolean(errors.price),
                            })}
                            value={formData.price}
                            disabled={disabled}
                            placeholder="0"
                            onValueChange={(value) => onChangeField('price', value)}
                        />

                        {renderError('price')}
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
                                onChange={handleChange('currency')}
                            >
                                <option value="VND">VND</option>
                                <option value="USD">USD</option>
                            </select>

                            <MdKeyboardArrowDown className={cx('selectIcon')} />
                        </span>

                        {renderError('currency')}
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
                                onChange={handleChange('durationUnit')}
                            >
                                <option value="year">Hàng năm</option>
                                <option value="month">Hàng tháng</option>
                                <option value="permanent">Vĩnh viễn</option>
                            </select>

                            <MdKeyboardArrowDown className={cx('selectIcon')} />
                        </span>

                        {renderError('durationUnit')}
                    </label>

                    <div className={cx('field')}>
                        <span className={cx('label')}>Trạng thái hoạt động</span>

                        <div className={cx('statusField')}>
                            <span className={cx('statusText')}>
                                {isActive ? 'Trạng thái hoạt động' : 'Tạm ngưng'}
                            </span>

                            <button
                                type="button"
                                className={cx('toggle', {
                                    checked: isActive,
                                })}
                                onClick={handleToggleStatus}
                                disabled={disabled}
                                role="switch"
                                aria-checked={isActive}
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
