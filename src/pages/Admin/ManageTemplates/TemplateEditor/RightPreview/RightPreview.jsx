import classNames from 'classnames/bind';
import { FiDownload, FiMinus, FiPlus } from 'react-icons/fi';

import CvPreview from '~/components/CvPreview';

import {
    buildEditorPreviewCv,
    buildEditorPreviewTemplate,
} from '../templateSchema';

import styles from './RightPreview.module.scss';

const cx = classNames.bind(styles);

function RightPreview({
    paperRef,
    template,
    editor,
    zoom,
    onZoomIn,
    onZoomOut,
    onDownloadPdf,
}) {
    const previewTemplate = buildEditorPreviewTemplate(editor, template);
    const previewCv = buildEditorPreviewCv(editor, template);

    return (
        <main className={cx('previewPanel')}>
            <div className={cx('previewHeader')}>
                <div className={cx('previewTitle')}>
                    <strong>Live Preview</strong>
                    <span
                        className={cx('badge', {
                            active: editor.is_active,
                            premium: editor.is_premium,
                        })}
                    >
                        {editor.is_premium ? 'Premium' : 'Free'} ·{' '}
                        {editor.is_active ? 'Hoạt động' : 'Nháp'}
                    </span>
                </div>

                <div className={cx('previewActions')}>
                    <div className={cx('zoomGroup')}>
                        <button type="button" onClick={onZoomOut}>
                            <FiMinus />
                        </button>
                        <span>{zoom}%</span>
                        <button type="button" onClick={onZoomIn}>
                            <FiPlus />
                        </button>
                    </div>

                    <button
                        type="button"
                        className={cx('downloadBtn')}
                        onClick={onDownloadPdf}
                    >
                        <FiDownload />
                        Tải PDF
                    </button>
                </div>
            </div>

            <div className={cx('canvas')}>
                <div
                    className={cx('renderedPreview')}
                    style={{ transform: `scale(${zoom / 100})` }}
                >
                    <CvPreview
                        pageRef={paperRef}
                        template={previewTemplate}
                        cv={previewCv}
                    />
                </div>
            </div>
        </main>
    );
}

export default RightPreview;
