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
}) {
    const [skillsText, setSkillsText] = useState('');

    useEffect(() => {
        if (section?.type === 'skills') {
            setSkillsText(buildSkillsText(sectionData));
        }
    }, [sectionData, section?.type]);

    const renderFields = () => {
        switch (section?.type) {
            case 'personal_info':
                return (
                    <div className={cx('content')}>
                        <div className={cx('gridTwo')}>
                            <input
                                className={cx('input')}
                                placeholder="Họ và tên"
                                value={sectionData?.full_name || ''}
                                onChange={(e) =>
                                    onChangeField('full_name', e.target.value)
                                }
                            />
                            <input
                                className={cx('input')}
                                placeholder="Vị trí ứng tuyển"
                                value={sectionData?.headline || ''}
                                onChange={(e) =>
                                    onChangeField('headline', e.target.value)
                                }
                            />
                            <input
                                className={cx('input')}
                                placeholder="Email"
                                value={sectionData?.email || ''}
                                onChange={(e) =>
                                    onChangeField('email', e.target.value)
                                }
                            />
                            <input
                                className={cx('input')}
                                placeholder="Số điện thoại"
                                value={sectionData?.phone || ''}
                                onChange={(e) =>
                                    onChangeField('phone', e.target.value)
                                }
                            />
                        </div>

                        <input
                            className={cx('input')}
                            placeholder="Địa chỉ"
                            value={sectionData?.address || ''}
                            onChange={(e) =>
                                onChangeField('address', e.target.value)
                            }
                        />

                        <input
                            className={cx('input')}
                            placeholder="Website"
                            value={sectionData?.website || ''}
                            onChange={(e) =>
                                onChangeField('website', e.target.value)
                            }
                        />
                    </div>
                );

            case 'summary': {
                const [localValue, setLocalValue] = useState('');

                useEffect(() => {
                    setLocalValue(sectionData?.summary || '');
                }, [sectionData?.summary]);

                return (
                    <div className={cx('content')}>
                        <div className={cx('field')}>
                            <textarea
                                className={cx('textarea')}
                                // rows={6}
                                whitespace="pre-line"
                                value={localValue}
                                onChange={(e) => setLocalValue(e.target.value)}
                                onBlur={() =>
                                    onChangeField('summary', localValue)
                                }
                            />
                        </div>
                    </div>
                );
            }

            case 'skills':
                return (
                    <div className={cx('content')}>
                        <textarea
                            className={cx('textarea')}
                            rows={5}
                            value={skillsText}
                            placeholder={`Nhập mỗi kỹ năng 1 dòng
Node.js
ExpressJS
NestJS`}
                            onChange={(e) => {
                                const value = e.target.value;
                                setSkillsText(value); // ✅ giữ xuống dòng
                                onChangeArrayField(
                                    parseSkillsText(value, sectionData),
                                );
                            }}
                        />
                    </div>
                );

            case 'experience':
                return (
                    <div className={cx('content')}>
                        {(Array.isArray(sectionData) ? sectionData : []).map(
                            (item, index) => (
                                <div key={index} className={cx('field-group')}>
                                    <input
                                        className={cx('input')}
                                        placeholder="Công ty"
                                        value={item.company || ''}
                                        onChange={(e) =>
                                            onChangeObjectInArray(
                                                index,
                                                'company',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <input
                                        className={cx('input')}
                                        placeholder="Vị trí"
                                        value={item.role || ''}
                                        onChange={(e) =>
                                            onChangeObjectInArray(
                                                index,
                                                'role',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    <textarea
                                        className={cx('textarea')}
                                        rows={3}
                                        placeholder="Mô tả"
                                        value={item.description || ''}
                                        onChange={(e) =>
                                            onChangeObjectInArray(
                                                index,
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>
                            ),
                        )}
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
