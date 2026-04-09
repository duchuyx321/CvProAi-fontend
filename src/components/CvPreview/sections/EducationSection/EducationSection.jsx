import classNames from 'classnames/bind';
import styles from './EducationSection.module.scss';

const cx = classNames.bind(styles)
function formatDateRange(startDate, endDate) {
  const start = startDate || '';
  const end = endDate || 'Hiện tại';
  return `${start}${start && end ? ' - ' : ''}${end}`;
}

function EducationSection({ config, data }) {
  const items = Array.isArray(data) ? data : [];

  return (
    <section className={cx("section")}>
      <h2 className={cx("title")}>{config?.title || 'Học vấn'}</h2>

      {items.length === 0 ? (
        <div className={cx("empty")}>Chưa có học vấn</div>
      ) : (
        <div className={cx("list")}>
          {items.map((item, index) => (
            <div key={index} className={cx("item")}>
              <div className={cx("header")}>
                <div>
                  <h3 className={cx("itemTitle")}>{item.school || 'Tên trường'}</h3>
                  <p className={cx("muted")}>{item.degree || 'Ngành học / bằng cấp'}</p>
                </div>

                <div className={cx("date")}>
                  {formatDateRange(item.start_date, item.end_date)}
                </div>
              </div>

              {item.description ? (
                <p className={cx("text")}>{item.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default EducationSection;