import classNames from 'classnames/bind';
import { MdArrowBack, MdGridView } from 'react-icons/md';
import styles from './HeaderEditor.module.scss';

const cx = classNames.bind(styles);

function HeaderEditor({
    onBack,
    onChooseTemplate,
    title = 'CvProAI',
    subtitle = 'Chỉnh sửa nội dung CV',
}) {
    return (
        <header className={cx('wrapper')}>
            <div className={cx('left')}>
                <button
                    type="button"
                    className={cx('backBtn')}
                    onClick={onBack}
                >
                    <MdArrowBack />
                </button>

                <div className={cx('brand')}>
                    <h1 className={cx('title')}>{title}</h1>
                    <p className={cx('subtitle')}>{subtitle}</p>
                </div>
            </div>

            <button
                type="button"
                className={cx('templateBtn')}
                onClick={onChooseTemplate}
            >
                <MdGridView />
                Chọn mẫu CV
            </button>
        </header>
    );
}

export default HeaderEditor;