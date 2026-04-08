import classNames from 'classnames/bind';
import { MdAdd, MdOutlineSave, MdOutlineFileDownload } from 'react-icons/md';
import styles from './EditorToolbar.module.scss';

const cx = classNames.bind(styles);

function EditorToolbar({
    onAddSection,
    onSaveCv,
    onDownloadPdf,
    submitting = false,
}) {
    return (
        <div className={cx('wrapper')}>
            <button
                type="button"
                className={cx('btn', 'btnLight')}
                onClick={onAddSection}
            >
                <MdAdd />
                Thêm mục
            </button>

            <button
                type="button"
                className={cx('btn', 'btnGray')}
                onClick={onSaveCv}
                disabled={submitting}
            >
                <MdOutlineSave />
                {submitting ? 'Đang lưu...' : 'Lưu CV'}
            </button>

            <button
                type="button"
                className={cx('btn', 'btnPrimary')}
                onClick={onDownloadPdf}
            >
                <MdOutlineFileDownload />
                Tải xuống PDF
            </button>
        </div>
    );
}

export default EditorToolbar;