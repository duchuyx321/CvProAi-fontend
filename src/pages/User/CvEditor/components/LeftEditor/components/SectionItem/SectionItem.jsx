import { useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import styles from './SectionItem.module.scss';
import SectionActions from '../SectionActions';
import RichTextEditor from '~/components/RichTextEditor';

const cx = classNames.bind(styles);

function ArrayEmptyState({ message }) {
    return (
        <div className={cx('emptyState')}>
            <p>{message}</p>
        </div>
    );
}

function ItemCard({ children }) {
    return <div className={cx('arrayItem')}>{children}</div>;
}

function ItemActions({ onRemove, removeLabel }) {
    return (
        <div className={cx('itemActions')}>
            <button
                type="button"
                className={cx('removeItemBtn')}
                onClick={onRemove}
            >
                {removeLabel}
            </button>
        </div>
    );
}

function AddItemButton({ onClick, children }) {
    return (
        <button
            type="button"
            className={cx('addItemBtn')}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

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

function BaseTextarea({ value, onChange, rows = 4 }) {
    return (
        <textarea
            className={cx('textarea')}
            value={value || ''}
            onChange={onChange}
            rows={rows}
        />
    );
}

function PersonalInfoFields({ data = {}, onChangeField, sectionKey }) {
    return (
        <div className={cx('fieldsGrid')}>
            <FieldGroup label="Họ và tên">
                <BaseInput
                    value={data.full_name}
                    onChange={(e) =>
                        onChangeField?.(sectionKey, 'full_name', e.target.value)
                    }
                />
            </FieldGroup>

            <FieldGroup label="Vị trí ứng tuyển">
                <BaseInput
                    value={data.headline}
                    onChange={(e) =>
                        onChangeField?.(sectionKey, 'headline', e.target.value)
                    }
                />
            </FieldGroup>

            <FieldGroup label="Avatar URL" fullWidth>
                <BaseInput
                    value={data.avatar_url}
                    onChange={(e) =>
                        onChangeField?.(sectionKey, 'avatar_url', e.target.value)
                    }
                />
            </FieldGroup>
        </div>
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

function SummaryFields({ data = {}, onChangeField, sectionKey }) {
    return (
        <FieldGroup label="Mục tiêu nghề nghiệp">
            <RichTextEditor
                value={data.summary || '<p></p>'}
                onChange={(html) =>
                    onChangeField?.(sectionKey, 'summary', html)
                }
                placeholder="Nhập mục tiêu nghề nghiệp..."
                minHeight={180}
            />
        </FieldGroup>
    );
}

function AdditionalFields({ data = {}, onChangeField, sectionKey }) {
    return (
        <FieldGroup label="Thông tin thêm">
            <RichTextEditor
                value={data.content || '<p></p>'}
                onChange={(html) =>
                    onChangeField?.(sectionKey, 'content', html)
                }
                placeholder="Nhập thông tin thêm..."
                minHeight={180}
            />
        </FieldGroup>
    );
}

function SkillsFields({
    data = [],
    onChangeArrayField,
    onChangeObjectInArray,
    sectionKey,
}) {
    const items = Array.isArray(data) ? data : [];

    const handleAdd = () => {
        onChangeArrayField?.(sectionKey, [
            ...items,
            { name: '', description: '' },
        ]);
    };

    const handleRemove = (index) => {
        onChangeArrayField?.(
            sectionKey,
            items.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    return (
        <div className={cx('arraySection')}>
            {!items.length && <ArrayEmptyState message="Chưa có kỹ năng nào." />}

            {items.map((item, index) => (
                <ItemCard key={`${sectionKey}-${index}`}>
                    <FieldGroup label="Tên kỹ năng">
                        <BaseInput
                            value={item?.name}
                            onChange={(e) =>
                                onChangeObjectInArray?.(
                                    sectionKey,
                                    index,
                                    'name',
                                    e.target.value,
                                )
                            }
                        />
                    </FieldGroup>

                    <FieldGroup label="Mô tả">
                        <BaseInput
                            value={item?.description}
                            onChange={(e) =>
                                onChangeObjectInArray?.(
                                    sectionKey,
                                    index,
                                    'description',
                                    e.target.value,
                                )
                            }
                        />
                    </FieldGroup>

                    <ItemActions
                        removeLabel="Xóa kỹ năng"
                        onRemove={() => handleRemove(index)}
                    />
                </ItemCard>
            ))}

            <AddItemButton onClick={handleAdd}>+ Thêm kỹ năng</AddItemButton>
        </div>
    );
}

function ExperienceFields({
    data = [],
    onChangeArrayField,
    onChangeObjectInArray,
    sectionKey,
}) {
    const items = Array.isArray(data) ? data : [];

    const handleAdd = () => {
        onChangeArrayField?.(sectionKey, [
            ...items,
            {
                role: '',
                company: '',
                start_date: '',
                end_date: '',
                is_current: false,
                description: '<p></p>',
            },
        ]);
    };

    const handleRemove = (index) => {
        onChangeArrayField?.(
            sectionKey,
            items.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    return (
        <div className={cx('arraySection')}>
            {!items.length && (
                <ArrayEmptyState message="Chưa có kinh nghiệm làm việc nào." />
            )}

            {items.map((item, index) => (
                <ItemCard key={`${sectionKey}-${index}`}>
                    <div className={cx('fieldsGrid')}>
                        <FieldGroup label="Vị trí">
                            <BaseInput
                                value={item?.role}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'role',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Công ty">
                            <BaseInput
                                value={item?.company}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'company',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Ngày bắt đầu">
                            <BaseInput
                                value={item?.start_date}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'start_date',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Ngày kết thúc">
                            <BaseInput
                                value={item?.end_date}
                                disabled={Boolean(item?.is_current)}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'end_date',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup fullWidth>
                            <label className={cx('checkboxLabel')}>
                                <input
                                    type="checkbox"
                                    checked={Boolean(item?.is_current)}
                                    onChange={(e) =>
                                        onChangeObjectInArray?.(
                                            sectionKey,
                                            index,
                                            'is_current',
                                            e.target.checked,
                                        )
                                    }
                                />
                                <span>Đang làm việc tại đây</span>
                            </label>
                        </FieldGroup>

                        <FieldGroup label="Mô tả công việc" fullWidth>
                            <RichTextEditor
                                value={item?.description || '<p></p>'}
                                onChange={(html) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'description',
                                        html,
                                    )
                                }
                                placeholder="Nhập mô tả công việc..."
                                minHeight={160}
                            />
                        </FieldGroup>
                    </div>

                    <ItemActions
                        removeLabel="Xóa kinh nghiệm"
                        onRemove={() => handleRemove(index)}
                    />
                </ItemCard>
            ))}

            <AddItemButton onClick={handleAdd}>+ Thêm kinh nghiệm</AddItemButton>
        </div>
    );
}

function ProjectsFields({
    data = [],
    onChangeArrayField,
    onChangeObjectInArray,
    sectionKey,
}) {
    const items = Array.isArray(data) ? data : [];

    const handleAdd = () => {
        onChangeArrayField?.(sectionKey, [
            ...items,
            {
                name: '',
                role: '',
                start_date: '',
                end_date: '',
                technologies: '',
                description: '<p></p>',
            },
        ]);
    };

    const handleRemove = (index) => {
        onChangeArrayField?.(
            sectionKey,
            items.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    return (
        <div className={cx('arraySection')}>
            {!items.length && <ArrayEmptyState message="Chưa có dự án nào." />}

            {items.map((item, index) => (
                <ItemCard key={`${sectionKey}-${index}`}>
                    <div className={cx('fieldsGrid')}>
                        <FieldGroup label="Tên dự án">
                            <BaseInput
                                value={item?.name}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'name',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Vai trò">
                            <BaseInput
                                value={item?.role}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'role',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Ngày bắt đầu">
                            <BaseInput
                                value={item?.start_date}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'start_date',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Ngày kết thúc">
                            <BaseInput
                                value={item?.end_date}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'end_date',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Công nghệ sử dụng" fullWidth>
                            <BaseInput
                                value={item?.technologies}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'technologies',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Mô tả dự án" fullWidth>
                            <RichTextEditor
                                value={item?.description || '<p></p>'}
                                onChange={(html) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'description',
                                        html,
                                    )
                                }
                                placeholder="Nhập mô tả dự án..."
                                minHeight={160}
                            />
                        </FieldGroup>
                    </div>

                    <ItemActions
                        removeLabel="Xóa dự án"
                        onRemove={() => handleRemove(index)}
                    />
                </ItemCard>
            ))}

            <AddItemButton onClick={handleAdd}>+ Thêm dự án</AddItemButton>
        </div>
    );
}

function EducationFields({
    data = [],
    onChangeArrayField,
    onChangeObjectInArray,
    sectionKey,
}) {
    const items = Array.isArray(data) ? data : [];

    const handleAdd = () => {
        onChangeArrayField?.(sectionKey, [
            ...items,
            {
                school: '',
                degree: '',
                start_date: '',
                end_date: '',
                is_current: false,
                description: '<p></p>',
            },
        ]);
    };

    const handleRemove = (index) => {
        onChangeArrayField?.(
            sectionKey,
            items.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    return (
        <div className={cx('arraySection')}>
            {!items.length && (
                <ArrayEmptyState message="Chưa có thông tin học vấn nào." />
            )}

            {items.map((item, index) => (
                <ItemCard key={`${sectionKey}-${index}`}>
                    <div className={cx('fieldsGrid')}>
                        <FieldGroup label="Trường học">
                            <BaseInput
                                value={item?.school}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'school',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Bằng cấp / Chuyên ngành">
                            <BaseInput
                                value={item?.degree}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'degree',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Ngày bắt đầu">
                            <BaseInput
                                value={item?.start_date}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'start_date',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Ngày kết thúc">
                            <BaseInput
                                value={item?.end_date}
                                disabled={Boolean(item?.is_current)}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'end_date',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup fullWidth>
                            <label className={cx('checkboxLabel')}>
                                <input
                                    type="checkbox"
                                    checked={Boolean(item?.is_current)}
                                    onChange={(e) =>
                                        onChangeObjectInArray?.(
                                            sectionKey,
                                            index,
                                            'is_current',
                                            e.target.checked,
                                        )
                                    }
                                />
                                <span>Đang học tại đây</span>
                            </label>
                        </FieldGroup>

                        <FieldGroup label="Mô tả" fullWidth>
                            <RichTextEditor
                                value={item?.description || '<p></p>'}
                                onChange={(html) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'description',
                                        html,
                                    )
                                }
                                placeholder="Nhập mô tả học vấn..."
                                minHeight={160}
                            />
                        </FieldGroup>
                    </div>

                    <ItemActions
                        removeLabel="Xóa học vấn"
                        onRemove={() => handleRemove(index)}
                    />
                </ItemCard>
            ))}

            <AddItemButton onClick={handleAdd}>+ Thêm học vấn</AddItemButton>
        </div>
    );
}

function CertificatesFields({
    data = [],
    onChangeArrayField,
    onChangeObjectInArray,
    sectionKey,
}) {
    const items = Array.isArray(data) ? data : [];

    const handleAdd = () => {
        onChangeArrayField?.(sectionKey, [
            ...items,
            {
                name: '',
                issuer: '',
                issue_date: '',
                description: '<p></p>',
            },
        ]);
    };

    const handleRemove = (index) => {
        onChangeArrayField?.(
            sectionKey,
            items.filter((_, itemIndex) => itemIndex !== index),
        );
    };

    return (
        <div className={cx('arraySection')}>
            {!items.length && <ArrayEmptyState message="Chưa có chứng chỉ nào." />}

            {items.map((item, index) => (
                <ItemCard key={`${sectionKey}-${index}`}>
                    <div className={cx('fieldsGrid')}>
                        <FieldGroup label="Tên chứng chỉ">
                            <BaseInput
                                value={item?.name}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'name',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Đơn vị cấp">
                            <BaseInput
                                value={item?.issuer}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'issuer',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Ngày cấp" fullWidth>
                            <BaseInput
                                value={item?.issue_date}
                                onChange={(e) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'issue_date',
                                        e.target.value,
                                    )
                                }
                            />
                        </FieldGroup>

                        <FieldGroup label="Mô tả" fullWidth>
                            <RichTextEditor
                                value={item?.description || '<p></p>'}
                                onChange={(html) =>
                                    onChangeObjectInArray?.(
                                        sectionKey,
                                        index,
                                        'description',
                                        html,
                                    )
                                }
                                placeholder="Nhập mô tả chứng chỉ..."
                                minHeight={160}
                            />
                        </FieldGroup>
                    </div>

                    <ItemActions
                        removeLabel="Xóa chứng chỉ"
                        onRemove={() => handleRemove(index)}
                    />
                </ItemCard>
            ))}

            <AddItemButton onClick={handleAdd}>+ Thêm chứng chỉ</AddItemButton>
        </div>
    );
}

function normalizeSectionType(section) {
    return section?.type || section?.key;
}

function SectionItem({
    section,
    isOpen = false,
    sectionData,
    onToggleSection,
    onRemoveSection,
    onAddSectionItem,
    onChangeField,
    onChangeArrayField,
    onChangeObjectInArray,
}) {
    const [isHovered, setIsHovered] = useState(false);

    const sectionType = normalizeSectionType(section);

    const showDelete = useMemo(() => {
        return Boolean(section?.removable && (isHovered || isOpen));
    }, [isHovered, isOpen, section?.removable]);

    const handleToggle = () => {
        onToggleSection?.(section.key);
    };

    const handleRemove = () => {
        onRemoveSection?.(section.key);
    };

    const handleAdd = () => {
        onAddSectionItem?.(section.key);
    };

    const handleHeaderKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleToggle();
        }
    };

    const renderSectionBody = () => {
        switch (sectionType) {
            case 'personal_info':
                return (
                    <PersonalInfoFields
                        data={sectionData}
                        onChangeField={onChangeField}
                        sectionKey={section.key}
                    />
                );

            case 'contact':
                return (
                    <ContactFields
                        data={sectionData}
                        onChangeField={onChangeField}
                        sectionKey={section.key}
                    />
                );

            case 'summary':
                return (
                    <SummaryFields
                        data={sectionData}
                        onChangeField={onChangeField}
                        sectionKey={section.key}
                    />
                );

            case 'skills':
                return (
                    <SkillsFields
                        data={sectionData}
                        onChangeArrayField={onChangeArrayField}
                        onChangeObjectInArray={onChangeObjectInArray}
                        sectionKey={section.key}
                    />
                );

            case 'experience':
                return (
                    <ExperienceFields
                        data={sectionData}
                        onChangeArrayField={onChangeArrayField}
                        onChangeObjectInArray={onChangeObjectInArray}
                        sectionKey={section.key}
                    />
                );

            case 'projects':
                return (
                    <ProjectsFields
                        data={sectionData}
                        onChangeArrayField={onChangeArrayField}
                        onChangeObjectInArray={onChangeObjectInArray}
                        sectionKey={section.key}
                    />
                );

            case 'education':
                return (
                    <EducationFields
                        data={sectionData}
                        onChangeArrayField={onChangeArrayField}
                        onChangeObjectInArray={onChangeObjectInArray}
                        sectionKey={section.key}
                    />
                );

            case 'certificates':
                return (
                    <CertificatesFields
                        data={sectionData}
                        onChangeArrayField={onChangeArrayField}
                        onChangeObjectInArray={onChangeObjectInArray}
                        sectionKey={section.key}
                    />
                );

            case 'additional':
                return (
                    <AdditionalFields
                        data={sectionData}
                        onChangeField={onChangeField}
                        sectionKey={section.key}
                    />
                );

            default:
                return (
                    <div className={cx('emptyState')}>
                        <p>Section này chưa được hỗ trợ: {section.title}</p>
                    </div>
                );
        }
    };

    return (
        <div
            className={cx('wrapper', { open: isOpen })}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className={cx('header')}
                role="button"
                tabIndex={0}
                onClick={handleToggle}
                onKeyDown={handleHeaderKeyDown}
            >
                <div className={cx('left')}>
                    <div className={cx('meta')}>
                        <span className={cx('number')}>{section.number}.</span>
                        <span className={cx('title')}>{section.title}</span>
                    </div>
                </div>

                <SectionActions
                    expandable={section.expandable}
                    expanded={isOpen}
                    removable={section.removable}
                    showDelete={showDelete}
                    onToggle={handleToggle}
                    onRemove={handleRemove}
                    onAdd={handleAdd}
                />
            </div>

            {isOpen && <div className={cx('body')}>{renderSectionBody()}</div>}
        </div>
    );
}

export default SectionItem;