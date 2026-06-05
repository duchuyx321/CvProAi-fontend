import classNames from 'classnames/bind';
import { MdChevronRight } from 'react-icons/md';

import styles from './SectionItem.module.scss';

const cx = classNames.bind(styles);

function SectionItem({ label = '', value = '', onClick }) {
    return (
        <button type="button" className={cx('wrapper')} onClick={onClick}>
            <div className={cx('main')}>
                <h3 className={cx('label')}>{label}</h3>
                <p className={cx('value')}>{value}</p>
            </div>

            <span className={cx('icon')}>
                <MdChevronRight />
            </span>
        </button>
    );
}

export default SectionItem;