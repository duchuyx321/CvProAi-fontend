import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import { FiMenu } from 'react-icons/fi';

import LeftEditor from './components/LeftEditor';
import RightPreview from './components/RightPreview';
import styles from './CvEditor.module.scss';
// import { getCvTemplateDetail } from '~/services/cv-teamplate.service';

const cx = classNames.bind(styles);

const MOCK_TEMPLATE_DETAIL = {
    success: true,
    messsage: 'Lấy mẫu cv thành công',
    data: {
        id: '29713ded-64c6-4af0-b11a-1323f3a51eb3',
        code: 'DEV_01',
        name: 'Mẫu CV đơn giản cho Dev 01',
        preview_url:
            'https://res.cloudinary.com/djzsbcrk9/image/upload/v1775665562/cvproai/lbglt6pqbmazd9thj3jf.webp',
        is_premium: false,
        content: {
            profile_header: {
                full_name: 'Nguyễn Văn A',
                headline: 'Senior Frontend Developer',
                avatar_url: '',
            },
            CONTACT: {
                email: 'anv@example.com',
                phone: '0901234567',
                website: '',
                birth_date: '',
                address: 'Quận 1, TP. Hồ Chí Minh',
            },
            SUMMARY:
                '<p>Với hơn 5 năm kinh nghiệm trong việc phát triển ứng dụng web, tôi mong muốn mang khả năng tối ưu hiệu năng và xây dựng giao diện người dùng mượt mà để đóng góp vào sự thành công của doanh nghiệp.</p>',
            SKILLS: [
                { name: 'ReactJS', description: 'Xây dựng UI hiện đại' },
                { name: 'TypeScript', description: 'Code an toàn, rõ ràng' },
            ],
            EXPERIENCE: [
                {
                    role: 'Senior Frontend Developer',
                    company: 'Công ty Công nghệ XYZ',
                    start_date: '01/2021',
                    end_date: '',
                    is_current: true,
                    description:
                        '<p>Dẫn dắt đội ngũ 5 người phát triển nền tảng thương mại điện tử.</p>',
                },
            ],
            EDUCATION: [
                {
                    school: 'Đại học Bách Khoa',
                    degree: 'Kỹ thuật Phần mềm',
                    start_date: '2014',
                    end_date: '2018',
                    is_current: false,
                    description: '<p>Tốt nghiệp loại Khá.</p>',
                },
            ],
            ADDITIONAL: {
                content: '<p>Có thể làm việc tốt trong môi trường Agile/Scrum.</p>',
            },
        },
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
                left_col: ['profile', 'contact', 'skills', 'additional'],
                right_col: ['summary', 'education', 'experience'],
            },
            layout: {
                key: 'split_blue_dev',
                body: {
                    layout: 'SPLIT',
                    columns: [
                        { id: 'left_col', width: 33 },
                        { id: 'right_col', width: 67 },
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
                    fields: ['birth_date', 'email', 'website', 'phone', 'address'],
                    variant: 'icon_list',
                },
                profile: {
                    type: 'profile_header',
                    title: 'Thông tin cá nhân',
                    fields: ['avatar_url', 'headline', 'full_name'],
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
                                    items: ['degree', 'school', 'description'],
                                    layout: 'STACK',
                                },
                                {
                                    items: ['start_date', 'end_date', 'is_current'],
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
                                    items: ['role', 'company', 'description'],
                                    layout: 'STACK',
                                },
                                {
                                    items: ['start_date', 'end_date', 'is_current'],
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

const SECTION_CONTENT_KEY_MAP = {
    profile: 'profile_header',
    contact: 'CONTACT',
    summary: 'SUMMARY',
    skills: 'SKILLS',
    experience: 'EXPERIENCE',
    projects: 'PROJECTS',
    education: 'EDUCATION',
    certificates: 'CERTIFICATES',
    additional: 'ADDITIONAL',
};

const TYPE_TO_CONTENT_KEY_MAP = {
    personal_info: 'profile_header',
    contact: 'CONTACT',
    summary: 'SUMMARY',
    skills: 'SKILLS',
    experience: 'EXPERIENCE',
    projects: 'PROJECTS',
    education: 'EDUCATION',
    certificates: 'CERTIFICATES',
    additional: 'ADDITIONAL',
};

const ARRAY_SECTION_TYPES = new Set([
    'skills',
    'experience',
    'projects',
    'education',
    'certificates',
]);

function normalizeSectionType(sectionKey, sectionConfig = {}) {
    const rawType = sectionConfig?.type || sectionKey;

    const typeMap = {
        profile: 'personal_info',
        profile_header: 'personal_info',
        contact: 'contact',
        CONTACT: 'contact',
        summary: 'summary',
        SUMMARY: 'summary',
        skills: 'skills',
        SKILLS: 'skills',
        experience: 'experience',
        EXPERIENCE: 'experience',
        projects: 'projects',
        PROJECTS: 'projects',
        education: 'education',
        EDUCATION: 'education',
        certificates: 'certificates',
        CERTIFICATES: 'certificates',
        additional: 'additional',
        ADDITIONAL: 'additional',
    };

    return typeMap[sectionKey] || typeMap[rawType] || sectionKey;
}

function getContentKey(sectionKey, sectionConfig = {}) {
    const normalizedType = normalizeSectionType(sectionKey, sectionConfig);
    return (
        SECTION_CONTENT_KEY_MAP[sectionKey] ||
        TYPE_TO_CONTENT_KEY_MAP[normalizedType] ||
        sectionKey
    );
}

function buildEditorResumeData(cvData = {}) {
    const content = cvData?.content || {};
    const configSections = cvData?.config?.sections || {};
    const result = {};

    Object.keys(configSections).forEach((sectionKey) => {
        const sectionConfig = configSections[sectionKey];
        const normalizedType = normalizeSectionType(sectionKey, sectionConfig);
        const contentKey = getContentKey(sectionKey, sectionConfig);
        const rawValue = content?.[contentKey];

        if (normalizedType === 'summary') {
            result[sectionKey] = {
                summary: typeof rawValue === 'string' ? rawValue : '',
            };
            return;
        }

        if (ARRAY_SECTION_TYPES.has(normalizedType)) {
            result[sectionKey] = Array.isArray(rawValue) ? rawValue : [];
            return;
        }

        result[sectionKey] =
            rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)
                ? rawValue
                : {};
    });

    return result;
}

function createInitialCvState() {
    return {
        id: '',
        name: '',
        code: '',
        content: {},
        config: {},
    };
}

function CvEditor() {
    const { code } = useParams();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
    const [cvData, setCvData] = useState(createInitialCvState);

    useEffect(() => {
        const fetchCvDetail = async () => {
            try {
                setLoading(true);

                // const result = await getCvTemplateDetail(code);
                const result = MOCK_TEMPLATE_DETAIL;

                if (!result?.success) {
                    throw new Error(result?.message || 'Không thể tải CV');
                }

                setCvData(result?.data || createInitialCvState());
            } catch (error) {
                toast.error(error?.message || 'Lỗi load CV');
            } finally {
                setLoading(false);
            }
        };

        if (code) {
            fetchCvDetail();
        }
    }, [code]);

    const resumeData = useMemo(() => buildEditorResumeData(cvData), [cvData]);

    const updateContentKey = (contentKey, updater) => {
        setCvData((prev) => {
            const prevContent = prev?.content || {};
            const prevValue = prevContent[contentKey];
            const nextValue =
                typeof updater === 'function' ? updater(prevValue) : updater;

            if (nextValue === undefined) {
                const { [contentKey]: _, ...restContent } = prevContent;
                return {
                    ...prev,
                    content: restContent,
                };
            }

            return {
                ...prev,
                content: {
                    ...prevContent,
                    [contentKey]: nextValue,
                },
            };
        });
    };

    const handleChangeField = (sectionKey, field, value) => {
        const sectionConfig = cvData?.config?.sections?.[sectionKey] || {};
        const normalizedType = normalizeSectionType(sectionKey, sectionConfig);
        const contentKey = getContentKey(sectionKey, sectionConfig);

        if (normalizedType === 'summary') {
            updateContentKey(contentKey, value);
            return;
        }

        updateContentKey(contentKey, (prevValue = {}) => ({
            ...prevValue,
            [field]: value,
        }));
    };

    const handleChangeArrayField = (sectionKey, nextValue) => {
        const sectionConfig = cvData?.config?.sections?.[sectionKey] || {};
        const contentKey = getContentKey(sectionKey, sectionConfig);

        updateContentKey(contentKey, Array.isArray(nextValue) ? nextValue : []);
    };

    const handleChangeObjectInArray = (sectionKey, index, key, value) => {
        const sectionConfig = cvData?.config?.sections?.[sectionKey] || {};
        const contentKey = getContentKey(sectionKey, sectionConfig);

        updateContentKey(contentKey, (prevValue) => {
            const currentList = Array.isArray(prevValue) ? prevValue : [];
            const nextList = [...currentList];

            nextList[index] = {
                ...(nextList[index] || {}),
                [key]: value,
            };

            return nextList;
        });
    };

    const handleChangeConfig = (nextConfig) => {
        setCvData((prev) => ({
            ...prev,
            config: nextConfig,
        }));
    };

    const handleRemoveSection = (sectionKey) => {
        const sectionConfig = cvData?.config?.sections?.[sectionKey] || {};
        const normalizedType = normalizeSectionType(sectionKey, sectionConfig);
        const contentKey = getContentKey(sectionKey, sectionConfig);

        if (normalizedType === 'summary') {
            updateContentKey(contentKey, '');
            return;
        }

        if (ARRAY_SECTION_TYPES.has(normalizedType)) {
            updateContentKey(contentKey, []);
            return;
        }

        updateContentKey(contentKey, {});
    };

    const handleSaveCv = async () => {
        if (submitting) return;

        try {
            setSubmitting(true);

            // await saveCv(cvData);
            toast.success('Lưu CV thành công');
        } catch (error) {
            toast.error(error?.message || 'Lỗi lưu CV');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownloadPdf = () => {
        toast.info('Chưa làm PDF');
    };

    const handleResetData = () => {
        const confirmed = window.confirm(
            'Bạn có chắc muốn reset toàn bộ dữ liệu CV không?',
        );

        if (!confirmed) return;

        setCvData((prev) => ({
            ...prev,
            content: {},
        }));

        toast.success('Đã reset dữ liệu CV');
    };

    if (loading) {
        return (
            <section className={cx('wrapper')}>
                <div className={cx('loading')}>
                    <p>Đang tải dữ liệu CV...</p>
                </div>
            </section>
        );
    }

    return (
        <section className={cx('wrapper')}>
            <div className={cx('inner')}>
                {!isLeftPanelOpen && (
                    <button
                        type="button"
                        className={cx('open-panel-btn')}
                        onClick={() => setIsLeftPanelOpen(true)}
                    >
                        <FiMenu />
                    </button>
                )}

                <LeftEditor
                    isOpen={isLeftPanelOpen}
                    onTogglePanel={() => setIsLeftPanelOpen(false)}
                    resumeData={resumeData}
                    onChangeField={handleChangeField}
                    onChangeArrayField={handleChangeArrayField}
                    onChangeObjectInArray={handleChangeObjectInArray}
                    onRemoveSection={handleRemoveSection}
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