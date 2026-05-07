import classNames from 'classnames/bind';
import {
    FiCheck,
    FiChevronDown,
    FiGrid,
    FiInfo,
    FiLayers,
    FiMove,
    FiRefreshCw,
    FiSliders,
    FiStar,
    FiTag,
    FiZap,
} from 'react-icons/fi';

import {
    FONT_OPTIONS,
    INDUSTRY_OPTIONS,
    LAYOUT_OPTIONS,
    SECTION_OPTIONS,
    SPACING_OPTIONS,
    STARTER_PRESETS,
} from './constants';

import styles from './LeftPanel.module.scss';

const cx = classNames.bind(styles);

function LeftPanel({
    isCreate,
    editor,
    enabledSectionCount,
    onChange,
    onAutoGenerateCode,
    onApplyPreset,
    onToggleSection,
    onToggleActive,
    onTogglePremium,
}) {
    return (
        <aside className={cx('leftPanel')}>
            {isCreate && (
                <div className={cx('card')}>
                    <div className={cx('cardTitle')}>
                        <FiZap />
                        <h2>Bắt đầu nhanh</h2>
                    </div>

                    <p className={cx('cardSubtitle')}>
                        Chọn preset để áp dụng nhanh phong cách thiết kế.
                    </p>

                    <div className={cx('presetGrid')}>
                        {STARTER_PRESETS.map((preset) => (
                            <button
                                key={preset.key}
                                type="button"
                                className={cx('presetItem')}
                                onClick={() => onApplyPreset(preset.key)}
                            >
                                <div
                                    className={cx('presetSwatch')}
                                    style={{
                                        background:
                                            preset.config.primaryColor,
                                    }}
                                />
                                <strong>{preset.label}</strong>
                                <small>{preset.description}</small>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className={cx('card')}>
                <div className={cx('cardHeader')}>
                    <div className={cx('cardTitle')}>
                        <FiInfo />
                        <h2>Thông tin cơ bản</h2>
                    </div>

                    <button
                        type="button"
                        className={cx('switch', {
                            active: editor.is_active,
                        })}
                        onClick={onToggleActive}
                        title={
                            editor.is_active
                                ? 'Đang hiển thị'
                                : 'Đang lưu nháp'
                        }
                    >
                        <span />
                    </button>
                </div>

                <label className={cx('field')}>
                    <span>Tên mẫu CV *</span>
                    <input
                        value={editor.name}
                        onChange={(e) => onChange('name', e.target.value)}
                        placeholder="Modern Developer 2024"
                    />
                </label>

                <label className={cx('field')}>
                    <span>
                        Mã mẫu CV {isCreate && '*'}
                        {isCreate && (
                            <button
                                type="button"
                                className={cx('autoBtn')}
                                onClick={onAutoGenerateCode}
                                title="Tự động tạo từ tên"
                            >
                                <FiRefreshCw />
                                Tự động
                            </button>
                        )}
                    </span>
                    <input
                        value={editor.code}
                        onChange={(e) => onChange('code', e.target.value)}
                        placeholder="CV-MODERN-DEVELOPER-001"
                        disabled={!isCreate}
                    />
                </label>

                <label className={cx('field')}>
                    <span>Mô tả ngắn</span>
                    <textarea
                        value={editor.description}
                        onChange={(e) =>
                            onChange('description', e.target.value)
                        }
                        placeholder="Mô tả phong cách và nhóm người dùng phù hợp..."
                        rows={3}
                    />
                </label>

                <div className={cx('twoCols')}>
                    <label className={cx('field')}>
                        <span>
                            <FiTag style={{ marginRight: 4 }} />
                            Danh mục
                        </span>
                        <div className={cx('selectBox')}>
                            <select
                                value={editor.category}
                                onChange={(e) =>
                                    onChange('category', e.target.value)
                                }
                            >
                                {INDUSTRY_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <FiChevronDown />
                        </div>
                    </label>

                    <label className={cx('field')}>
                        <span>
                            <FiStar style={{ marginRight: 4 }} />
                            Loại mẫu
                        </span>
                        <button
                            type="button"
                            className={cx('typeToggle', {
                                premium: editor.is_premium,
                            })}
                            onClick={onTogglePremium}
                        >
                            {editor.is_premium ? 'Premium' : 'Free'}
                        </button>
                    </label>
                </div>

                <p className={cx('hint')}>
                    {editor.is_active
                        ? '✓ Mẫu sẽ hiển thị cho người dùng sau khi lưu'
                        : '⚠ Đang lưu nháp - chưa hiển thị cho người dùng'}
                </p>
            </div>

            <div className={cx('card')}>
                <div className={cx('cardTitle')}>
                    <FiGrid />
                    <h2>Layout CV</h2>
                </div>

                <div className={cx('layoutGrid')}>
                    {LAYOUT_OPTIONS.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            className={cx('layoutItem', {
                                active: editor.layout === item.value,
                            })}
                            onClick={() => onChange('layout', item.value)}
                        >
                            <span className={cx('layoutPreview', item.value)}>
                                <i />
                                <i />
                                <i />
                            </span>

                            <strong>{item.label}</strong>

                            {editor.layout === item.value && (
                                <em>
                                    <FiCheck />
                                </em>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <div className={cx('card')}>
                <div className={cx('cardTitle')}>
                    <FiSliders />
                    <h2>Phong cách</h2>
                </div>

                <div className={cx('styleGrid')}>
                    <label className={cx('subField')}>
                        <span>Màu chủ đạo</span>
                        <div className={cx('colorInput')}>
                            <input
                                type="color"
                                value={editor.primaryColor}
                                onChange={(e) =>
                                    onChange('primaryColor', e.target.value)
                                }
                            />
                            <input
                                type="text"
                                value={editor.primaryColor}
                                onChange={(e) =>
                                    onChange('primaryColor', e.target.value)
                                }
                            />
                        </div>
                    </label>

                    <label className={cx('subField')}>
                        <span>Phông chữ</span>
                        <div className={cx('selectBox')}>
                            <select
                                value={editor.fontFamily}
                                onChange={(e) =>
                                    onChange('fontFamily', e.target.value)
                                }
                            >
                                {FONT_OPTIONS.map((font) => (
                                    <option key={font} value={font}>
                                        {font}
                                    </option>
                                ))}
                            </select>
                            <FiChevronDown />
                        </div>
                    </label>
                </div>

                <div className={cx('spacing')}>
                    <span>Giãn dòng</span>
                    <div>
                        {SPACING_OPTIONS.map((item) => (
                            <button
                                key={item.value}
                                type="button"
                                className={cx({
                                    active: editor.spacing === item.value,
                                })}
                                onClick={() => onChange('spacing', item.value)}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className={cx('card')}>
                <div className={cx('cardHeader')}>
                    <div className={cx('cardTitle')}>
                        <FiLayers />
                        <h2>Cấu trúc CV</h2>
                    </div>

                    <span className={cx('counter')}>
                        {enabledSectionCount}/{SECTION_OPTIONS.length}
                    </span>
                </div>

                <div className={cx('sectionList')}>
                    {SECTION_OPTIONS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            className={cx('sectionItem')}
                            onClick={() => onToggleSection(item.key)}
                        >
                            <FiMove className={cx('dragIcon')} />
                            <span>{item.label}</span>
                            <i
                                className={cx({
                                    on: editor.sections[item.key],
                                })}
                            >
                                <FiCheck />
                            </i>
                        </button>
                    ))}
                </div>
            </div>
        </aside>
    );
}

export default LeftPanel;
