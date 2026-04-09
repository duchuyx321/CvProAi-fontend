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

function buildSkillsText(sectionData) {
    if (!Array.isArray(sectionData)) return '';

    return sectionData
        .map((item) => {
            if (typeof item === 'string') return item;
            return item?.name || '';
        })
        .filter(Boolean)
        .join(', ');
}

function parseSkillsText(text, currentSkills = []) {
    const currentMap = new Map(
        (Array.isArray(currentSkills) ? currentSkills : [])
            .filter((item) => item && typeof item === 'object' && item.name)
            .map((item) => [item.name.toLowerCase(), item]),
    );

    return text
        .split(',')
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

function renderSectionFields({
    type,
    sectionData,
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
                                value={sectionData?.full_name || ''}
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
                                value={sectionData?.headline || ''}
                                onChange={(e) =>
                                    onChangeField('headline', e.target.value)
                                }
                            />
                        </div>

                        <div className={cx('field')}>
                            <label className={cx('label')}>Email</label>
                            <input
                                className={cx('input')}
                                value={sectionData?.email || ''}
                                onChange={(e) =>
                                    onChangeField('email', e.target.value)
                                }
                            />
                        </div>

                        <div className={cx('field')}>
                            <label className={cx('label')}>Số điện thoại</label>
                            <input
                                className={cx('input')}
                                value={sectionData?.phone || ''}
                                onChange={(e) =>
                                    onChangeField('phone', e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className={cx('field')}>
                        <label className={cx('label')}>Địa chỉ</label>
                        <input
                            className={cx('input')}
                            value={sectionData?.address || ''}
                            onChange={(e) =>
                                onChangeField('address', e.target.value)
                            }
                        />
                    </div>

                    <div className={cx('field')}>
                        <label className={cx('label')}>Website</label>
                        <input
                            className={cx('input')}
                            value={sectionData?.website || ''}
                            onChange={(e) =>
                                onChangeField('website', e.target.value)
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
                            value={sectionData?.summary || ''}
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
                            value={buildSkillsText(sectionData)}
                            onChange={(e) =>
                                onChangeArrayField(
                                    parseSkillsText(
                                        e.target.value,
                                        sectionData,
                                    ),
                                )
                            }
                            placeholder="Node.js, ExpressJS, NestJS"
                        />
                    </div>
                </div>
            );

        case 'experience':
            return (
                <div className={cx('content')}>
                    {(Array.isArray(sectionData) ? sectionData : []).map(
                        (item, index) => (
                            <div key={index} className={cx('field-group')}>
                                <div className={cx('field')}>
                                    <label className={cx('label')}>
                                        Công ty
                                    </label>
                                    <input
                                        className={cx('input')}
                                        value={item.company || ''}
                                        placeholder="Tên công ty"
                                        onChange={(e) =>
                                            onChangeObjectInArray(
                                                index,
                                                'company',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className={cx('field')}>
                                    <label className={cx('label')}>
                                        Vị trí
                                    </label>
                                    <input
                                        className={cx('input')}
                                        value={item.role || ''}
                                        placeholder="Vị trí công việc"
                                        onChange={(e) =>
                                            onChangeObjectInArray(
                                                index,
                                                'role',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className={cx('gridTwo')}>
                                    <div className={cx('field')}>
                                        <label className={cx('label')}>
                                            Bắt đầu
                                        </label>
                                        <input
                                            className={cx('input')}
                                            value={item.start_date || ''}
                                            placeholder="01/2025"
                                            onChange={(e) =>
                                                onChangeObjectInArray(
                                                    index,
                                                    'start_date',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className={cx('field')}>
                                        <label className={cx('label')}>
                                            Kết thúc
                                        </label>
                                        <input
                                            className={cx('input')}
                                            value={item.end_date || ''}
                                            placeholder="Hiện tại"
                                            onChange={(e) =>
                                                onChangeObjectInArray(
                                                    index,
                                                    'end_date',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className={cx('field')}>
                                    <label className={cx('label')}>Mô tả</label>
                                    <textarea
                                        className={cx('textarea')}
                                        rows={3}
                                        value={item.description || ''}
                                        placeholder="Mô tả công việc"
                                        onChange={(e) =>
                                            onChangeObjectInArray(
                                                index,
                                                'description',
                                                e.target.value,
                                            )
                                        }
                                    />
                                </div>

                                <div className={cx('field')}>
                                    <label className={cx('label')}>
                                        Thành tựu
                                    </label>
                                    <textarea
                                        className={cx('textarea')}
                                        rows={4}
                                        value={
                                            Array.isArray(item.achievements)
                                                ? item.achievements.join('\n')
                                                : ''
                                        }
                                        placeholder="Mỗi dòng là một thành tựu"
                                        onChange={(e) =>
                                            onChangeObjectInArray(
                                                index,
                                                'achievements',
                                                e.target.value
                                                    .split('\n')
                                                    .map((line) => line.trim())
                                                    .filter(Boolean),
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        ),
                    )}
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
    sectionData = {},
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
                        {section?.number}. {section?.title}
                    </span>
                </div>

                <span className={cx('arrow')}>
                    {isOpen ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                </span>
            </button>

            {isOpen
                ? renderSectionFields({
                      type: section?.type,
                      sectionData,
                      onChangeField,
                      onChangeArrayField,
                      onChangeObjectInArray,
                  })
                : null}
        </div>
    );
}

export default SectionEditor;
