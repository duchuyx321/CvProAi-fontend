import classNames from 'classnames/bind';
import styles from './ContactSection.module.scss';

const cx = classNames.bind(styles)
function ContactSection({ config, data }) {
  const items = [
    { label: 'Email', value: data?.email },
    { label: 'Điện thoại', value: data?.phone },
    { label: 'Địa chỉ', value: data?.address },
    { label: 'Website', value: data?.website },
  ].filter((item) => item.value);

  return (
    <section className={cx("section")}>
      <h2 className={cx("title")}>{config?.title || 'Liên hệ'}</h2>

      {items.length === 0 ? (
        <div className={cx("empty")}>Chưa có thông tin liên hệ</div>
      ) : (
        <div className={cx("list")}>
          {items.map((item) => (
            <div key={item.label} className={cx("item")}>
              <span className={cx("label")}>{item.label}</span>
              <span className={cx("value")}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ContactSection;