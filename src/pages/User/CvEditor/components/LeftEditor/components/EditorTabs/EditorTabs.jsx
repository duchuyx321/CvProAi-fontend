import classNames from 'classnames/bind';
import styles from './EditorTabs.module.scss';

const cx = classNames.bind(styles);

function EditorTabs({ tabs = [], activeTab, onChangeTab }) {
    return (
        <div className={cx('wrapper')}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;

                return (
                    <button
                        key={tab.key}
                        type="button"
                        className={cx('item', { active: isActive })}
                        onClick={() => onChangeTab?.(tab.key)}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

export default EditorTabs;