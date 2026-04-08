import classNames from 'classnames/bind';

import SectionTitle from '../../SectionTitle';
import styles from './Summary.module.scss';

const cx = classNames.bind(styles);

function Summary({ resumeData = {}, sectionConfig = {}, theme = {} }) {
    const title = sectionConfig?.title || 'Mục Tiêu Nghề Nghiệp';
    const summary = resumeData?.summary || '';

    if (!summary) return null;

    const textMain = theme?.colors?.text_main || '#1f2937';

    return (
        <section className={cx('wrapper')}>
            <SectionTitle title={title} theme={theme} />

            <p className={cx('text')} style={{ color: textMain }}>
                {summary}
            </p>
        </section>
    );
}

export default Summary;