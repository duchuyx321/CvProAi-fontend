import classNames from 'classnames/bind';
import { MdInfoOutline, MdKeyboardArrowDown } from 'react-icons/md';
import styles from './BasicInfoCard.module.scss';

const cx = classNames.bind(styles);

function BasicInfoCard({
    formData,
    errors,
    onChangeField,
    isReadOnly = false,
}) {
    const isActive = formData.status === 'ACTIVE';

    return (
        <section className={cx('wrapper')}>
            <div className={cx('header')}>
                <span className={cx('icon')}>
                    <MdInfoOutline />
                </span>
                <h3 className={cx('title')}>Thông tin cơ bản</h3>
            </div>

            <div className={cx('form')}>
                <label className={cx('field')}>
                    <span className={cx('label')}>Tên gói dịch vụ</span>
                    <input
                        type="text"
                        value={formData.name}
                        placeholder="Nhập tên gói dịch vụ"
                        onChange={(event) =>
                            onChangeField('name', event.target.value)
                        }
                        disabled={isReadOnly}
                    />
                    {!isReadOnly && errors.name ? (
                        <span className={cx('error')}>{errors.name}</span>
                    ) : null}
                </label>

                <div className={cx('row')}>
                    <label className={cx('field')}>
                        <span className={cx('label')}>Giá tiền (VND)</span>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={formData.price}
                            placeholder="0"
                            onChange={(event) =>
                                onChangeField('price', event.target.value)
                            }
                            disabled={isReadOnly}
                        />
                        {!isReadOnly && errors.price ? (
                            <span className={cx('error')}>{errors.price}</span>
                        ) : null}
                    </label>

                    <label className={cx('field')}>
                        <span className={cx('label')}>Thời hạn</span>

                        <span className={cx('selectWrap')}>
                            <select
                                value={formData.durationUnit}
                                onChange={(event) =>
                                    onChangeField(
                                        'durationUnit',
                                        event.target.value
                                    )
                                }
                                disabled={isReadOnly}
                            >
                                <option value="month">Hàng tháng</option>
                                <option value="year">Hàng năm</option>
                                <option value="permanent">Vĩnh viễn</option>
                            </select>
                            <MdKeyboardArrowDown />
                        </span>

                        {!isReadOnly && errors.durationUnit ? (
                            <span className={cx('error')}>
                                {errors.durationUnit}
                            </span>
                        ) : null}
                    </label>
                </div>

                <label className={cx('field')}>
                    <span className={cx('label')}>Mô tả ngắn</span>
                    <textarea
                        rows="4"
                        value={formData.description}
                        placeholder="Nhập mô tả ngắn cho gói dịch vụ"
                        onChange={(event) =>
                            onChangeField('description', event.target.value)
                        }
                        disabled={isReadOnly}
                    />
                    {!isReadOnly && errors.description ? (
                        <span className={cx('error')}>
                            {errors.description}
                        </span>
                    ) : null}
                </label>

                <div className={cx('statusSection')}>
                    <span className={cx('label')}>Trạng thái hoạt động</span>

                    <div
                        className={cx('statusToggleCard', {
                            statusToggleCardPaused: !isActive,
                            statusToggleCardReadOnly: isReadOnly,
                        })}
                    >
                        <span className={cx('statusText')}>
                            {isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
                        </span>

                        <button
                            type="button"
                            className={cx('switch', {
                                switchActive: isActive,
                            })}
                            onClick={() =>
                                !isReadOnly &&
                                onChangeField(
                                    'status',
                                    isActive ? 'PAUSED' : 'ACTIVE'
                                )
                            }
                            disabled={isReadOnly}
                            aria-label="Bật tắt trạng thái hoạt động"
                        >
                            <span className={cx('switchThumb')} />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default BasicInfoCard;