import classNames from 'classnames/bind';
import styles from '../SectionItem.module.scss';
import RichTextEditor from '~/components/RichTextEditor';

const cx = classNames.bind(styles);

function FieldGroup({ label, children, fullWidth = false }) {
    return (
        <div className={cx('fieldGroup', { fullWidth })}>
            {label ? <label className={cx('label')}>{label}</label> : null}
            {children}
        </div>
    );
}

function SummaryFields({ data = {}, onChangeField, sectionKey }) {
    return (
        <FieldGroup label="Mục tiêu nghề nghiệp">
            <RichTextEditor
                value={data.summary || '<p></p>'}
                onChange={(html) => onChangeField?.(sectionKey, 'summary', html)}
                placeholder="Nhập mục tiêu nghề nghiệp..."
                minHeight={180}
            />
        </FieldGroup>
    );
}

export default SummaryFields;