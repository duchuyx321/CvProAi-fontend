import classNames from 'classnames/bind';
import Preview from '~/components/CvTemplate/Preview';
import styles from './RightPreview.module.scss';

const cx = classNames.bind(styles);

function RightPreview({ resumeData = {}, templateConfig = {} }) {
    return (
        <div className={cx('wrapper')}>
            <div className={cx('preview')}>
                <Preview
                    resumeData={resumeData}
                    templateConfig={templateConfig}
                />
            </div>

            <div className={cx('zoom')}>
                <button type="button" className={cx('zoomBtn')}>
                    -
                </button>
                <span className={cx('zoomText')}>100%</span>
                <button type="button" className={cx('zoomBtn')}>
                    +
                </button>
            </div>
        </div>
    );
}

export default RightPreview;