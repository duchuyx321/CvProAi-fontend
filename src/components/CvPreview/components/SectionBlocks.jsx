import classNames from "classnames/bind";
import styles from "../CvPreview.module.scss";
import RichText from "./RichText";
import { renderFieldList } from "./FieldRenderer";
import {
  getDateText,
  isEmpty,
  resolveFieldValue,
} from "../utils/previewHelpers";

const cx = classNames.bind(styles);

export function ProfileSection({ section, data, content, layoutType }) {
  const name = resolveFieldValue("full_name", data, content);
  const headline = resolveFieldValue("headline", data, content);
  const avatar = resolveFieldValue("avatar_url", data, content);
  const variant = `${section?.variant || ""}`;

  if (layoutType === "BANNER_SPLIT" || variant.includes("banner")) {
    return (
      <div className={cx("profileBanner")}>
        <div className={cx("profileBannerContent")}>
          <div className={cx("profileBannerInfo")}>
            {name ? (
              <div className={cx("fullName", "fullNameLight")}>{name}</div>
            ) : null}
            {headline ? (
              <div className={cx("headline", "headlineLight")}>{headline}</div>
            ) : null}
          </div>

          {avatar ? (
            <div className={cx("profileBannerAvatar")}>
              <div className={cx("profileTopInfo")}>
                <img
                  src={avatar}
                  alt={name || "avatar"}
                  className={cx("avatarRect")}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  if (layoutType === "STACK" || variant.includes("top_header")) {
    return (
      <div className={cx("profileTop")}>
        {avatar ? (
          <img
            src={avatar}
            alt={name || "avatar"}
            className={cx("avatarCircle")}
          />
        ) : null}

        <div className={cx("profileTopInfo")}>
          {name ? <div className={cx("fullName")}>{name}</div> : null}
          {headline ? (
            <div className={cx("headline", "headlineUnderline")}>
              {headline}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cx("profileSidebar")}>
      {avatar ? (
        <img src={avatar} alt={name || "avatar"} className={cx("avatarRect")} />
      ) : null}

      {headline ? <div className={cx("headlinePill")}>{headline}</div> : null}

      {name ? (
        <div className={cx("fullName", "fullNameUpper")}>{name}</div>
      ) : null}
    </div>
  );
}

export function ContactSection({ section, data, content }) {
  const fields =
    Array.isArray(section?.fields) && section.fields.length
      ? section.fields.filter((item) => typeof item === "string")
      : Object.keys(data || {});

  return (
    <div className={cx("contactList")}>
      {fields.map((field) => {
        const value = resolveFieldValue(field, data, content);
        if (isEmpty(value)) return null;

        return (
          <div key={field} className={cx("contactItem")}>
            <span className={cx("contactDot")} />
            <span className={cx("contactText")}>{String(value)}</span>
          </div>
        );
      })}
    </div>
  );
}

export function SkillsSection({ section, data = [] }) {
  if (!Array.isArray(data) || !data.length) return null;

  const variant = section?.variant || "auto";

  const hasVisualLevel = data.some(
    (item) => typeof item?.level === "number" && !Number.isNaN(item.level),
  );

  const shouldShowBar =
    (variant === "progress_bar" || variant === "auto") && hasVisualLevel;

  const shouldShowDot =
    (variant === "dot_level" || variant === "dot") && hasVisualLevel;

  if (shouldShowBar) {
    return (
      <div className={cx("skillsList")}>
        {data.map((item, index) => {
          const level = Math.max(0, Math.min(Number(item?.level || 0), 100));

          return (
            <div key={index} className={cx("skillProgressItem")}>
              <div className={cx("skillName")}>{item?.name || ""}</div>
              <div className={cx("skillBar")}>
                <div
                  className={cx("skillBarFill")}
                  style={{ width: `${level}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (shouldShowDot) {
    return (
      <div className={cx("skillsList")}>
        {data.map((item, index) => {
          const level = Math.max(0, Math.min(Number(item?.level || 0), 5));

          return (
            <div key={index} className={cx("skillDotItem")}>
              <div className={cx("skillName")}>{item?.name || ""}</div>
              <div className={cx("skillDots")}>
                {[1, 2, 3, 4, 5].map((dot) => (
                  <span
                    key={dot}
                    className={cx("skillDot", {
                      skillDotActive: dot <= level,
                    })}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cx("skillsList", "skillsTextOnly")}>
      {data.map((item, index) => (
        <span key={index} className={cx("skillTextChip")}>
          {item?.name || item?.description || ""}
        </span>
      ))}
    </div>
  );
}
export function EducationSection({ data = [] }) {
  if (!Array.isArray(data) || !data.length) return null;

  return (
    <div className={cx("cardList")}>
      {data.map((item, index) => {
        const dateText = getDateText(item);

        return (
          <div key={index} className={cx("cardItem")}>
            <div className={cx("eduHeader")}>
              <div className={cx("eduMain")}>
                {item?.degree ? (
                  <div className={cx("eduDegree")}>{item.degree}</div>
                ) : null}

                {item?.school ? (
                  <div className={cx("eduSchool")}>{item.school}</div>
                ) : null}
              </div>

              {dateText ? (
                <div className={cx("dateBadge")}>{dateText}</div>
              ) : null}
            </div>

            {item?.description ? (
              <div className={cx("eduDesc")}>
                <RichText value={item.description} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export function ArraySection({ section, data, content }) {
  if (!Array.isArray(data) || !data.length) return null;

  const variant = `${section?.variant || ""}`;
  const leftDate = variant.includes("left_date");

  return (
    <div className={cx("cardList")}>
      {data.map((item, index) => {
        const dateText = getDateText(item);

        return (
          <div key={index} className={cx("cardItem", { cardFlat: leftDate })}>
            {leftDate ? (
              <div className={cx("cardSplit")}>
                <div className={cx("dateLeft")}>{dateText}</div>
                <div className={cx("cardBody")}>
                  {renderFieldList(section?.fields || [], item, content, true)}
                </div>
              </div>
            ) : (
              <div className={cx("cardTop")}>
                <div className={cx("cardBody")}>
                  {renderFieldList(section?.fields || [], item, content, true)}
                </div>

                {dateText ? (
                  <div className={cx("dateBadge")}>{dateText}</div>
                ) : null}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function ObjectSection({ section, data, content }) {
  if (typeof data === "string") {
    return <RichText value={data} />;
  }

  if (Array.isArray(section?.fields) && section.fields.length) {
    return (
      <div className={cx("objectBlock")}>
        {renderFieldList(section.fields, data, content)}
      </div>
    );
  }

  return (
    <div className={cx("objectBlock")}>
      {Object.keys(data || {}).map((key) => (
        <div key={key} className={cx("fieldValue")}>
          {String(data[key])}
        </div>
      ))}
    </div>
  );
}
export function ExperienceSection({ data = [] }) {
  if (!Array.isArray(data) || !data.length) return null;

  return (
    <div className={cx("cardList")}>
      {data.map((item, index) => {
        const dateText = getDateText(item);

        return (
          <div key={index} className={cx("cardItem")}>
            <div className={cx("expHeader")}>
              <div className={cx("expMain")}>
                {item?.role ? (
                  <div className={cx("expRole")}>{item.role}</div>
                ) : null}

                {item?.company ? (
                  <div className={cx("expCompany")}>{item.company}</div>
                ) : null}
              </div>

              {dateText ? (
                <div className={cx("dateBadge")}>{dateText}</div>
              ) : null}
            </div>

            {item?.description ? (
              <div className={cx("expDesc")}>
                <RichText value={item.description} />
              </div>
            ) : null}

            {Array.isArray(item?.achievements) &&
            item.achievements.length > 0 ? (
              <ul className={cx("expList")}>
                {item.achievements.map((achievement, i) => (
                  <li key={i}>{achievement}</li>
                ))}
              </ul>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
