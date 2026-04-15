import classNames from 'classnames/bind';
import { useEffect, useState } from 'react';
import { MdKeyboardArrowDown, MdKeyboardArrowUp, MdAdd } from 'react-icons/md';
import { RiUserLine, RiRocket2Line } from 'react-icons/ri';
import { HiOutlineLightBulb } from 'react-icons/hi';
import { FiBriefcase } from 'react-icons/fi';
import { PiGraduationCap, PiCertificate } from 'react-icons/pi';

import styles from './SectionEditor.module.scss';

const cx = classNames.bind(styles);

const ICON_MAP = {
    personal_info: <RiUserLine />,
    summary: <RiRocket2Line />,
    skills: <HiOutlineLightBulb />,
    experience: <FiBriefcase />,
    projects: <MdAdd />,
    education: <PiGraduationCap />,
    certificates: <PiCertificate />,
};

function buildSkillsText(sectionData) {
    if (!Array.isArray(sectionData)) return '';

    return sectionData
        .map((item) => (typeof item === 'string' ? item : item?.name || ''))
        .filter(Boolean)
        .join('\n');
}

function parseSkillsText(text, currentSkills = []) {
    const currentMap = new Map(
        (Array.isArray(currentSkills) ? currentSkills : [])
            .filter((item) => item?.name)
            .map((item) => [item.name.toLowerCase(), item]),
    );

    return text
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((name) => {
            const existed = currentMap.get(name.toLowerCase());
            return {
                name,
                level: existed?.level ?? 80,
            };
        });
}

function SectionEditor({
    section,
    isOpen = false,
    onToggle,
    sectionData = {},
    onChangeField,
    onChangeArrayField,
    onChangeObjectInArray,
    errors = {},
}) {
    const [skillsText, setSkillsText] = useState('');
    const [summaryText, setSummaryText] = useState('');

    useEffect(() => {
        if (section?.type === 'skills') {
            setSkillsText(buildSkillsText(sectionData));
        }
    }, [sectionData, section?.type]);
    useEffect(() => {
        if (section?.type === 'summary') {
            setSummaryText(sectionData?.summary || '');
        }
    }, [sectionData, section?.type]);

    const appendArrayItem = (defaultItem = {}) => {
        const list = Array.isArray(sectionData) ? sectionData : [];
        onChangeArrayField([...list, defaultItem]);
    };
    
    const removeArrayItem = (indexToRemove) => {
        const list = Array.isArray(sectionData) ? sectionData : [];
        onChangeArrayField(list.filter((_, index) => index !== indexToRemove));
    };
    const renderFields = () => {
        switch (section?.type) {
            case 'personal_info':
    return (
        <div className={cx('content')}>
            <div className={cx('gridTwo')}>
                <div className={cx('field')}>
                    <input
                        data-field="full_name"
                        className={cx('input', { inputError: errors?.full_name })}
                        placeholder="Họ và tên"
                        value={sectionData?.full_name || ''}
                        onChange={(e) =>
                            onChangeField('full_name', e.target.value)
                        }
                    />
                    {errors?.full_name && (
                        <p className={cx('fieldError')}>{errors.full_name}</p>
                    )}
                </div>

                <div className={cx('field')}>
                    <input
                        data-field="headline"
                        className={cx('input', { inputError: errors?.headline })}
                        placeholder="Vị trí ứng tuyển"
                        value={sectionData?.headline || ''}
                        onChange={(e) =>
                            onChangeField('headline', e.target.value)
                        }
                    />
                    {errors?.headline && (
                        <p className={cx('fieldError')}>{errors.headline}</p>
                    )}
                </div>

                <div className={cx('field')}>
                    <input
                        data-field="email"
                        className={cx('input', { inputError: errors?.email })}
                        placeholder="Email"
                        value={sectionData?.email || ''}
                        onChange={(e) =>
                            onChangeField('email', e.target.value)
                        }
                    />
                    {errors?.email && (
                        <p className={cx('fieldError')}>{errors.email}</p>
                    )}
                </div>

                <div className={cx('field')}>
                    <input
                        data-field="phone"
                        className={cx('input', { inputError: errors?.phone })}
                        placeholder="Số điện thoại"
                        value={sectionData?.phone || ''}
                        onChange={(e) =>
                            onChangeField('phone', e.target.value)
                        }
                    />
                    {errors?.phone && (
                        <p className={cx('fieldError')}>{errors.phone}</p>
                    )}
                </div>
            </div>

            <div className={cx('field')}>
                <input
                    data-field="address"
                    className={cx('input', { inputError: errors?.address })}
                    placeholder="Địa chỉ"
                    value={sectionData?.address || ''}
                    onChange={(e) =>
                        onChangeField('address', e.target.value)
                    }
                />
                {errors?.address && (
                    <p className={cx('fieldError')}>{errors.address}</p>
                )}
            </div>

            <div className={cx('field')}>
                <input
                    data-field="website"
                    className={cx('input', { inputError: errors?.website })}
                    placeholder="Website"
                    value={sectionData?.website || ''}
                    onChange={(e) =>
                        onChangeField('website', e.target.value)
                    }
                />
                {errors?.website && (
                    <p className={cx('fieldError')}>{errors.website}</p>
                )}
            </div>
        </div>
    );

    case 'projects':
    return (
        <div className={cx('content')} data-field="projects">
            {(Array.isArray(sectionData) ? sectionData : []).map(
                (item, index) => (
                    <div key={index} className={cx('field-group')}>
                        <div className={cx('field')}>
                            <input
                                data-field={`projects_name_${index}`}
                                className={cx('input', {
                                    inputError: errors?.[`projects_name_${index}`],
                                })}
                                placeholder="Tên dự án"
                                value={item.name || ''}
                                onChange={(e) =>
                                    onChangeObjectInArray(index, 'name', e.target.value)
                                }
                            />
                            {errors?.[`projects_name_${index}`] && (
                                <p className={cx('fieldError')}>
                                    {errors[`projects_name_${index}`]}
                                </p>
                            )}
                        </div>

                        <div className={cx('field')}>
                            <input
                                data-field={`projects_role_${index}`}
                                className={cx('input', {
                                    inputError: errors?.[`projects_role_${index}`],
                                })}
                                placeholder="Vai trò"
                                value={item.role || ''}
                                onChange={(e) =>
                                    onChangeObjectInArray(index, 'role', e.target.value)
                                }
                            />
                            {errors?.[`projects_role_${index}`] && (
                                <p className={cx('fieldError')}>
                                    {errors[`projects_role_${index}`]}
                                </p>
                            )}
                        </div>

                        <div className={cx('field')}>
                            <textarea
                                data-field={`projects_description_${index}`}
                                className={cx('textarea', {
                                    inputError: errors?.[`projects_description_${index}`],
                                })}
                                rows={3}
                                placeholder="Mô tả dự án"
                                value={item.description || ''}
                                onChange={(e) =>
                                    onChangeObjectInArray(index, 'description', e.target.value)
                                }
                            />
                            {errors?.[`projects_description_${index}`] && (
                                <p className={cx('fieldError')}>
                                    {errors[`projects_description_${index}`]}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            className={cx('btnRemove')}
                            onClick={() => removeArrayItem(index)}
                        >
                            Xóa dự án
                        </button>
                    </div>
                ),
            )}

            <button
                type="button"
                className={cx('btnAdd')}
                onClick={() =>
                    appendArrayItem({
                        name: '',
                        role: '',
                        description: '',
                    })
                }
            >
                + Thêm dự án
            </button>
        </div>
    );
    case 'summary':
        return (
            <div className={cx('content')}>
                <div className={cx('field')}>
                    <textarea
                        data-field="summary"
                        className={cx('textarea', { inputError: errors?.summary })}
                        value={summaryText}
                        onChange={(e) => setSummaryText(e.target.value)}
                        onBlur={() => onChangeField('summary', summaryText)}
                    />
                    {errors?.summary && (
                        <p className={cx('fieldError')}>{errors.summary}</p>
                    )}
                </div>
            </div>
        );

        case 'skills':
            return (
                <div className={cx('content')}>
                    <div className={cx('field')}>
                        <textarea
                            data-field="skills"
                            className={cx('textarea', { inputError: errors?.skills })}
                            rows={5}
                            value={skillsText}
                            placeholder={`Nhập mỗi kỹ năng 1 dòng
        Node.js
        ExpressJS
        NestJS`}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSkillsText(value);
                                onChangeArrayField(
                                    parseSkillsText(value, sectionData),
                                );
                            }}
                        />
                        {errors?.skills && (
                            <p className={cx('fieldError')}>{errors.skills}</p>
                        )}
                    </div>
                </div>
            );

            case 'experience':
    return (
        <div className={cx('content')} data-field="experience">
            {errors?.experience && (
                <p className={cx('fieldError')}>{errors.experience}</p>
            )}

            {(Array.isArray(sectionData) ? sectionData : []).map(
                (item, index) => (
                    <div key={index} className={cx('field-group')}>
                        <div className={cx('field')}>
                            <input
                                data-field={`experience_company_${index}`}
                                className={cx('input', {
                                    inputError: errors?.[`experience_company_${index}`],
                                })}
                                placeholder="Công ty"
                                value={item.company || ''}
                                onChange={(e) =>
                                    onChangeObjectInArray(index, 'company', e.target.value)
                                }
                            />
                            {errors?.[`experience_company_${index}`] && (
                                <p className={cx('fieldError')}>
                                    {errors[`experience_company_${index}`]}
                                </p>
                            )}
                        </div>

                        <div className={cx('field')}>
                            <input
                                data-field={`experience_role_${index}`}
                                className={cx('input', {
                                    inputError: errors?.[`experience_role_${index}`],
                                })}
                                placeholder="Vị trí"
                                value={item.role || ''}
                                onChange={(e) =>
                                    onChangeObjectInArray(index, 'role', e.target.value)
                                }
                            />
                            {errors?.[`experience_role_${index}`] && (
                                <p className={cx('fieldError')}>
                                    {errors[`experience_role_${index}`]}
                                </p>
                            )}
                        </div>

                        <div className={cx('field')}>
                            <textarea
                                data-field={`experience_description_${index}`}
                                className={cx('textarea', {
                                    inputError: errors?.[`experience_description_${index}`],
                                })}
                                rows={3}
                                placeholder="Mô tả"
                                value={item.description || ''}
                                onChange={(e) =>
                                    onChangeObjectInArray(index, 'description', e.target.value)
                                }
                            />
                            {errors?.[`experience_description_${index}`] && (
                                <p className={cx('fieldError')}>
                                    {errors[`experience_description_${index}`]}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            className={cx('btnRemove')}
                            onClick={() => removeArrayItem(index)}
                        >
                            Xóa kinh nghiệm
                        </button>
                    </div>
                ),
            )}

            <button
                type="button"
                className={cx('btnAdd')}
                onClick={() =>
                    appendArrayItem({
                        company: '',
                        role: '',
                        description: '',
                    })
                }
            >
                + Thêm kinh nghiệm
            </button>
        </div>
    );
    case 'education':
    return (
        <div className={cx('content')} data-field="education">
            {errors?.education && (
                <p className={cx('fieldError')}>{errors.education}</p>
            )}

            {(Array.isArray(sectionData) ? sectionData : []).map(
                (item, index) => (
                    <div key={index} className={cx('field-group')}>
                        <div className={cx('field')}>
                            <input
                                data-field={`education_school_${index}`}
                                className={cx('input', {
                                    inputError: errors?.[`education_school_${index}`],
                                })}
                                placeholder="Trường học"
                                value={item.school || ''}
                                onChange={(e) =>
                                    onChangeObjectInArray(index, 'school', e.target.value)
                                }
                            />
                            {errors?.[`education_school_${index}`] && (
                                <p className={cx('fieldError')}>
                                    {errors[`education_school_${index}`]}
                                </p>
                            )}
                        </div>

                        <div className={cx('field')}>
                            <input
                                data-field={`education_degree_${index}`}
                                className={cx('input', {
                                    inputError: errors?.[`education_degree_${index}`],
                                })}
                                placeholder="Bằng cấp / Chuyên ngành"
                                value={item.degree || ''}
                                onChange={(e) =>
                                    onChangeObjectInArray(index, 'degree', e.target.value)
                                }
                            />
                            {errors?.[`education_degree_${index}`] && (
                                <p className={cx('fieldError')}>
                                    {errors[`education_degree_${index}`]}
                                </p>
                            )}
                        </div>

                        <div className={cx('field')}>
                            <textarea
                                data-field={`education_description_${index}`}
                                className={cx('textarea', {
                                    inputError: errors?.[`education_description_${index}`],
                                })}
                                rows={3}
                                placeholder="Mô tả"
                                value={item.description || ''}
                                onChange={(e) =>
                                    onChangeObjectInArray(index, 'description', e.target.value)
                                }
                            />
                            {errors?.[`education_description_${index}`] && (
                                <p className={cx('fieldError')}>
                                    {errors[`education_description_${index}`]}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            className={cx('btnRemove')}
                            onClick={() => removeArrayItem(index)}
                        >
                            Xóa học vấn
                        </button>
                    </div>
                ),
            )}

            <button
                type="button"
                className={cx('btnAdd')}
                onClick={() =>
                    appendArrayItem({
                        school: '',
                        degree: '',
                        description: '',
                    })
                }
            >
                + Thêm học vấn
            </button>
        </div>
    );
    case 'certificates':
    return (
        <div className={cx('content')} data-field="certificates">
            {(Array.isArray(sectionData) ? sectionData : []).map(
                (item, index) => (
                    <div key={index} className={cx('field-group')}>
                        <div className={cx('field')}>
                            <input
                                data-field={`certificates_name_${index}`}
                                className={cx('input', {
                                    inputError: errors?.[`certificates_name_${index}`],
                                })}
                                placeholder="Tên chứng chỉ"
                                value={item.name || ''}
                                onChange={(e) =>
                                    onChangeObjectInArray(index, 'name', e.target.value)
                                }
                            />
                            {errors?.[`certificates_name_${index}`] && (
                                <p className={cx('fieldError')}>
                                    {errors[`certificates_name_${index}`]}
                                </p>
                            )}
                        </div>

                        <div className={cx('field')}>
                            <input
                                data-field={`certificates_issuer_${index}`}
                                className={cx('input', {
                                    inputError: errors?.[`certificates_issuer_${index}`],
                                })}
                                placeholder="Đơn vị cấp"
                                value={item.issuer || ''}
                                onChange={(e) =>
                                    onChangeObjectInArray(index, 'issuer', e.target.value)
                                }
                            />
                            {errors?.[`certificates_issuer_${index}`] && (
                                <p className={cx('fieldError')}>
                                    {errors[`certificates_issuer_${index}`]}
                                </p>
                            )}
                        </div>

                        <div className={cx('field')}>
                            <textarea
                                data-field={`certificates_description_${index}`}
                                className={cx('textarea', {
                                    inputError: errors?.[`certificates_description_${index}`],
                                })}
                                rows={3}
                                placeholder="Mô tả chứng chỉ"
                                value={item.description || ''}
                                onChange={(e) =>
                                    onChangeObjectInArray(index, 'description', e.target.value)
                                }
                            />
                            {errors?.[`certificates_description_${index}`] && (
                                <p className={cx('fieldError')}>
                                    {errors[`certificates_description_${index}`]}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            className={cx('btnRemove')}
                            onClick={() => removeArrayItem(index)}
                        >
                            Xóa chứng chỉ
                        </button>
                    </div>
                ),
            )}

            <button
                type="button"
                className={cx('btnAdd')}
                onClick={() =>
                    appendArrayItem({
                        name: '',
                        issuer: '',
                        description: '',
                    })
                }
            >
                + Thêm chứng chỉ
            </button>
        </div>
    );

            default:
                return (
                    <div className={cx('content')}>
                        <p>Phần này chưa hỗ trợ</p>
                    </div>
                );
        }
    };

    return (
        <div className={cx('wrapper')}>
            <button className={cx('head')} onClick={onToggle}>
                <div className={cx('left')}>
                    <span className={cx('icon')}>
                        {ICON_MAP?.[section?.type] || <MdAdd />}
                    </span>
                    <span className={cx('title')}>
                        {section?.number}. {section?.title}
                    </span>
                </div>

                {isOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
            </button>

            {isOpen && renderFields()}
        </div>
    );
}

export default SectionEditor;
