import { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';

import CVAnalysisLeft from './components/CVAnalysisLeft';
import CVAnalysisRight from './components/CVAnalysisRight';
import { buildAnalyzeCVFormData } from '~/services/aiAnalysis.service';
import { getMyCVCollection } from '~/services/cv.service';
import { validateAIAnalysisForm } from '~/utils/aiAnalysis.validator';
import { validateJobDescriptionFile } from '~/utils/jobDescriptionFile.validator';
import styles from './AiAnalysis.module.scss';

const cx = classNames.bind(styles);

const DEFAULT_ANALYSIS_RESULT = {
    score: 85,
    levelLabel: 'Rất tiềm năng',
    statusLabel: 'Hoàn tất',
    missingSkills: [
        'React Native',
        'CI/CD Pipeline',
        'AWS Lambda',
        'Microservices Architecture',
    ],
    suggestions: [
        'Bạn nên nhấn mạnh hơn vào các dự án sử dụng <strong>TypeScript</strong> vì nhà tuyển dụng yêu cầu rất cao về kỹ năng này.',
        'Phần "Kinh nghiệm làm việc" hiện tại đang thiếu các con số định lượng. Hãy thử thêm các chỉ số như <strong>"Tăng hiệu suất 20%"</strong> hoặc <strong>"Tiết kiệm 10 giờ/tuần"</strong>.',
        'Cân nhắc bổ sung thêm chứng chỉ <strong>AWS Certified Developer</strong> nếu bạn đã có đủ bề dày cho phần thiếu hụt về hạ tầng cloud.',
    ],
};

function AiAnalysis() {
    const [savedCVs, setSavedCVs] = useState([]);
    const [loadingSavedCVs, setLoadingSavedCVs] = useState(false);

    const [selectedCV, setSelectedCV] = useState(null);

    const [jobDescriptionInputMode, setJobDescriptionInputMode] =
        useState('TEXT');
    const [jobDescriptionText, setJobDescriptionText] = useState('');
    const [jobDescriptionFile, setJobDescriptionFile] = useState(null);

    const [analyzing, setAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [hasAnalyzed, setHasAnalyzed] = useState(false);

    useEffect(() => {
        loadMyCVCollection();
    }, []);

    const resetAnalysisResult = () => {
        setAnalysisResult(null);
        setHasAnalyzed(false);
    };

    const normalizeAnalysisResult = (result) => {
        if (!result) {
            return DEFAULT_ANALYSIS_RESULT;
        }

        const normalizedScore = Number(result?.score ?? result?.matchingScore);

        return {
            score: Number.isNaN(normalizedScore)
                ? DEFAULT_ANALYSIS_RESULT.score
                : normalizedScore,
            levelLabel:
                result?.levelLabel ||
                result?.level ||
                result?.assessment ||
                DEFAULT_ANALYSIS_RESULT.levelLabel,
            statusLabel:
                result?.statusLabel ||
                result?.status ||
                DEFAULT_ANALYSIS_RESULT.statusLabel,
            missingSkills: Array.isArray(result?.missingSkills)
                ? result.missingSkills
                : Array.isArray(result?.missing_skills)
                  ? result.missing_skills
                  : DEFAULT_ANALYSIS_RESULT.missingSkills,
            suggestions: Array.isArray(result?.suggestions)
                ? result.suggestions
                : Array.isArray(result?.aiSuggestions)
                  ? result.aiSuggestions
                  : Array.isArray(result?.recommendations)
                    ? result.recommendations
                    : DEFAULT_ANALYSIS_RESULT.suggestions,
        };
    };

    const loadMyCVCollection = async () => {
        try {
            setLoadingSavedCVs(true);

            const result = await getMyCVCollection();

            if (!result.success) {
                toast.error(result.message || 'Không thể tải danh sách CV');
                return;
            }

            setSavedCVs(result.data || []);
        } catch (error) {
            console.error('Load CV collection error:', error);
            toast.error('Không thể tải danh sách CV');
        } finally {
            setLoadingSavedCVs(false);
        }
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

        resetAnalysisResult();
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

        resetAnalysisResult();
        toast.success('Đã chọn CV thành công');
    };

    const handleChangeJobDescriptionInputMode = (mode) => {
        setJobDescriptionInputMode(mode);

        if (mode === 'TEXT') {
            setJobDescriptionFile(null);
        }

        if (mode === 'FILE') {
            setJobDescriptionText('');
        }

        if (hasAnalyzed || analysisResult) {
            resetAnalysisResult();
        }
    };

    const handleJobDescriptionTextChange = (value) => {
        setJobDescriptionText(value);

        if (hasAnalyzed || analysisResult) {
            resetAnalysisResult();
        }
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

        if (hasAnalyzed || analysisResult) {
            resetAnalysisResult();
        }

        toast.success('Đã tải file mô tả công việc');
    };

    const handleRemoveJobDescriptionFile = () => {
        setJobDescriptionFile(null);

        if (hasAnalyzed || analysisResult) {
            resetAnalysisResult();
        }
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

        return DEFAULT_ANALYSIS_RESULT;
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

            const data = await toast.promise(resultFetchAPI, {
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

            setAnalysisResult(normalizeAnalysisResult(data));
            setHasAnalyzed(true);
        } catch (error) {
            console.error('Analyze CV error:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className={cx('wrapper')}>
            <div className={cx('container')}>
                <CVAnalysisLeft
                    selectedCV={selectedCV}
                    savedCVs={savedCVs}
                    loadingSavedCVs={loadingSavedCVs}
                    onSelectSavedCV={handleSelectSavedCV}
                    onUploadLocalCV={handleUploadLocalCV}
                />

                <CVAnalysisRight
                    jobDescriptionInputMode={jobDescriptionInputMode}
                    jobDescriptionText={jobDescriptionText}
                    selectedJobDescriptionFile={jobDescriptionFile}
                    onChangeJobDescriptionInputMode={
                        handleChangeJobDescriptionInputMode
                    }
                    onJobDescriptionTextChange={handleJobDescriptionTextChange}
                    onUploadJobDescriptionFile={handleUploadJobDescriptionFile}
                    onRemoveJobDescriptionFile={handleRemoveJobDescriptionFile}
                    onAnalyze={handleAnalyze}
                    analyzing={analyzing}
                    analysisResult={analysisResult}
                    hasAnalyzed={hasAnalyzed}
                />
            </div>
        </div>
    );
}

export default AiAnalysis;