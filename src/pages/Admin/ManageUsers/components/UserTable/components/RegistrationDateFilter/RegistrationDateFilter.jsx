import { useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames/bind";
import { FiCalendar, FiChevronDown } from "react-icons/fi";

import {
  DATE_FILTER_PRESET_OPTIONS,
  getDateFilterLabel,
  getDateRangeFromPreset,
} from "../../userTable.utils";
import styles from "./RegistrationDateFilter.module.scss";

const cx = classNames.bind(styles);

function RegistrationDateFilter({ value, onChange }) {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(value.registeredFrom || "");
  const [draftTo, setDraftTo] = useState(value.registeredTo || "");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const buttonLabel = useMemo(() => getDateFilterLabel(value), [value]);
  const isInvalidRange = Boolean(draftFrom && draftTo && draftFrom > draftTo);

  const handleSelectPreset = (preset) => {
    const nextRange = getDateRangeFromPreset(preset);

    onChange({
      registeredPreset: preset,
      ...nextRange,
    });

    setIsOpen(false);
  };

  const handleApplyCustomRange = () => {
    if (isInvalidRange) return;

    onChange({
      registeredPreset: draftFrom || draftTo ? "custom" : "all",
      registeredFrom: draftFrom,
      registeredTo: draftTo,
    });

    setIsOpen(false);
  };

  const handleClearRange = () => {
    setDraftFrom("");
    setDraftTo("");
    onChange({
      registeredPreset: "all",
      registeredFrom: "",
      registeredTo: "",
    });
    setIsOpen(false);
  };

  const handleTogglePopover = () => {
    if (!isOpen) {
      setDraftFrom(value.registeredFrom || "");
      setDraftTo(value.registeredTo || "");
    }

    setIsOpen((previousState) => !previousState);
  };

  return (
    <div ref={containerRef} className={cx("filterField", { open: isOpen })}>
      <span className={cx("filterLabel")}>Ngày đăng ký</span>

      <button
        type="button"
        className={cx("triggerButton")}
        onClick={handleTogglePopover}
      >
        <span className={cx("triggerContent")}>
          <FiCalendar />
          <span>{buttonLabel}</span>
        </span>

        <FiChevronDown className={cx("triggerIcon")} />
      </button>

      {isOpen ? (
        <div className={cx("popover")}>
          <div className={cx("presetGrid")}>
            {DATE_FILTER_PRESET_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                className={cx("presetButton", {
                  active: value.registeredPreset === option.value,
                })}
                onClick={() => handleSelectPreset(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className={cx("customRange")}>
            <label className={cx("dateField")}>
              <span>Từ ngày</span>
              <input
                type="date"
                value={draftFrom}
                max={draftTo || undefined}
                onChange={(event) => setDraftFrom(event.target.value)}
              />
            </label>

            <label className={cx("dateField")}>
              <span>Đến ngày</span>
              <input
                type="date"
                value={draftTo}
                min={draftFrom || undefined}
                onChange={(event) => setDraftTo(event.target.value)}
              />
            </label>
          </div>

          {isInvalidRange ? (
            <p className={cx("errorText")}>
              Ngày bắt đầu không được lớn hơn ngày kết thúc.
            </p>
          ) : null}

          <div className={cx("actions")}>
            <button
              type="button"
              className={cx("ghostButton")}
              onClick={handleClearRange}
            >
              Xóa ngày
            </button>

            <button
              type="button"
              className={cx("applyButton")}
              onClick={handleApplyCustomRange}
              disabled={isInvalidRange}
            >
              Áp dụng
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default RegistrationDateFilter;
