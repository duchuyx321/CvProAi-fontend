import classNames from 'classnames/bind';
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

function renderSectionFields({
    type,
    resumeData,
    onChangeField,
    onChangeArrayField,
    onChangeObjectInArray,
}) {
    switch (type) {
        case 'personal_info':
            return (
                <div className={cx('content')}>
                    <div className={cx('gridTwo')}>
                        <div className={cx('field')}>
                            <label className={cx('label')}>Họ và tên</label>
                            <input
                                className={cx('input')}
                                value={resumeData?.full_name || ''}
                                onChange={(e) =>
                                    onChangeField('full_name', e.target.value)
                                }
                            />
                        </div>

                        <div className={cx('field')}>
                            <label className={cx('label')}>
                                Vị trí ứng tuyển
                            </label>
                            <input
                                className={cx('input')}
                                value={resumeData?.headline || ''}
                                onChange={(e) =>
                                    onChangeField('headline', e.target.value)
                                }
                            />
                        </div>

                        <div className={cx('field')}>
                            <label className={cx('label')}>Email</label>
                            <input
                                className={cx('input')}
                                value={resumeData?.email || ''}
                                onChange={(e) =>
                                    onChangeField('email', e.target.value)
                                }
                            />
                        </div>

                        <div className={cx('field')}>
                            <label className={cx('label')}>
                                Số điện thoại
                            </label>
                            <input
                                className={cx('input')}
                                value={resumeData?.phone || ''}
                                onChange={(e) => onChangeField('phone', e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className={cx('field')}>
                        <label className={cx('label')}>Địa chỉ</label>
                        <input
                            className={cx('input')}
                            value={resumeData?.address || ''}
                            onChange={(e) =>
                                onChangeField('address', e.target.value)
                            }
                        />
                    </div>
                </div>
            );

        case 'summary':
            return (
                <div className={cx('content')}>
                    <div className={cx('field')}>
                        <textarea
                            className={cx('textarea')}
                            rows={6}
                            value={resumeData?.summary || ''}
                            onChange={(e) =>
                                onChangeField('summary', e.target.value)
                            }
                        />
                    </div>
                </div>
            );

        case 'skills':
            return (
                <div className={cx('content')}>
                    <div className={cx('field')}>
                        <textarea
                            className={cx('textarea')}
                            rows={4}
                            value={
                                Array.isArray(resumeData?.skills)
                                    ? resumeData.skills.join(', ')
                                    : ''
                            }
                            onChange={(e) =>
                                onChangeArrayField('skills', e.target.value)
                            }
                            placeholder="ReactJS, Tailwind CSS, TypeScript"
                        />
                    </div>
                </div>
            );

        case 'experience':
            return (
                <div className={cx('content')}>
                    {(resumeData?.experience || []).map((item, index) => (
                        <div key={index} className={cx('field-group')}>
                            <div className={cx('field')}>
                                <label className={cx('label')}>Công ty</label>
                                <input
                                    className={cx('input')}
                                    value={item.company || ''}
                                    placeholder="Tên công ty"
                                    onChange={(e) =>
                                        onChangeObjectInArray('experience', index, 'company', e.target.value)
                                    }
                                />
                            </div>

                            <div className={cx('field')}>
                                <label className={cx('label')}>Vị trí</label>
                                <input
                                    className={cx('input')}
                                    value={item.position || ''}
                                    placeholder="Vị trí công việc"
                                    onChange={(e) =>
                                        onChangeObjectInArray('experience', index, 'position', e.target.value)
                                    }
                                />
                            </div>

                            <div className={cx('field')}>
                                <label className={cx('label')}>Thời gian</label>
                                <input
                                    className={cx('input')}
                                    value={item.time || ''}
                                    placeholder="01/2023 - 12/2023"
                                    onChange={(e) =>
                                        onChangeObjectInArray('experience', index, 'time', e.target.value)
                                    }
                                />
                            </div>

                            <div className={cx('field')}>
                                <label className={cx('label')}>Mô tả</label>
                                <textarea
                                    className={cx('textarea')}
                                    rows={3}
                                    value={
                                        Array.isArray(item.description)
                                            ? item.description.join('\n')
                                            : ''
                                    }
                                    placeholder="Mỗi dòng là một mô tả..."
                                    onChange={(e) =>
                                        onChangeObjectInArray(
                                            'experience',
                                            index,
                                            'description',
                                            e.target.value.split('\n')
                                        )
                                    }
                                />
                            </div>
                        </div>
                    ))}
                </div>
            );

        default:
            return (
                <div className={cx('content')}>
                    <p className={cx('placeholder')}>
                        Phần này sẽ được triển khai chi tiết sau.
                    </p>
                </div>
            );
    }
}

function SectionEditor({
    section,
    isOpen = false,
    onToggle,
    resumeData = {},
    onChangeField,
    onChangeArrayField,
    onChangeObjectInArray,
}) {
    return (
        <div className={cx('wrapper')}>
            <button type="button" className={cx('head')} onClick={onToggle}>
                <div className={cx('left')}>
                    <span className={cx('icon')}>
                        {ICON_MAP?.[section?.type] || <MdAdd />}
                    </span>

                    <span className={cx('title')}>
                        {section?.number}. {section?.title}</span>
                </div>

                <span className={cx('arrow')}>
                    {isOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                </span>
            </button>

            {isOpen
                ? renderSectionFields({
                    type: section?.type,
                    resumeData,
                    onChangeField,
                    onChangeArrayField,
                    onChangeObjectInArray,
                })
                : null}
        </div>
    );
}

export default SectionEditor;