import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { FiStar } from 'react-icons/fi';
import { toast } from 'react-toastify';

import CVUploadCard from './components/CVUploadCard';
import JobDescriptionCard from './components/JobDescriptionCard';
import SavedCVList from './components/CVList';
import {
    analyzeCV,
    buildAnalyzeCVFormData,
} from '~/services/aiAnalysis.service';
import { validateJobDescriptionFile } from '~/utils/jobDescriptionFile.validator';
import styles from './AiAnalysis.module.scss';
import { useNavigate } from 'react-router-dom';
import { config } from '~/config';

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
];

function AiAnalysis() {
    const [savedCVs, setSavedCVs] = useState([]);
    const [loadingSavedCVs, setLoadingSavedCVs] = useState(false);
    const [showSavedCVSection, setShowSavedCVSection] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const navigate = useNavigate();
    // Chỉ còn 2 state chính
    const [cvInput, setCvInput] = useState({
        type: null, // 'ID' | 'FILE'
        cv_id: null,
        cv_file: null,
        name: '',
        fileUrl: '',
    });

    const [jdInput, setJdInput] = useState({
        type: 'TEXT', // 'TEXT' | 'FILE'
        jd_text: '',
        jd_file: null,
    });

    useEffect(() => {
        loadMockCVCollection();
    }, []);

    const loadMockCVCollection = async () => {
        try {
            setLoadingSavedCVs(true);
            await new Promise((resolve) => setTimeout(resolve, 400));
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

        setCvInput({
            type: 'ID',
            cv_id: cvId,
            cv_file: null,
            name: cvName,
            fileUrl: cvUrl,
        });

        toast.success('Đã chọn CV từ bộ sưu tập');
    };

    const handleUploadLocalCV = (file) => {
        if (!file) return;

        setCvInput({
            type: 'FILE',
            cv_id: null,
            cv_file: file,
            name: file.name,
            fileUrl: '',
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
        if (mode === 'TEXT') {
            setJdInput((prev) => ({
                ...prev,
                type: 'TEXT',
                jd_file: null,
            }));
            return;
        }

        setJdInput((prev) => ({
            ...prev,
            type: 'FILE',
            jd_text: '',
        }));
    };

    const handleJobDescriptionTextChange = (value) => {
        setJdInput((prev) => ({
            ...prev,
            jd_text: value,
        }));
    };

    const handleUploadJobDescriptionFile = (file) => {
        if (!file) return;

        const errorMessage = validateJobDescriptionFile(file);

        if (errorMessage) {
            toast.warning(errorMessage);
            return;
        }

        setJdInput((prev) => ({
            ...prev,
            jd_file: file,
        }));

        toast.success('Đã tải file mô tả công việc');
    };

    const handleRemoveJobDescriptionFile = () => {
        setJdInput((prev) => ({
            ...prev,
            jd_file: null,
        }));
    };

    const validateAnalyzeInput = () => {
        if (cvInput.type === 'ID' && !cvInput.cv_id) {
            return 'Vui lòng chọn CV trong hệ thống';
        }

        if (cvInput.type === 'FILE' && !cvInput.cv_file) {
            return 'Vui lòng tải CV từ máy tính';
        }

        if (!cvInput.type) {
            return 'Vui lòng chọn CV để phân tích';
        }

        if (jdInput.type === 'TEXT' && !jdInput.jd_text.trim()) {
            return 'Vui lòng nhập mô tả công việc';
        }

        if (jdInput.type === 'FILE' && !jdInput.jd_file) {
            return 'Vui lòng tải file mô tả công việc';
        }

        return '';
    };

    const fetchAnalyzeAPI = async () => {
        const formData = buildAnalyzeCVFormData({ cvInput, jdInput });
        const result = await analyzeCV(formData);
        if (!result?.success) {
            throw new Error(result?.message || 'Phân tích CV thất bại');
        }
        return result;
    };

    const handleAnalyze = async () => {
        if (analyzing) return;

        const errorMessage = validateAnalyzeInput();

        if (errorMessage) {
            toast.warning(errorMessage);
            return;
        }

        try {
            setAnalyzing(true);

            const resultFetchAPI = fetchAnalyzeAPI();

            const result = await toast.promise(resultFetchAPI, {
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
            console.log(result);
            // navigate sang result ở đây
            setTimeout(() => {
                navigate(
                    `${config.router.aiAnalysisResult_route}${result.data.detailAnalyze || result.data.dataValues.detailAnalyze}`,
                ); //dashboard
            }, 800);
        } catch (error) {
            console.error('Analyze CV error:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    const selectedCV =
        cvInput.type === 'ID'
            ? {
                  id: cvInput.cv_id,
                  name: cvInput.name,
                  fileUrl: cvInput.fileUrl,
                  source: 'saved',
              }
            : cvInput.type === 'FILE'
              ? {
                    id: null,
                    name: cvInput.name,
                    file: cvInput.cv_file,
                    source: 'local',
                }
              : null;

    const selectedJobDescriptionFile = jdInput.jd_file
        ? {
              name: jdInput.jd_file.name,
              size: jdInput.jd_file.size,
              file: jdInput.jd_file,
          }
        : null;

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
                                thể quét được để AI đọc chính xác hơn.
                            </p>
                        </div>
                    </aside>

                    <section className={cx('workspace')}>
                        <JobDescriptionCard
                            jobDescriptionInputMode={jdInput.type}
                            jobDescriptionText={jdInput.jd_text}
                            selectedJobDescriptionFile={
                                selectedJobDescriptionFile
                            }
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
