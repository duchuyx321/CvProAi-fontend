import classNames from 'classnames/bind';
import styles from '../CvPreview.module.scss';
import { isEmpty, isHtml } from '../utils/previewHelpers';

const cx = classNames.bind(styles);

function RichText({ value }) {
    if (isEmpty(value)) return null;

    if (isHtml(value)) {
        return (
            <div
                className={cx('richText')}
                dangerouslySetInnerHTML={{ __html: value }}
            />
        );
    }

    return <div className={cx('plainText')}>{String(value)}</div>;
}

export default RichText;
