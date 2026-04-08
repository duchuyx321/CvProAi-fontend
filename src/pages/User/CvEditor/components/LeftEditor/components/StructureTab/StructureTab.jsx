import classNames from 'classnames/bind';
import styles from './StructureTab.module.scss';

const cx = classNames.bind(styles);

function StructureTab({ sectionList = [] }) {
    return (
        <div className={cx('wrapper')}>
            {sectionList.map((item) => (
                <div key={item.key} className={cx('row')}>
                    <span className={cx('number')}>{item.number}.</span>
                    <span className={cx('name')}>{item.title}</span>
                </div>
            ))}
        </div>
    );
}

export default StructureTab;