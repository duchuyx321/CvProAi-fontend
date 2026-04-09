import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import { FiMenu } from 'react-icons/fi';

// import { saveCv } from '~/services/cv-editor.service';
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

// function toEditorResumeData(content = {}) {
//     return {
//         personal_info: content?.profile_header || {},
//         summary: content?.SUMMARY || {},
//         skills: content?.SKILLS || [],
//         experience: content?.EXPERIENCE || [],
//         projects: content?.PROJECTS || [],
//         education: content?.EDUCATION || [],
//         certificates: content?.CERTIFICATES || [],
//     };
// }

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

    useEffect(() => {
        const fetchCvDetail = async () => {
            try {
                setLoading(true);

                const result = await getCvTemplateDetail(code);

                if (!result?.success) {
                    throw new Error(
                        result?.message || 'Không thể tải dữ liệu CV',
                    );
                }

                setCvData(result.data || {});
            } catch (error) {
                toast.error(
                    error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
                );
            } finally {
                setLoading(false);
            }
        };

        if (code) fetchCvDetail();
    }, [code]);

    const sectionList = useMemo(
        () => [
            {
                key: 'personal_info',
                zoneKey: 'profile_header',
                title: 'Thông tin cá nhân',
                type: 'personal_info',
                number: 1,
            },
            {
                key: 'summary',
                zoneKey: 'SUMMARY',
                title: 'Mục tiêu nghề nghiệp',
                type: 'summary',
                number: 2,
            },
            {
                key: 'skills',
                zoneKey: 'SKILLS',
                title: 'Kỹ năng',
                type: 'skills',
                number: 3,
            },
            {
                key: 'experience',
                zoneKey: 'EXPERIENCE',
                title: 'Kinh nghiệm làm việc',
                type: 'experience',
                number: 4,
            },
            {
                key: 'projects',
                zoneKey: 'PROJECTS',
                title: 'Dự án',
                type: 'projects',
                number: 5,
            },
            {
                key: 'education',
                zoneKey: 'EDUCATION',
                title: 'Học vấn',
                type: 'education',
                number: 6,
            },
            {
                key: 'certificates',
                zoneKey: 'CERTIFICATES',
                title: 'Chứng chỉ',
                type: 'certificates',
                number: 7,
            },
        ],
        [],
    );

    const editorResumeData = {
        personal_info: {
            ...(cvData?.content?.profile_header || {}),
            ...(cvData?.content?.CONTACT || {}),
        },
        summary: cvData?.content?.SUMMARY || {},
        skills: cvData?.content?.SKILLS || [],
        experience: cvData?.content?.EXPERIENCE || [],
        projects: cvData?.content?.PROJECTS || [],
        education: cvData?.content?.EDUCATION || [],
        certificates: cvData?.content?.CERTIFICATES || [],
    };

    const handleToggleSection = (key) => {
        setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const PERSONAL_CONTACT_FIELDS = ['email', 'phone', 'address', 'website'];

    const handleChangeField = (sectionKey, field, value) => {
        if (sectionKey === 'personal_info') {
            if (PERSONAL_CONTACT_FIELDS.includes(field)) {
                setCvData((prev) => ({
                    ...prev,
                    content: {
                        ...(prev.content || {}),
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
                    ...(prev.content || {}),
                    profile_header: {
                        ...(prev.content?.profile_header || {}),
                        [field]: value,
                    },
                },
            }));
            return;
        }

        // các section khác giữ như cũ
    };

    const handleChangeArrayField = (sectionKey, nextValue) => {
        const contentKey = SECTION_KEY_MAP[sectionKey] || sectionKey;

        setCvData((prev) => ({
            ...prev,
            content: {
                ...(prev.content || {}),
                [contentKey]: Array.isArray(nextValue) ? nextValue : [],
            },
        }));
    };

    const handleChangeObjectInArray = (sectionKey, index, key, value) => {
        const contentKey = SECTION_KEY_MAP[sectionKey] || sectionKey;

        setCvData((prev) => {
            const currentList = Array.isArray(prev?.content?.[contentKey])
                ? prev.content[contentKey]
                : [];

            const nextList = [...currentList];
            nextList[index] = {
                ...(nextList[index] || {}),
                [key]: value,
            };

            return {
                ...prev,
                content: {
                    ...(prev.content || {}),
                    [contentKey]: nextList,
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

            // const result = await saveCv(cvData.id, {
            //   title: cvData.title,
            //   content: cvData.content,
            //   config: cvData.config,
            // });

            // if (!result?.success) {
            //   throw new Error(result?.message || 'Lưu CV thất bại');
            // }

            toast.success('Lưu CV thành công');
        } catch (error) {
            toast.error(
                error?.message || 'Có lỗi xảy ra, vui lòng thử lại sau',
            );
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownloadPdf = () => {
        toast.info('Tính năng tải PDF sẽ được triển khai sau');
    };

    const handleResetData = () => {
        if (
            window.confirm(
                'Bạn có chắc chắn muốn xóa toàn bộ dữ liệu CV để làm lại từ đầu không?',
            )
        ) {
            setCvData((prev) => ({
                ...prev,
                content: {},
            }));
            toast.success('Đã làm mới dữ liệu CV!');
        }
    };

    if (loading) {
        return (
            <section className={cx('wrapper')}>
                <div className={cx('loading')}>Đang tải dữ liệu...</div>
            </section>
        );
    }

    return (
        <section className={cx('wrapper')}>
            <div
                className={cx('inner')}
                style={{
                    position: 'relative',
                    display: 'flex',
                    height: '100vh',
                    width: '100%',
                }}
            >
                {!isLeftPanelOpen && (
                    <button
                        type="button"
                        onClick={() => setIsLeftPanelOpen(true)}
                        title="Mở bảng điều khiển"
                        style={{
                            position: 'absolute',
                            top: '16px',
                            left: '16px',
                            zIndex: 9999,
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            background: '#ffffff',
                            color: '#0f172a',
                            border: '1px solid #cbd5e1',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                        }}
                    >
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
