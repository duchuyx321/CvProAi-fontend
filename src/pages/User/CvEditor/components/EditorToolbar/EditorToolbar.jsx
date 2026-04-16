import classNames from 'classnames/bind';
import {
    MdOutlineSave,
    MdOutlineFileDownload,
    MdRefresh,
} from 'react-icons/md';
import styles from './EditorToolbar.module.scss';

const cx = classNames.bind(styles);

function EditorToolbar({
    canDownloadPdf = false,
    canSave = false,
    onResetData,
    onSaveCv,
    onDownloadPdf,
    submitting = false,
}) {
    return (
        <div className={cx('wrapper')}>
            <button
                type="button"
                className={cx('btn', 'btnDanger')}
                onClick={onResetData}
                disabled={submitting}
            >
                <MdRefresh />
                Làm mới
            </button>

            <button
                type="button"
                className={cx('btn', 'btnGray')}
                onClick={onSaveCv}
                disabled={!canSave || submitting}
                title={!canSave && !submitting ? 'Chưa có thay đổi để lưu' : ''}
            >
                <MdOutlineSave />
                {submitting ? 'Đang lưu...' : 'Lưu CV'}
            </button>

            <button
                type="button"
                className={cx('btn', 'btnPrimary')}
                onClick={onDownloadPdf}
                disabled={!canDownloadPdf || submitting}
            >
                <MdOutlineFileDownload />
                Tải xuống PDF
            </button>
        </div>
    );
}

export default EditorToolbar;