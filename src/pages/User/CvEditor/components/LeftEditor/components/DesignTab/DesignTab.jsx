import React from "react";
import classNames from "classnames/bind";
import { FiType, FiDroplet, FiMaximize, FiLayout } from "react-icons/fi";
import styles from "./DesignTab.module.scss";

const cx = classNames.bind(styles);

const PRESET_COLORS = ["#1d4ed8", "#0f172a", "#10b981", "#8b5cf6"];
const FONTS = ["Inter (Mặc định)", "Roboto", "Arial", "Merriweather"];

function DesignTab({ templateConfig = {}, onChangeConfig }) {
  const theme = templateConfig.theme || {};
  const primaryColor = theme.colors?.primary || "#1d4ed8";
  
  const fontFamily = theme.typography?.font_family || "Inter (Mặc định)";
  const fontSize = theme.typography?.font_size || 12; 
  
  const lineHeight = theme.spacing?.line_height || 1.5; 
  const sectionGap = theme.spacing?.section_gap || 24; // <-- Biến mới cho Khoảng cách mục
  
  const avatarShape = theme.format?.avatar_shape || "square"; 
  const showDivider = theme.format?.show_divider ?? true;

  const handleThemeChange = (category, key, value) => {
    if (!onChangeConfig) return;

    const newConfig = {
      ...templateConfig,
      theme: {
        ...theme,
        [category]: {
          ...(theme[category] || {}),
          [key]: value,
        },
      },
    };
    onChangeConfig(newConfig);
  };

  // Tính phần trăm để tô màu xanh cho thanh trượt linh động theo min/max
  const getSliderBackground = (value, min, max) => {
    const percentage = ((value - min) / (max - min)) * 100;
    return `linear-gradient(to right, #3b82f6 ${percentage}%, #e2e8f0 ${percentage}%)`;
  };

  return (
    <div className={cx("wrapper")}>
      
      {/* ================== 1. PHÔNG CHỮ ================== */}
      <div className={cx("section")}>
        <div className={cx("section-header")}>
          <FiType className={cx("icon")} />
          <h3>Phông chữ</h3>
        </div>
        
        <div className={cx("section-body")}>
          <div className={cx("input-group")}>
            <label>KIỂU CHỮ</label>
            <select
              value={fontFamily}
              onChange={(e) => handleThemeChange("typography", "font_family", e.target.value)}
            >
              {FONTS.map((font) => (
                <option key={font} value={font}>{font}</option>
              ))}
            </select>
          </div>

          <div className={cx("slider-group")}>
            <div className={cx("slider-labels")}>
              <label>KÍCH THƯỚC CHỮ</label>
              <span className={cx("value-badge")}>{fontSize}px</span>
            </div>
            <input
              type="range"
              min="10"
              max="18"
              step="1"
              value={fontSize}
              onChange={(e) => handleThemeChange("typography", "font_size", Number(e.target.value))}
              style={{ background: getSliderBackground(fontSize, 10, 18) }}
            />
            <div className={cx("slider-marks")}>
              <span>Nhỏ</span>
              <span>Vừa</span>
              <span>Lớn</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================== 2. MÀU SẮC CHỦ ĐẠO ================== */}
      <div className={cx("section")}>
        <div className={cx("section-header")}>
          <FiDroplet className={cx("icon")} />
          <h3>Màu sắc chủ đạo</h3>
        </div>
        <div className={cx("section-body")}>
          <div className={cx("color-picker-group")}>
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={cx("color-circle", { active: primaryColor === color })}
                style={{ backgroundColor: color }}
                onClick={() => handleThemeChange("colors", "primary", color)}
                title={color}
              />
            ))}
            
            <div className={cx("custom-color-wrapper", { active: !PRESET_COLORS.includes(primaryColor) })}>
              <div className={cx("rainbow-border")}></div>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => handleThemeChange("colors", "primary", e.target.value)}
                title="Chọn màu tùy chỉnh"
              />
              <div className={cx("inner-circle")} style={{ backgroundColor: primaryColor }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* ================== 3. KHOẢNG CÁCH ================== */}
      <div className={cx("section")}>
        <div className={cx("section-header")}>
          <FiMaximize className={cx("icon")} />
          <h3>Khoảng cách</h3>
        </div>
        <div className={cx("section-body")}>
          
          {/* Thanh trượt 1: Giãn dòng */}
          <div className={cx("slider-group")}>
            <div className={cx("slider-labels")}>
              <label>GIÃN DÒNG</label>
              <span className={cx("value-badge")}>{lineHeight.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.0"
              step="0.1"
              value={lineHeight}
              onChange={(e) => handleThemeChange("spacing", "line_height", Number(e.target.value))}
              style={{ background: getSliderBackground(lineHeight, 1.0, 2.0) }}
            />
            <div className={cx("slider-marks")}>
              <span>1.0</span>
              <span>1.5</span>
              <span>2.0</span>
            </div>
          </div>

          {/* Thanh trượt 2: Giãn mục (Mới thêm) */}
          <div className={cx("slider-group")}>
            <div className={cx("slider-labels")}>
              <label>KHOẢNG CÁCH MỤC</label>
              <span className={cx("value-badge")}>{sectionGap}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="40"
              step="2"
              value={sectionGap}
              onChange={(e) => handleThemeChange("spacing", "section_gap", Number(e.target.value))}
              style={{ background: getSliderBackground(sectionGap, 16, 40) }}
            />
            <div className={cx("slider-marks")}>
              <span>Hẹp</span>
              <span>Vừa</span>
              <span>Rộng</span>
            </div>
          </div>

        </div>
      </div>

      {/* ================== 4. ĐỊNH DẠNG ================== */}
      <div className={cx("section")}>
        <div className={cx("section-header")}>
          <FiLayout className={cx("icon")} />
          <h3>Định dạng</h3>
        </div>
        <div className={cx("section-body")}>
          
          <div className={cx("format-row")}>
            <span className={cx("format-label")}>Bo góc ảnh đại diện</span>
            <div className={cx("segmented-control")}>
              <button 
                className={cx({ active: avatarShape === "square" })}
                onClick={() => handleThemeChange("format", "avatar_shape", "square")}
              >
                Vuông
              </button>
              <button 
                className={cx({ active: avatarShape === "circle" })}
                onClick={() => handleThemeChange("format", "avatar_shape", "circle")}
              >
                Tròn
              </button>
            </div>
          </div>

          <div className={cx("divider-line")}></div>

          <div className={cx("format-row")}>
            <span className={cx("format-label")}>Đường kẻ phân cách</span>
            <label className={cx("switch")}>
              <input 
                type="checkbox" 
                checked={showDivider}
                onChange={(e) => handleThemeChange("format", "show_divider", e.target.checked)}
              />
              <span className={cx("slider", "round")}></span>
            </label>
          </div>

        </div>
      </div>

    </div>
  );
}

export default DesignTab;