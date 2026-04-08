import classNames from 'classnames/bind';
import styles from './SectionTitle.module.scss';

const cx = classNames.bind(styles);

function SectionTitle({ title = '', theme = {} }) {
    const prefix = theme?.typography?.section_title?.prefix || '';
    const titleStyle = {
        color: theme?.typography?.section_title?.color || '#1e3a8a',
        fontSize: `${theme?.typography?.section_title?.font_size ?? 18}px`,
        fontWeight: theme?.typography?.section_title?.font_weight ?? 700,
    };

    return (
        <h3 className={cx('wrapper')} style={titleStyle}>
            {prefix}
            {title}
        </h3>
    );
}

export default SectionTitle;