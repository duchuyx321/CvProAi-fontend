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
                const result = await getCvTemplateDetail(code);

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

        // ✅ FIX riêng cho summary
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
