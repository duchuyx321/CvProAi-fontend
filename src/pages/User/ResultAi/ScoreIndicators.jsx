// thanh bar và vòng tròn điểm số
import React from "react";
import classNames from "classnames/bind";
import styles from "./ResultAi.module.scss";
import { scoreToPercent, formatScore } from "./utils";

const cx = classNames.bind(styles);

export function ScoreRing({ title, score, subtitle }) {
  const percent = scoreToPercent(score);

  return (
    <div className={cx("ringCard")}>
      <div className={cx("ring")} style={{ "--p": `${percent}%` }}>
        <div className={cx("ringInner")}>
          <div className={cx("ringValue")}>{formatScore(score)}</div>
          <div className={cx("ringUnit")}>/ 100</div>
        </div>
      </div>
      <div className={cx("ringMeta")}>
        <div className={cx("ringTitle")}>{title}</div>
        {subtitle ? <div className={cx("ringSubtitle")}>{subtitle}</div> : null}
      </div>
    </div>
  );
}

export function ScoreBar({ label, score }) {
  const percent = scoreToPercent(score);
  const displayValue = formatScore(score);

  return (
    <div className={cx("barRow")}>
      <div className={cx("barTop")}>
        <span className={cx("barLabel")}>{label}</span>
        <span className={cx("barValue")}>{displayValue}</span>
      </div>
      <div className={cx("barTrack")}>
        <div className={cx("barFill")} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
