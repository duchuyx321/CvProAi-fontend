import classNames from 'classnames/bind';
import styles from './ExperienceSection.module.scss';

const cx = classNames.bind(styles)
function formatDateRange(startDate, endDate) {
  const start = startDate || '';
  const end = endDate || 'Hiện tại';
  return `${start}${start && end ? ' - ' : ''}${end}`;
}

function ExperienceSection({ config, data }) {
  const items = Array.isArray(data) ? data : [];

  return (
    <section className={cx("section")}>
      <h2 className={cx("title")}>{config?.title || 'Kinh nghiệm'}</h2>

      {items.length === 0 ? (
        <div className={cx("empty")}>Chưa có kinh nghiệm</div>
      ) : (
        <div className={cx("timeline")}>
          {items.map((item, index) => (
            <div key={index} className={cx("item")}>
              <div className={cx("header")}>
                <div>
                  <h3 className={cx("itemTitle")}>{item.role || 'Vị trí công việc'}</h3>
                  <p className={cx("muted")}>{item.company || 'Tên công ty'}</p>
                </div>

                <div className={cx("date")}>
                  {formatDateRange(item.start_date, item.end_date)}
                </div>
              </div>

              {item.description ? (
                <p className={cx("text")}>{item.description}</p>
              ) : null}

              {Array.isArray(item.achievements) && item.achievements.length > 0 ? (
                <ul className={cx("list")}>
                  {item.achievements.map((achievement, i) => (
                    <li key={i}>{achievement}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ExperienceSection;