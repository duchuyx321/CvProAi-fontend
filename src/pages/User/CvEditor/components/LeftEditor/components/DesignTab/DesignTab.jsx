import classNames from 'classnames/bind';
import { FiType, FiDroplet, FiMaximize } from 'react-icons/fi';
import styles from './DesignTab.module.scss';

const cx = classNames.bind(styles);

const PRESET_COLORS = [
    '#008080',
    '#0f766e',
    '#2563eb',
    '#7c3aed',
    '#dc2626',
    '#ea580c',
    '#16a34a',
    '#0f172a',
];

const FONTS = ['Inter', 'Roboto', 'Arial', 'Merriweather'];

function DesignTab({ templateConfig = {}, onChangeConfig }) {
    const theme = templateConfig?.theme || {};
    const colors = theme?.colors || {};
    const spacing = theme?.spacing || {};

    const primaryColor = colors?.primary || '#008080';
    const fontFamily = theme?.fontFamily || 'Inter';
    const itemGap = spacing?.itemGap ?? 12;
    const sectionGap = spacing?.sectionGap ?? 24;

    const updateTheme = (patch) => {
        if (!onChangeConfig) return;

        onChangeConfig({
            ...templateConfig,
            theme: {
                ...theme,
                ...patch,
            },
        });
    };

    const updateNestedTheme = (key, patch) => {
        if (!onChangeConfig) return;

        onChangeConfig({
            ...templateConfig,
            theme: {
                ...theme,
                [key]: {
                    ...(theme?.[key] || {}),
                    ...patch,
                },
            },
        });
    };

    const getSliderBackground = (value, min, max) => {
        const percentage = ((value - min) / (max - min)) * 100;
        return `linear-gradient(to right, #3b82f6 ${percentage}%, #e2e8f0 ${percentage}%)`;
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('section')}>
                <div className={cx('section-header')}>
                    <FiType className={cx('icon')} />
                    <h3>Phông chữ</h3>
                </div>

                <div className={cx('section-body')}>
                    <div className={cx('input-group')}>
                        <label>KIỂU CHỮ</label>
                        <select
                            value={fontFamily}
                            onChange={(e) =>
                                updateTheme({ fontFamily: e.target.value })
                            }
                        >
                            {FONTS.map((font) => (
                                <option key={font} value={font}>
                                    {font}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className={cx('section')}>
                <div className={cx('section-header')}>
                    <FiDroplet className={cx('icon')} />
                    <h3>Màu chủ đạo</h3>
                </div>

                <div className={cx('section-body')}>
                    <div className={cx('color-picker-group')}>
                        {PRESET_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                className={cx('color-circle', {
                                    active: primaryColor === color,
                                })}
                                style={{ backgroundColor: color }}
                                onClick={() =>
                                    updateNestedTheme('colors', {
                                        primary: color,
                                    })
                                }
                                title={color}
                            />
                        ))}

                        <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) =>
                                updateNestedTheme('colors', {
                                    primary: e.target.value,
                                })
                            }
                            className={cx('native-color')}
                            title="Chọn màu tùy chỉnh"
                        />
                    </div>
                </div>
            </div>

            <div className={cx('section')}>
                <div className={cx('section-header')}>
                    <FiMaximize className={cx('icon')} />
                    <h3>Khoảng cách</h3>
                </div>

                <div className={cx('section-body')}>
                    <div className={cx('slider-group')}>
                        <div className={cx('slider-labels')}>
                            <label>KHOẢNG CÁCH ITEM</label>
                            <span className={cx('value-badge')}>
                                {itemGap}px
                            </span>
                        </div>
                        <input
                            type="range"
                            min="8"
                            max="24"
                            step="1"
                            value={itemGap}
                            onChange={(e) =>
                                updateNestedTheme('spacing', {
                                    itemGap: Number(e.target.value),
                                })
                            }
                            style={{
                                background: getSliderBackground(itemGap, 8, 24),
                            }}
                        />
                    </div>

                    <div className={cx('slider-group')}>
                        <div className={cx('slider-labels')}>
                            <label>KHOẢNG CÁCH SECTION</label>
                            <span className={cx('value-badge')}>
                                {sectionGap}px
                            </span>
                        </div>
                        <input
                            type="range"
                            min="12"
                            max="40"
                            step="1"
                            value={sectionGap}
                            onChange={(e) =>
                                updateNestedTheme('spacing', {
                                    sectionGap: Number(e.target.value),
                                })
                            }
                            style={{
                                background: getSliderBackground(
                                    sectionGap,
                                    12,
                                    40,
                                ),
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DesignTab;
