import { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import {
    FiCheck,
    FiChevronDown,
    FiDroplet,
    FiImage,
    FiMaximize,
    FiType,
} from 'react-icons/fi';
import styles from './DesignTab.module.scss';

const cx = classNames.bind(styles);

const FONTS = [
    'Inter',
    'Roboto',
    'Times New Roman',
    'Calibri',
    'Arial',
    'Merriweather',
];

const COLOR_CONTROLS = [
    { key: 'primary', label: 'Màu chính', fallback: '#2563eb' },
    { key: 'accent', label: 'Màu nhấn', fallback: '#eaf2fb' },
    { key: 'text', label: 'Màu chữ', fallback: '#1f2937' },
    { key: 'background', label: 'Màu nền', fallback: '#ffffff' },
    { key: 'surface', label: 'Màu nền phụ', fallback: '#ffffff' },
    { key: 'muted', label: 'Màu chữ mờ', fallback: '#6b7280' },
    { key: 'border', label: 'Màu viền', fallback: '#dbe2ea' },
    { key: 'icon', label: 'Màu icon', fallback: '#2563eb' },
];

const COLOR_SWATCHES = [
    '#111827',
    '#2563eb',
    '#4f46e5',
    '#0f766e',
    '#b45309',
    '#be123c',
    '#eaf2fb',
    '#f8fafc',
    '#ffffff',
];

const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

const FONT_SIZE_CONTROLS = [
    { key: 'name', label: 'Tên ứng viên', min: 24, max: 54, fallback: 38 },
    { key: 'headline', label: 'Vị trí ứng tuyển', min: 12, max: 28, fallback: 18 },
    {
        key: 'sectionTitle',
        label: 'Tiêu đề mục',
        min: 12,
        max: 30,
        fallback: 20,
    },
    { key: 'body', label: 'Nội dung', min: 10, max: 20, fallback: 14 },
    { key: 'small', label: 'Chữ nhỏ', min: 9, max: 18, fallback: 13 },
];

const SPACING_CONTROLS = [
    {
        key: 'itemGap',
        label: 'Khoảng cách item',
        min: 4,
        max: 32,
        fallback: 12,
    },
    {
        key: 'sectionGap',
        label: 'Khoảng cách section',
        min: 8,
        max: 48,
        fallback: 24,
    },
    {
        key: 'pagePaddingX',
        label: 'Padding ngang',
        min: 0,
        max: 48,
        fallback: 12,
    },
    {
        key: 'pagePaddingY',
        label: 'Padding dọc',
        min: 0,
        max: 48,
        fallback: 12,
    },
    {
        key: 'bulletGap',
        label: 'Khoảng cách bullet',
        min: 2,
        max: 24,
        fallback: 8,
    },
];

function getNumber(value, fallback) {
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? fallback : numericValue;
}

function normalizeHexColor(value, fallback = '#000000') {
    const rawValue = String(value || '').trim();
    const withHash = rawValue.startsWith('#') ? rawValue : `#${rawValue}`;

    if (HEX_COLOR_PATTERN.test(withHash)) {
        return withHash.toLowerCase();
    }

    return fallback.toLowerCase();
}

function getAvatarSectionKey(sections = {}) {
    const entries = Object.entries(sections);
    const sectionWithAvatar = entries.find(
        ([, section]) => section?.options?.avatar,
    );

    if (sectionWithAvatar) return sectionWithAvatar[0];

    const profileSection = entries.find(([, section]) => {
        const type = String(section?.type || '').toLowerCase();
        return type === 'profile_header' || type === 'profile';
    });

    return profileSection?.[0] || '';
}

function SliderControl({ label, value, min, max, suffix = 'px', onChange }) {
    return (
        <div className={cx('slider-container')}>
            <div className={cx('slider-info')}>
                <span>{label}</span>
                <span className={cx('badge')}>
                    {value}
                    {suffix}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step="1"
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
            />
        </div>
    );
}

function ColorPickerControl({
    control,
    value,
    isOpen = false,
    onToggle,
    onClose,
    onChange,
}) {
    const wrapperRef = useRef(null);
    const safeValue = normalizeHexColor(value, control.fallback);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleClickOutside = (event) => {
            if (wrapperRef.current?.contains(event.target)) return;
            onClose?.();
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen, onClose]);

    const handleChange = (nextColor) => {
        onChange?.(normalizeHexColor(nextColor, safeValue));
    };

    return (
        <div ref={wrapperRef} className={cx('colorPicker', { open: isOpen })}>
            <button
                type="button"
                className={cx('color-row')}
                onClick={onToggle}
                aria-expanded={isOpen}
            >
                <span className={cx('colorLabel')}>{control.label}</span>
                <span className={cx('colorPreviewGroup')}>
                    <span className={cx('colorValue')}>
                        {safeValue.toUpperCase()}
                    </span>
                    <span
                        className={cx('colorSwatch')}
                        style={{ backgroundColor: safeValue }}
                    />
                    <FiChevronDown />
                </span>
            </button>

            {isOpen ? (
                <div className={cx('colorPopover')} role="dialog">
                    <div className={cx('swatchGrid')}>
                        {COLOR_SWATCHES.map((color) => (
                            <button
                                key={color}
                                type="button"
                                className={cx('swatchButton', {
                                    active: color === safeValue,
                                })}
                                onClick={() => handleChange(color)}
                                title={color.toUpperCase()}
                            >
                                <span style={{ backgroundColor: color }} />
                                {color === safeValue ? <FiCheck /> : null}
                            </button>
                        ))}
                    </div>

                    <label className={cx('nativeColorControl')}>
                        <span>Chọn màu khác</span>
                        <input
                            type="color"
                            value={safeValue}
                            onChange={(event) => handleChange(event.target.value)}
                        />
                    </label>
                </div>
            ) : null}
        </div>
    );
}

function DesignTab({ templateConfig = {}, onChangeConfig }) {
    const [activeColorKey, setActiveColorKey] = useState('');
    const theme = templateConfig?.theme || {};
    const colors = theme?.colors || {};
    const spacing = theme?.spacing || {};
    const fontSize =
        theme?.fontSize && typeof theme.fontSize === 'object'
            ? theme.fontSize
            : { body: theme?.fontSize };
    const sections = templateConfig?.sections || {};
    const avatarSectionKey = getAvatarSectionKey(sections);
    const avatarSection = sections?.[avatarSectionKey] || {};
    const avatarOptions = avatarSection?.options?.avatar || {};

    const updateTheme = (patch) => {
        onChangeConfig?.({
            ...templateConfig,
            theme: { ...theme, ...patch },
        });
    };

    const updateNestedTheme = (key, patch) => {
        onChangeConfig?.({
            ...templateConfig,
            theme: {
                ...theme,
                [key]: { ...(theme?.[key] || {}), ...patch },
            },
        });
    };

    const updateAvatarOptions = (patch) => {
        if (!avatarSectionKey) return;

        onChangeConfig?.({
            ...templateConfig,
            sections: {
                ...sections,
                [avatarSectionKey]: {
                    ...avatarSection,
                    options: {
                        ...(avatarSection?.options || {}),
                        avatar: {
                            ...avatarOptions,
                            ...patch,
                        },
                    },
                },
            },
        });
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('section')}>
                <div className={cx('section-header')}>
                    <FiType className={cx('icon')} />
                    <h3>Phông chữ</h3>
                </div>
                <div className={cx('input-group')}>
                    <select
                        value={theme?.fontFamily || 'Inter'}
                        onChange={(event) =>
                            updateTheme({ fontFamily: event.target.value })
                        }
                    >
                        {FONTS.map((font) => (
                            <option key={font} value={font}>
                                {font}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={cx('controlStack')}>
                    {FONT_SIZE_CONTROLS.map((control) => (
                        <SliderControl
                            key={control.key}
                            label={control.label}
                            min={control.min}
                            max={control.max}
                            value={getNumber(
                                fontSize?.[control.key],
                                control.fallback,
                            )}
                            onChange={(value) =>
                                updateNestedTheme('fontSize', {
                                    [control.key]: value,
                                })
                            }
                        />
                    ))}
                </div>
            </div>

            <div className={cx('section')}>
                <div className={cx('section-header')}>
                    <FiDroplet className={cx('icon')} />
                    <h3>Màu sắc</h3>
                </div>
                <div className={cx('color-list')}>
                    {COLOR_CONTROLS.map((control) => (
                        <ColorPickerControl
                            key={control.key}
                            control={control}
                            value={colors?.[control.key] || control.fallback}
                            isOpen={activeColorKey === control.key}
                            onToggle={() =>
                                setActiveColorKey((prev) =>
                                    prev === control.key ? '' : control.key,
                                )
                            }
                            onClose={() => setActiveColorKey('')}
                            onChange={(nextColor) =>
                                updateNestedTheme('colors', {
                                    [control.key]: nextColor,
                                })
                            }
                        />
                    ))}
                </div>
            </div>

            <div className={cx('section')}>
                <div className={cx('section-header')}>
                    <FiMaximize className={cx('icon')} />
                    <h3>Khoảng cách</h3>
                </div>
                <div className={cx('controlStack')}>
                    {SPACING_CONTROLS.map((control) => (
                        <SliderControl
                            key={control.key}
                            label={control.label}
                            min={control.min}
                            max={control.max}
                            value={getNumber(
                                spacing?.[control.key],
                                control.fallback,
                            )}
                            onChange={(value) =>
                                updateNestedTheme('spacing', {
                                    [control.key]: value,
                                })
                            }
                        />
                    ))}
                </div>
            </div>

            {avatarSectionKey && (
                <div className={cx('section')}>
                    <div className={cx('section-header')}>
                        <FiImage className={cx('icon')} />
                        <h3>Ảnh đại diện</h3>
                    </div>

                    <div className={cx('format-row')}>
                        <span>Hình dạng</span>
                        <div className={cx('segmented-control')}>
                            {['square', 'rounded', 'circle'].map((shape) => (
                                <button
                                    key={shape}
                                    type="button"
                                    className={cx({
                                        active:
                                            (avatarOptions?.shape ||
                                                'square') === shape,
                                    })}
                                    onClick={() =>
                                        updateAvatarOptions({ shape })
                                    }
                                >
                                    {shape === 'square'
                                        ? 'Vuông'
                                        : shape === 'rounded'
                                          ? 'Bo góc'
                                          : 'Tròn'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={cx('controlStack')}>
                        <SliderControl
                            label="Chiều rộng"
                            min={48}
                            max={180}
                            value={getNumber(avatarOptions?.width, 96)}
                            onChange={(value) =>
                                updateAvatarOptions({ width: value })
                            }
                        />
                        <SliderControl
                            label="Chiều cao"
                            min={48}
                            max={180}
                            value={getNumber(
                                avatarOptions?.height,
                                avatarOptions?.width || 96,
                            )}
                            onChange={(value) =>
                                updateAvatarOptions({ height: value })
                            }
                        />
                    </div>

                    <div className={cx('input-group')}>
                        <label className={cx('selectLabel')}>Cách hiển thị ảnh</label>
                        <select
                            value={avatarOptions?.objectFit || 'contain'}
                            onChange={(event) =>
                                updateAvatarOptions({
                                    objectFit: event.target.value,
                                })
                            }
                        >
                            <option value="cover">Cắt vừa khung</option>
                            <option value="contain">Hiển thị toàn bộ</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DesignTab;
