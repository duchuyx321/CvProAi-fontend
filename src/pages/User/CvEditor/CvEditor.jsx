import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import { FiMenu } from 'react-icons/fi';

import LeftEditor from './components/LeftEditor';
import RightPreview from './components/RightPreview';
import styles from './CvEditor.module.scss';
import { getCvTemplateDetail } from '~/services/cv-teamplate.service';

const cx = classNames.bind(styles);

const SECTION_KEY_MAP = {
    personal_info: 'profile_header',
    summary: 'SUMMARY',
    skills: 'SKILLS',
    experience: 'EXPERIENCE',
    projects: 'PROJECTS',
    education: 'EDUCATION',
    certificates: 'CERTIFICATES',
};

function CvEditor() {
    const { code } = useParams();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState('content');
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);

    const [cvData, setCvData] = useState({
        id: '',
        title: '',
        code: '',
        content: {},
        config: {},
    });

    const [openSections, setOpenSections] = useState({
        personal_info: true,
        summary: false,
        skills: false,
        experience: false,
        projects: false,
        education: false,
        certificates: false,
    });

    // ================= FETCH DATA =================
    useEffect(() => {
        const fetchCvDetail = async () => {
            try {
                setLoading(true);
                // const result = await getCvTemplateDetail(code);
                const result = {
                    success: true,
                    messsage: 'Lấy mẫu cv thành công',
                    data: {
                        id: '29713ded-64c6-4af0-b11a-1323f3a51eb3',
                        code: 'DEV_01',
                        name: 'Mẫu CV đơn giản cho Dev 01',
                        preview_url:
                            'https://res.cloudinary.com/djzsbcrk9/image/upload/v1775665562/cvproai/lbglt6pqbmazd9thj3jf.webp',
                        is_premium: false,
                        config: {
                            theme: {
                                colors: {
                                    accent: '#EAF3FC',
                                    primary: '#3F73A7',
                                },
                                prefix: '//',
                                spacing: {
                                    itemGap: 12,
                                    sectionGap: 24,
                                },
                                fontFamily: 'Inter',
                            },
                            zones: {
                                left_col: [
                                    'profile',
                                    'contact',
                                    'skills',
                                    'additional',
                                ],
                                right_col: [
                                    'summary',
                                    'education',
                                    'experience',
                                ],
                            },
                            layout: {
                                key: 'split_blue_dev',
                                body: {
                                    layout: 'SPLIT',
                                    columns: [
                                        {
                                            id: 'left_col',
                                            width: 33,
                                        },
                                        {
                                            id: 'right_col',
                                            width: 67,
                                        },
                                    ],
                                },
                                page: {
                                    size: 'A4',
                                    margin: {
                                        top: 12,
                                        left: 12,
                                        right: 12,
                                        bottom: 12,
                                    },
                                },
                            },
                            version: 1,
                            sections: {
                                skills: {
                                    type: 'SKILLS',
                                    title: 'Các Kỹ Năng',
                                    fields: ['name', 'description'],
                                    variant: 'sidebar_box_richtext',
                                },
                                contact: {
                                    type: 'CONTACT',
                                    title: 'Thông Tin Liên Hệ',
                                    fields: [
                                        'birth_date',
                                        'email',
                                        'website',
                                        'phone',
                                        'address',
                                    ],
                                    variant: 'icon_list',
                                },
                                profile: {
                                    type: 'profile_header',
                                    title: '',
                                    fields: [
                                        'avatar_url',
                                        'headline',
                                        'full_name',
                                    ],
                                    variant: 'sidebar_avatar_badge_name',
                                },
                                summary: {
                                    type: 'SUMMARY',
                                    title: 'Mục Tiêu Nghề Nghiệp',
                                    fields: ['SUMMARY'],
                                    variant: 'content_box_richtext',
                                },
                                education: {
                                    type: 'EDUCATION',
                                    title: 'Học Vấn',
                                    fields: [
                                        {
                                            items: [
                                                {
                                                    items: [
                                                        'degree',
                                                        'school',
                                                        'description',
                                                    ],
                                                    layout: 'STACK',
                                                },
                                                {
                                                    items: [
                                                        'start_date',
                                                        'end_date',
                                                        'is_current',
                                                    ],
                                                    layout: 'STACK',
                                                },
                                            ],
                                            layout: 'SPLIT',
                                        },
                                    ],
                                    variant: 'card_right_date_badge',
                                },
                                additional: {
                                    type: 'ADDITIONAL',
                                    title: 'Thông Tin Thêm',
                                    fields: ['content'],
                                    variant: 'sidebar_box_richtext',
                                },
                                experience: {
                                    type: 'EXPERIENCE',
                                    title: 'Kinh Nghiệm Làm Việc',
                                    fields: [
                                        {
                                            items: [
                                                {
                                                    items: [
                                                        'role',
                                                        'company',
                                                        'description',
                                                    ],
                                                    layout: 'STACK',
                                                },
                                                {
                                                    items: [
                                                        'start_date',
                                                        'end_date',
                                                        'is_current',
                                                    ],
                                                    layout: 'STACK',
                                                },
                                            ],
                                            layout: 'SPLIT',
                                        },
                                    ],
                                    variant: 'card_right_date_badge',
                                },
                            },
                        },
                        created_at: '2026-04-08T03:42:24.278Z',
                    },
                    date: '09:17:01 13/4/2026',
                    path: '/api/v1/cv-templates/code/DEV_01',
                };
                if (!result?.success) {
                    throw new Error(result?.message || 'Không thể tải CV');
                }

                setCvData(result.data || {});
            } catch (error) {
                toast.error(error?.message || 'Lỗi load CV');
            } finally {
                setLoading(false);
            }
        };

        if (code) fetchCvDetail();
    }, [code]);

    // ================= SECTIONS =================
    const sectionList = useMemo(
        () => [
            {
                key: 'personal_info',
                title: 'Thông tin cá nhân',
                type: 'personal_info',
                number: 1,
            },
            {
                key: 'summary',
                title: 'Mục tiêu nghề nghiệp',
                type: 'summary',
                number: 2,
            },
            { key: 'skills', title: 'Kỹ năng', type: 'skills', number: 3 },
            {
                key: 'experience',
                title: 'Kinh nghiệm',
                type: 'experience',
                number: 4,
            },
            { key: 'projects', title: 'Dự án', type: 'projects', number: 5 },
            {
                key: 'education',
                title: 'Học vấn',
                type: 'education',
                number: 6,
            },
            {
                key: 'certificates',
                title: 'Chứng chỉ',
                type: 'certificates',
                number: 7,
            },
        ],
        [],
    );

    // ================= MAP DATA =================
    const editorResumeData = {
        personal_info: {
            ...(cvData?.content?.profile_header || {}),
            ...(cvData?.content?.CONTACT || {}),
        },

        summary: {
            summary: cvData?.content?.SUMMARY || '',
        },

        skills: cvData?.content?.SKILLS || [],
        experience: cvData?.content?.EXPERIENCE || [],
        projects: cvData?.content?.PROJECTS || [],
        education: cvData?.content?.EDUCATION || [],
        certificates: cvData?.content?.CERTIFICATES || [],
    };

    // ================= HANDLERS =================
    const handleToggleSection = (key) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const PERSONAL_CONTACT_FIELDS = ['email', 'phone', 'address', 'website'];

    const handleChangeField = (sectionKey, field, value) => {
        // ===== PERSONAL INFO =====
        if (sectionKey === 'personal_info') {
            if (PERSONAL_CONTACT_FIELDS.includes(field)) {
                setCvData((prev) => ({
                    ...prev,
                    content: {
                        ...prev.content,
                        CONTACT: {
                            ...(prev.content?.CONTACT || {}),
                            [field]: value,
                        },
                    },
                }));
                return;
            }

            setCvData((prev) => ({
                ...prev,
                content: {
                    ...prev.content,
                    profile_header: {
                        ...(prev.content?.profile_header || {}),
                        [field]: value,
                    },
                },
            }));
            return;
        }

        const contentKey = SECTION_KEY_MAP[sectionKey] || sectionKey;

        if (sectionKey === 'summary') {
            setCvData((prev) => ({
                ...prev,
                content: {
                    ...(prev.content || {}),
                    [contentKey]: value, // lưu string
                },
            }));
            return;
        }

        // các section khác
        setCvData((prev) => ({
            ...prev,
            content: {
                ...(prev.content || {}),
                [contentKey]: {
                    ...(prev.content?.[contentKey] || {}),
                    [field]: value,
                },
            },
        }));
    };

    const handleChangeArrayField = (sectionKey, nextValue) => {
        const contentKey = SECTION_KEY_MAP[sectionKey];

        setCvData((prev) => ({
            ...prev,
            content: {
                ...prev.content,
                [contentKey]: Array.isArray(nextValue) ? nextValue : [],
            },
        }));
    };

    const handleChangeObjectInArray = (sectionKey, index, key, value) => {
        const contentKey = SECTION_KEY_MAP[sectionKey];

        setCvData((prev) => {
            const list = Array.isArray(prev.content?.[contentKey])
                ? prev.content[contentKey]
                : [];

            const newList = [...list];
            newList[index] = {
                ...(newList[index] || {}),
                [key]: value,
            };

            return {
                ...prev,
                content: {
                    ...prev.content,
                    [contentKey]: newList,
                },
            };
        });
    };

    const handleChangeConfig = (nextConfig) => {
        setCvData((prev) => ({
            ...prev,
            config: nextConfig,
        }));
    };

    const handleSaveCv = async () => {
        if (submitting) return;

        try {
            setSubmitting(true);
            toast.success('Lưu CV thành công');
            // eslint-disable-next-line no-unused-vars
        } catch (error) {
            toast.error('Lỗi lưu CV');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownloadPdf = () => {
        toast.info('Chưa làm PDF');
    };

    const handleResetData = () => {
        if (window.confirm('Reset CV?')) {
            setCvData((prev) => ({ ...prev, content: {} }));
            toast.success('Đã reset');
        }
    };

    // ================= UI =================
    if (loading) return <div>Loading...</div>;

    return (
        <section className={cx('wrapper')}>
            <div
                className={cx('inner')}
                style={{ display: 'flex', height: '100vh' }}
            >
                {!isLeftPanelOpen && (
                    <button onClick={() => setIsLeftPanelOpen(true)}>
                        <FiMenu />
                    </button>
                )}

                <LeftEditor
                    isOpen={isLeftPanelOpen}
                    onTogglePanel={() => setIsLeftPanelOpen(false)}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    sectionList={sectionList}
                    openSections={openSections}
                    onToggleSection={handleToggleSection}
                    resumeData={editorResumeData}
                    onChangeField={handleChangeField}
                    onChangeArrayField={handleChangeArrayField}
                    onChangeObjectInArray={handleChangeObjectInArray}
                    templateConfig={cvData?.config || {}}
                    onChangeConfig={handleChangeConfig}
                    onResetData={handleResetData}
                    onSaveCv={handleSaveCv}
                    onDownloadPdf={handleDownloadPdf}
                    submitting={submitting}
                />

                <RightPreview templateDetail={cvData} />
            </div>
        </section>
    );
}

export default CvEditor;
