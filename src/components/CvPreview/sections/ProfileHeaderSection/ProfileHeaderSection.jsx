import classNames from 'classnames/bind';
import styles from './ProfileHeaderSection.module.scss';
const cx = classNames.bind(styles)
function renderPrimitive(fieldKey, data) {
  const value = data?.[fieldKey];

  if (fieldKey === 'avatar_url') {
    return (
      <div className={cx("avatarWrap")}>
        <img
          className={cx("avatar")}
          src={value || 'https://via.placeholder.com/100x100?text=Avatar'}
          alt="avatar"
        />
      </div>
    );
  }

  if (fieldKey === 'full_name') {
    return <h1 className={cx("fullName")}>{value || 'Họ và tên'}</h1>;
  }

  if (fieldKey === 'headline') {
    return <p className={cx("headline")}>{value || 'Vị trí ứng tuyển'}</p>;
  }

  return <span>{value || ''}</span>;
}

function renderFieldNode(node, data, index = 0) {
  if (typeof node === 'string') {
    return <React.Fragment key={index}>{renderPrimitive(node, data)}</React.Fragment>;
  }

  if (!node?.items) return null;

  const isRow = node.layout === 'ROW';

  return (
    <div key={index} className={isRow ? cx("fieldRow") : cx("fieldColumn")}>
      {node.items.map((child, childIndex) =>
        renderFieldNode(child, data, `${index}-${childIndex}`)
      )}
    </div>
  );
}

function getStyleClass(stylesText = '') {
  if (stylesText.includes('border-bottom-2px')) return 'styleBorderBottom';
  if (stylesText.includes('bg-navy-blue')) return 'styleNavyBlock';
  return 'styleDefault';
}

function ProfileHeaderSection({ config, data }) {
  const fields = config?.fields || ['full_name', 'headline'];
  const styleClass = getStyleClass(config?.styles || '');

  return (
    <section className={`${cx("section")} ${styles[styleClass]}`}>
      <div className={cx("inner")}>
        {fields.map((field, index) => renderFieldNode(field, data, index))}
        {data?.summary ? <p className={cx("summary")}>{data.summary}</p> : null}
      </div>
    </section>
  );
}

export default ProfileHeaderSection;