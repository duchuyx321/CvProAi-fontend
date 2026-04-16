import classNames from 'classnames/bind';
import { FiFileText } from 'react-icons/fi';
import styles from './AnalysisHistoryRow.module.scss';

const cx = classNames.bind(styles);

function ScoreBar({ value, status, analysisStatus }) {
    if (
        status !== analysisStatus.SUCCESS ||
        value === null ||
        value === undefined
    ) {
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
    return (
        <div className={cx('tableRow')}>
            <div className={cx('cell', 'fileCell')}>
                <FiFileText className={cx('fileIcon')} />
                <div className={cx('fileInfo')}>
                    <span className={cx('fileName')}>{item.fileName || '—'}</span>
                    {item.isBest && <span className={cx('bestBadge')}>BEST SCORE</span>}
                </div>
            </div>

            <div className={cx('cell', 'roleCell')}>{item.role || '—'}</div>

            <div className={cx('cell', 'dateCell')}>{item.analyzedAt || '—'}</div>

            <div className={cx('cell', 'scoreCell')}>
                <ScoreBar
                    value={item.score}
                    status={item.status}
                    analysisStatus={analysisStatus}
                />
            </div>

            <div className={cx('cell', 'keywordCell')}>
                <div className={cx('keywordList')}>
                    {item.keywords?.length ? (
                        item.keywords.map((keyword, index) => (
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
                    status={item.status}
                    analysisStatus={analysisStatus}
                />
            </div>
        </div>
    );
}

export default AnalysisHistoryRow;