import classNames from 'classnames/bind';

import JobDescriptionCard from '../JobDescriptionCard';
import styles from './CVAnalysisRight.module.scss';

const cx = classNames.bind(styles);

function CVAnalysisRight({
    jobDescriptionInputMode,
    jobDescriptionText,
    selectedJobDescriptionFile,
    onChangeJobDescriptionInputMode,
    onJobDescriptionTextChange,
    onUploadJobDescriptionFile,
    onRemoveJobDescriptionFile,
    onAnalyze,
    analyzing,
    analysisResult,
    hasAnalyzed,
}) {
    return (
        <div className={cx('wrapper')}>
            <JobDescriptionCard
                jobDescriptionInputMode={jobDescriptionInputMode}
                jobDescriptionText={jobDescriptionText}
                selectedJobDescriptionFile={selectedJobDescriptionFile}
                onChangeJobDescriptionInputMode={onChangeJobDescriptionInputMode}
                onJobDescriptionTextChange={onJobDescriptionTextChange}
                onUploadJobDescriptionFile={onUploadJobDescriptionFile}
                onRemoveJobDescriptionFile={onRemoveJobDescriptionFile}
                onAnalyze={onAnalyze}
                analyzing={analyzing}
            />

            {hasAnalyzed && analysisResult ? (
                <div>Render kết quả phân tích ở đây</div>
            ) : null}
        </div>
    );
}

export default CVAnalysisRight;