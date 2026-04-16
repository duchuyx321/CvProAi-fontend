import classNames from 'classnames/bind';
import { FiType, FiDroplet, FiMaximize, FiLayout } from 'react-icons/fi';
import styles from './DesignTab.module.scss';

const cx = classNames.bind(styles);

const PRESET_COLORS = ['#f24df5', '#0f172a', '#059669', '#7c3aed'];
const FONTS = ['Inter', 'Roboto', 'Times New Roman', 'Calibri', 'Arial', 'Merriweather'];

function DesignTab({ templateConfig = {}, onChangeConfig }) {
    const theme = templateConfig?.theme || {};
    const colors = theme?.colors || {};
    const spacing = theme?.spacing || {};

    const primaryColor = colors?.primary || '#2563eb';
    const fontFamily = theme?.fontFamily || 'Inter';
    const fontSize = theme?.fontSize || 12;
    const itemGap = spacing?.itemGap ?? 12;
    const sectionGap = spacing?.sectionGap ?? 24;
    const avatarShape = theme?.avatar_shape || 'square';

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


    const getSliderStyle = (val, min, max) => {
        const pct = ((val - min) / (max - min)) * 100;
        return {
            background: `linear-gradient(to right, ${primaryColor} ${pct}%, #e2e8f0 ${pct}%)`
        };
    };

    return (
        <div className={cx('wrapper')}>
           
            <div className={cx('section')}>
                <div className={cx('section-header')}>
                    <FiType className={cx('icon')} />
                    <h3>Phông chữ</h3>
                </div>
                <div className={cx('input-group')}>
                    <select value={fontFamily} onChange={(e) => updateTheme({ fontFamily: e.target.value })}>
                        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                </div>
            </div>

            
            <div className={cx('section')}>
                <div className={cx('section-header')}>
                    <FiDroplet className={cx('icon')} />
                    <h3>Màu chủ đạo</h3>
                </div>
                <div className={cx('color-grid')}>
                    {PRESET_COLORS.map(color => (
                        <button
                            key={color}
                            className={cx('color-btn', { active: primaryColor === color })}
                            style={{ backgroundColor: color }}
                            onClick={() => updateNestedTheme('colors', { primary: color })}
                        />
                    ))}
                    <div className={cx('custom-color-btn')}>
                        <input 
                            type="color" 
                            value={primaryColor} 
                            onChange={(e) => updateNestedTheme('colors', { primary: e.target.value })} 
                        />
                        <div className={cx('rainbow-ring')}></div>
                        <div className={cx('inner-color')} style={{ backgroundColor: primaryColor }}></div>
                    </div>
                </div>
            </div>

            
            <div className={cx('section')}>
                <div className={cx('section-header')}>
                    <FiMaximize className={cx('icon')} />
                    <h3>Kích thước chữ</h3>
                </div>
                <div className={cx('slider-container')}>
                    <div className={cx('slider-info')}>
                        <span>FONT SIZE</span>
                        <span className={cx('badge')}>{fontSize}px</span>
                    </div>
                    <input 
                        type="range" min="10" max="16" step="1" 
                        value={fontSize} 
                        style={getSliderStyle(fontSize, 10, 16)}
                        onChange={(e) => updateTheme({ fontSize: Number(e.target.value) })}
                    />
                    <div className={cx('slider-labels')}>
                        <span>Nhỏ</span>
                        <span>Vừa</span>
                        <span>Lớn</span>
                    </div>
                </div>
            </div>

            
            <div className={cx('section')}>
                <div className={cx('section-header')}>
                    <FiMaximize className={cx('icon')} />
                    <h3>Khoảng cách</h3>
                </div>
                <div className={cx('slider-container')}>
                    <div className={cx('slider-info')}>
                        <span>KHOẢNG CÁCH ITEM</span>
                        <span className={cx('badge')}>{itemGap}px</span>
                    </div>
                    <input 
                        type="range" min="8" max="24" 
                        value={itemGap} 
                        style={getSliderStyle(itemGap, 8, 24)}
                        onChange={(e) => updateNestedTheme('spacing', { itemGap: Number(e.target.value) })}
                    />
                </div>
                <div className={cx('slider-container')}>
                    <div className={cx('slider-info')}>
                        <span>KHOẢNG CÁCH SECTION</span>
                        <span className={cx('badge')}>{sectionGap}px</span>
                    </div>
                    <input 
                        type="range" min="12" max="40" 
                        value={sectionGap} 
                        style={getSliderStyle(sectionGap, 12, 40)}
                        onChange={(e) => updateNestedTheme('spacing', { sectionGap: Number(e.target.value) })}
                    />
                </div>
            </div>

            
            <div className={cx('section')}>
                <div className={cx('section-header')}>
                    <FiLayout className={cx('icon')} />
                    <h3>Định dạng</h3>
                </div>
                <div className={cx('format-row')}>
                    <span>Bo góc ảnh đại diện</span>
                    <div className={cx('segmented-control')}>
                        <button 
                            className={cx({ active: avatarShape === 'square' })}
                            onClick={() => updateTheme({ avatar_shape: 'square' })}
                        >Vuông</button>
                        <button 
                            className={cx({ active: avatarShape === 'circle' })}
                            onClick={() => updateTheme({ avatar_shape: 'circle' })}
                        >Tròn</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DesignTab;