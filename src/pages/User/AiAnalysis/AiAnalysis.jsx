import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';

import CVUploadCard from './components/CVUploadCard';
import JobDescriptionCard from './components/JobDescriptionCard';
import SavedCVList from './components/CVList';
import { buildAnalyzeCVFormData } from '~/services/aiAnalysis.service';
import { validateAIAnalysisForm } from '~/utils/aiAnalysis.validator';
import { validateJobDescriptionFile } from '~/utils/jobDescriptionFile.validator';
import styles from './AiAnalysis.module.scss';

const cx = classNames.bind(styles);

const MOCK_SAVED_CVS = [
    {
        id: 1,
        fileName: 'CV_Frontend_React_NguyenVanA.pdf',
        fileUrl: '#',
        updatedAt: '2026-04-10',
        role: 'Frontend Developer',
        location: 'Hồ Chí Minh',
        level: '2 năm kinh nghiệm',
    },
    {
        id: 2,
        fileName: 'CV_NodeJS_Backend_NguyenVanA.pdf',
        fileUrl: '#',
        updatedAt: '2026-04-08',
        role: 'Backend Developer',
        location: 'Đà Nẵng',
        level: '3 năm kinh nghiệm',
    },
    {
        id: 3,
        fileName: 'CV_Fullstack_JavaScript_NguyenVanA.pdf',
        fileUrl: '#',
        updatedAt: '2026-04-06',
        role: 'Fullstack Developer',
        location: 'Hà Nội',
        level: '4 năm kinh nghiệm',
    },
    {
        id: 4,
        fileName: 'CV_Intern_Frontend_NguyenVanA.pdf',
        fileUrl: '#',
        updatedAt: '2026-04-03',
        role: 'Frontend Intern',
        location: 'Hồ Chí Minh',
        level: 'Sinh viên năm cuối',
    },
    {
        id: 5,
        fileName: 'CV_Designer_Product_NguyenVanA.pdf',
        fileUrl: '#',
        updatedAt: '2026-03-28',
        role: 'Product Designer',
        location: 'Cần Thơ',
        level: '2 năm kinh nghiệm',
    },
    {
        id: 6,
        fileName: 'CV_Tester_QA_NguyenVanA.pdf',
        fileUrl: '#',
        updatedAt: '2026-03-20',
        role: 'QA Tester',
        location: 'Hồ Chí Minh',
        level: '1.5 năm kinh nghiệm',
    },
];

function AiAnalysis() {
    const [savedCVs, setSavedCVs] = useState([]);
    const [loadingSavedCVs, setLoadingSavedCVs] = useState(false);
    const [showSavedCVSection, setShowSavedCVSection] = useState(false);

    const [selectedCV, setSelectedCV] = useState(null);

    const [jobDescriptionInputMode, setJobDescriptionInputMode] =
        useState('TEXT');
    const [jobDescriptionText, setJobDescriptionText] = useState('');
    const [jobDescriptionFile, setJobDescriptionFile] = useState(null);

    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        loadMockCVCollection();
    }, []);

    const loadMockCVCollection = async () => {
        try {
            setLoadingSavedCVs(true);

            await new Promise((resolve) => {
                setTimeout(resolve, 400);
            });

            setSavedCVs(MOCK_SAVED_CVS);
        } catch (error) {
            console.error('Load mock CV collection error:', error);
            toast.error('Không thể tải danh sách CV');
        } finally {
            setLoadingSavedCVs(false);
        }
    };

    const handleToggleSavedCVSection = () => {
        setShowSavedCVSection((prev) => !prev);
    };

    const handleSelectSavedCV = (cv) => {
        const cvId = cv?.id ?? cv?.cvId ?? cv?._id ?? null;
        const cvName =
            cv?.fileName ||
            cv?.title ||
            cv?.name ||
            cv?.originalFileName ||
            'CV chưa đặt tên';

        const cvUrl = cv?.fileUrl || cv?.cvUrl || cv?.url || '';

        setSelectedCV({
            id: cvId,
            name: cvName,
            fileUrl: cvUrl,
            source: 'saved',
        });

        toast.success('Đã chọn CV từ bộ sưu tập');
    };

    const handleUploadLocalCV = (file) => {
        if (!file) return;

        setSelectedCV({
            id: null,
            name: file.name,
            file,
            source: 'local',
        });

        setShowSavedCVSection(false);
        toast.success('Đã chọn CV từ máy tính');
    };

    const handlePreviewMockCV = (cv, e) => {
        e.stopPropagation();
        toast.info(`Mock preview: ${cv.fileName}`);
    };

    const handleDownloadMockCV = (cv, e) => {
        e.stopPropagation();
        toast.info(`Mock download: ${cv.fileName}`);
    };

    const handleChangeJobDescriptionInputMode = (mode) => {
        setJobDescriptionInputMode(mode);

        if (mode === 'TEXT') {
            setJobDescriptionFile(null);
        }

        if (mode === 'FILE') {
            setJobDescriptionText('');
        }
    };

    const handleJobDescriptionTextChange = (value) => {
        setJobDescriptionText(value);
    };

    const handleUploadJobDescriptionFile = (file) => {
        if (!file) return;

        const errorMessage = validateJobDescriptionFile(file);

        if (errorMessage) {
            toast.warning(errorMessage);
            return;
        }

        setJobDescriptionFile({
            name: file.name,
            size: file.size,
            file,
        });

        toast.success('Đã tải file mô tả công việc');
    };

    const handleRemoveJobDescriptionFile = () => {
        setJobDescriptionFile(null);
    };

    const fetchAnalyzeAPI = async () => {
        const formData = buildAnalyzeCVFormData({
            selectedCV,
            jobDescriptionInputMode,
            jobDescriptionText,
            jobDescriptionFile,
        });

        console.log('Analyze payload:', Array.from(formData.entries()));

        await new Promise((resolve) => {
            setTimeout(resolve, 700);
        });

        return true;
    };

    const handleAnalyze = async () => {
        if (analyzing) return;

        const errorMessage = validateAIAnalysisForm({
            selectedCV,
            jobDescriptionInputMode,
            jobDescriptionText,
            jobDescriptionFile,
        });

        if (errorMessage) {
            toast.warning(errorMessage);
            return;
        }

        try {
            setAnalyzing(true);

            const resultFetchAPI = fetchAnalyzeAPI();

            await toast.promise(resultFetchAPI, {
                pending: 'Đang phân tích CV...',
                success: 'Phân tích CV thành công',
                error: {
                    render({ data }) {
                        return (
                            data?.message ||
                            'Có lỗi xảy ra, vui lòng thử lại sau'
                        );
                    },
                },
            });

            // TODO:
            // navigate('/ai-analysis/result', { state: { ... } });
        } catch (error) {
            console.error('Analyze CV error:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('pageShell')}>
                <div className={cx('container')}>
                    <aside className={cx('sidebar')}>
                        <CVUploadCard
                            selectedCV={selectedCV}
                            loadingSavedCVs={loadingSavedCVs}
                            showSavedCVSection={showSavedCVSection}
                            onToggleSavedCVSection={handleToggleSavedCVSection}
                            onUploadLocalCV={handleUploadLocalCV}
                        />

                        <div className={cx('tipCard')}>
                            <span className={cx('tipBadge')}>
                                <FiStar />
                                <span>Mẹo từ chuyên gia</span>
                            </span>

                            <h2 className={cx('tipTitle')}>
                                Tối ưu chất lượng CV trước khi phân tích
                            </h2>

                            <p className={cx('tipDescription')}>
                                Đảm bảo CV của bạn ở định dạng PDF và văn bản có
                                thể quét được để AI đọc chính xác hơn. Nội dung rõ
                                ràng, có số liệu định lượng và mô tả vai trò cụ
                                thể sẽ giúp tăng chất lượng đánh giá.
                            </p>
                        </div>
                    </aside>

                    <section className={cx('workspace')}>
                        <JobDescriptionCard
                            jobDescriptionInputMode={jobDescriptionInputMode}
                            jobDescriptionText={jobDescriptionText}
                            selectedJobDescriptionFile={jobDescriptionFile}
                            onChangeJobDescriptionInputMode={
                                handleChangeJobDescriptionInputMode
                            }
                            onJobDescriptionTextChange={
                                handleJobDescriptionTextChange
                            }
                            onUploadJobDescriptionFile={
                                handleUploadJobDescriptionFile
                            }
                            onRemoveJobDescriptionFile={
                                handleRemoveJobDescriptionFile
                            }
                            onAnalyze={handleAnalyze}
                            analyzing={analyzing}
                        />
                    </section>
                </div>

                {showSavedCVSection ? (
                    <SavedCVList
                        savedCVs={savedCVs}
                        loadingSavedCVs={loadingSavedCVs}
                        selectedCV={selectedCV}
                        onSelectSavedCV={handleSelectSavedCV}
                        onPreviewCV={handlePreviewMockCV}
                        onDownloadCV={handleDownloadMockCV}
                    />
                ) : null}
            </div>
        </div>
    );
}

export default AiAnalysis;