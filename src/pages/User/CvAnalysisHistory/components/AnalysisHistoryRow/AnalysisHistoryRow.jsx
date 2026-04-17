import classNames from 'classnames/bind';
import { FiFileText } from 'react-icons/fi';
import styles from './AnalysisHistoryRow.module.scss';

const cx = classNames.bind(styles);

function ScoreBar({ value, status, analysisStatus }) {
    const isValidScore = typeof value === 'number';

    if (status !== analysisStatus.SUCCESS || !isValidScore) {
        return <span className={cx('scorePending')}>—</span>;
    }

    const normalizedValue = Math.max(0, Math.min(100, value));

    return (
        <div className={cx('scoreBox')}>
            <span className={cx('scoreText')}>{normalizedValue}%</span>
            <div className={cx('scoreTrack')}>
                <div
                    className={cx('scoreFill', {
                        high: normalizedValue >= 70,
                        medium: normalizedValue >= 50 && normalizedValue < 70,
                        low: normalizedValue < 50,
                    })}
                    style={{ width: `${normalizedValue}%` }}
                />
            </div>
        </div>
    );
}

function AnalysisStatusBadge({ status, analysisStatus }) {
    const statusMap = {
        [analysisStatus.QUEUED]: {
            label: 'Đang chờ',
            className: 'queued',
        },
        [analysisStatus.RUNNING]: {
            label: 'Đang phân tích',
            className: 'running',
        },
        [analysisStatus.SUCCESS]: {
            label: 'Hoàn tất',
            className: 'success',
        },
        [analysisStatus.FAILED]: {
            label: 'Thất bại',
            className: 'failed',
        },
    };

    const currentStatus = statusMap[status] || {
        label: status || 'Không xác định',
        className: 'queued',
    };

    return (
        <div className={cx('statusBadge', currentStatus.className)}>
            <span className={cx('statusDot')} />
            <span className={cx('statusText')}>{currentStatus.label}</span>
        </div>
    );
}

function AnalysisHistoryRow({ item = {}, analysisStatus }) {
    const {
        fileName = '—',
        isBest = false,
        role = '—',
        analyzedAt = '—',
        score = null,
        keywords = [],
        status,
    } = item;

    const safeKeywords = Array.isArray(keywords) ? keywords : [];

    return (
        <div className={cx('tableRow')}>
            <div className={cx('cell', 'fileCell')}>
                <FiFileText className={cx('fileIcon')} />
                <div className={cx('fileInfo')}>
                    <span className={cx('fileName')}>{fileName}</span>
                    {isBest && <span className={cx('bestBadge')}>BEST SCORE</span>}
                </div>
            </div>

            <div className={cx('cell', 'roleCell')}>{role}</div>

            <div className={cx('cell', 'dateCell')}>{analyzedAt}</div>

            <div className={cx('cell', 'scoreCell')}>
                <ScoreBar
                    value={score}
                    status={status}
                    analysisStatus={analysisStatus}
                />
            </div>

            <div className={cx('cell', 'keywordCell')}>
                <div className={cx('keywordList')}>
                    {safeKeywords.length > 0 ? (
                        safeKeywords.map((keyword, index) => (
                            <span
                                key={`${keyword}-${index}`}
                                className={cx('keywordTag')}
                            >
                                {keyword}
                            </span>
                        ))
                    ) : (
                        <span className={cx('emptyKeywords')}>—</span>
                    )}
                </div>
            </div>

            <div className={cx('cell', 'statusCell')}>
                <AnalysisStatusBadge
                    status={status}
                    analysisStatus={analysisStatus}
                />
            </div>
        </div>
    );
}

export default AnalysisHistoryRow;