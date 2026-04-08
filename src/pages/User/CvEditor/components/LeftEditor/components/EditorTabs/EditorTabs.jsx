import classNames from 'classnames/bind';
import styles from './EditorTabs.module.scss';

const cx = classNames.bind(styles);

function EditorTabs({ activeTab, setActiveTab }) {
    return (
        <div className={cx('wrapper')}>
            <button
                type="button"
                className={cx('item', { active: activeTab === 'content' })}
                onClick={() => setActiveTab('content')}
            >
                Nội dung
            </button>

            <button
                type="button"
                className={cx('item', { active: activeTab === 'design' })}
                onClick={() => setActiveTab('design')}
            >
                Thiết kế
            </button>

            <button
                type="button"
                className={cx('item', { active: activeTab === 'structure' })}
                onClick={() => setActiveTab('structure')}
            >
                Cấu trúc CV
            </button>
        </div>
    );
}

export default EditorTabs;