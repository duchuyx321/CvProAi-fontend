import React from "react";
import classNames from "classnames/bind";
import styles from "./ResultAi.module.scss";
import { extractItemText, prettifyKey } from "./utils";

const cx = classNames.bind(styles);

function FeedbackValue({ value }) {
  if (value == null) return <span className={cx("muted")}>Chưa có</span>;

  if (typeof value === "string" || typeof value === "number") {
    return <p className={cx("feedbackText")}>{String(value)}</p>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className={cx("muted")}>Chưa có</span>;
    return (
      <ul className={cx("bulletList")}>
        {value.map((item, index) => (
          <li key={`${index}-${extractItemText(item)}`}>
            {extractItemText(item)}
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === "object") {
    const entries = Object.entries(value);
    if (entries.length === 0)
      return <span className={cx("muted")}>Chưa có</span>;
    return (
      <div className={cx("kvGrid")}>
        {entries.map(([key, item]) => (
          <div key={key} className={cx("kvItem")}>
            <div className={cx("kvKey")}>{prettifyKey(key)}</div>
            <div className={cx("kvValue")}>
              <FeedbackValue value={item} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <p className={cx("feedbackText")}>{String(value)}</p>;
}

export default FeedbackValue;
