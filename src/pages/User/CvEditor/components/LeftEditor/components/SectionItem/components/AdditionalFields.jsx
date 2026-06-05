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

function AdditionalFields({ data = {}, onChangeField, sectionKey }) {
    return (
        <FieldGroup label="Thông tin thêm">
            <RichTextEditor
                value={data.content || '<p></p>'}
                onChange={(html) => onChangeField?.(sectionKey, 'content', html)}
                placeholder="Nhập thông tin thêm..."
                minHeight={180}
            />
        </FieldGroup>
    );
}

export default AdditionalFields;