import classNames from 'classnames/bind';
import styles from '../SectionItem.module.scss';
import { getFieldLabel, uniqueFieldKeys } from './fieldConfig.utils';

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

const DEFAULT_CONTACT_FIELDS = [
    'email',
    'phone',
    'website',
    'birth_date',
    'address',
];

function ContactFields({ data = {}, onChangeField, sectionKey, section = {} }) {
    const fieldKeys = [
        ...new Set([
            ...DEFAULT_CONTACT_FIELDS,
            ...uniqueFieldKeys(section?.fields),
            ...Object.keys(data || {}),
        ]),
    ].filter(Boolean);

    return (
        <div className={cx('fieldsGrid')}>
            {fieldKeys.map((fieldKey) => (
                <FieldGroup
                    key={fieldKey}
                    label={getFieldLabel(fieldKey)}
                    fullWidth={
                        fieldKey === 'address' || fieldKey === 'location'
                    }
                >
                    <BaseInput
                        type={fieldKey === 'email' ? 'email' : 'text'}
                        value={data?.[fieldKey]}
                        onChange={(e) =>
                            onChangeField?.(
                                sectionKey,
                                fieldKey,
                                e.target.value,
                            )
                        }
                    />
                </FieldGroup>
            ))}
        </div>
    );
}

export default ContactFields;
