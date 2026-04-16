import classNames from 'classnames/bind';
import styles from '../SectionItem.module.scss';

const cx = classNames.bind(styles);

function FieldGroup({ label, children, fullWidth = false }) {
    return (
        <div className={cx('fieldGroup', { fullWidth })}>
            {label ? <label className={cx('label')}>{label}</label> : null}
            {children}
        </div>
    );
}

function BaseInput({ value, onChange, type = 'text', disabled = false }) {
    return (
        <input
            className={cx('input')}
            type={type}
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
        />
    );
}

function ContactFields({ data = {}, onChangeField, sectionKey }) {
    return (
        <div className={cx('fieldsGrid')}>
            <FieldGroup label="Email">
                <BaseInput
                    type="email"
                    value={data.email}
                    onChange={(e) =>
                        onChangeField?.(sectionKey, 'email', e.target.value)
                    }
                />
            </FieldGroup>

            <FieldGroup label="Số điện thoại">
                <BaseInput
                    value={data.phone}
                    onChange={(e) =>
                        onChangeField?.(sectionKey, 'phone', e.target.value)
                    }
                />
            </FieldGroup>

            <FieldGroup label="Website">
                <BaseInput
                    value={data.website}
                    onChange={(e) =>
                        onChangeField?.(sectionKey, 'website', e.target.value)
                    }
                />
            </FieldGroup>

            <FieldGroup label="Ngày sinh">
                <BaseInput
                    value={data.birth_date}
                    onChange={(e) =>
                        onChangeField?.(sectionKey, 'birth_date', e.target.value)
                    }
                />
            </FieldGroup>

            <FieldGroup label="Địa chỉ" fullWidth>
                <BaseInput
                    value={data.address}
                    onChange={(e) =>
                        onChangeField?.(sectionKey, 'address', e.target.value)
                    }
                />
            </FieldGroup>
        </div>
    );
}

export default ContactFields;