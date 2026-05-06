import classNames from "classnames/bind";
import { FiDownload, FiFileText, FiGrid, FiX } from "react-icons/fi";

import Modal from "~/components/Modal";

import styles from "./ActionModal.module.scss";

const cx = classNames.bind(styles);

const EXPORT_OPTIONS = [
  {
    value: "json",
    label: "Xuất dưới dạng JSON",
    description: "Tệp dữ liệu cấu trúc JSON (.json)",
    Icon: FiFileText,
    tone: "json",
  },
  {
    value: "excel",
    label: "Xuất dưới dạng Excel",
    description: "Tệp bảng tính Microsoft Excel (.xlsx)",
    Icon: FiGrid,
    tone: "excel",
  },
];

function ActionModal({
  isOpen = false,
  isSubmitting = false,
  selectedFormat = "json",
  onFormatChange,
  onClose,
  onConfirm,
}) {
  const footer = (
    <div className={cx("footerActions")}>
      <button
        type="button"
        className={cx("ghostButton")}
        onClick={onClose}
        disabled={isSubmitting}
      >
        Hủy bỏ
      </button>

      <button
        type="button"
        className={cx("primaryButton")}
        onClick={() => onConfirm?.(selectedFormat)}
        disabled={isSubmitting}
      >
        <FiDownload />
        <span>{isSubmitting ? "Đang xuất dữ liệu..." : "Tải xuống ngay"}</span>
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={isSubmitting ? undefined : onClose}
      size="lg"
      showCloseButton={false}
      className={cx("modal")}
      footer={footer}
      closeOnOverlayClick={!isSubmitting}
    >
      <div className={cx("wrapper")}>
        <div className={cx("header")}>
          <div className={cx("titleWrap")}>
            <span className={cx("titleIcon")}>
              <FiDownload />
            </span>
            <h3 className={cx("title")}>Xuất Dữ liệu</h3>
          </div>

          <button
            type="button"
            className={cx("closeButton")}
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Đóng modal"
          >
            <FiX />
          </button>
        </div>

        <div className={cx("body")}>
          <p className={cx("sectionLabel")}>Chọn định dạng tệp</p>

          <div className={cx("optionList")}>
            {EXPORT_OPTIONS.map((option) => {
              const Icon = option.Icon;
              const isActive = selectedFormat === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={cx("optionCard", option.tone, {
                    active: isActive,
                  })}
                  onClick={() => onFormatChange?.(option.value)}
                  disabled={isSubmitting}
                >
                  <span className={cx("optionIcon")}>
                    <Icon />
                  </span>

                  <span className={cx("optionContent")}>
                    <span className={cx("optionTitle")}>{option.label}</span>
                    <span className={cx("optionDescription")}>
                      {option.description}
                    </span>
                  </span>

                  <span
                    className={cx("radioIndicator", {
                      active: isActive,
                    })}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ActionModal;
