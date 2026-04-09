import classNames from 'classnames/bind';
import styles from './ProjectsSection.module.scss';

const cx = classNames.bind(styles)
function ProjectsSection({ config, data }) {
  const items = Array.isArray(data) ? data : [];

  return (
    <section className={cx("section")}>
      <h2 className={cx("title")}>{config?.title || 'Dự án'}</h2>

      {items.length === 0 ? (
        <div className={cx("empty")}>Chưa có dự án</div>
      ) : (
        <div className={cx("list")}>
          {items.map((item, index) => (
            <div key={index} className={cx("item")}>
              <div className={cx("header")}>
                <div>
                  <h3 className={cx("itemTitle")}>{item.name || 'Tên dự án'}</h3>
                  <p className={cx("muted")}>{item.tech_stack || ''}</p>
                </div>

                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className={cx("link")}
                  >
                    Xem thêm
                  </a>
                ) : null}
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

export default ProjectsSection;