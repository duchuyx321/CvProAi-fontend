import classNames from 'classnames/bind';
import { FileText } from 'lucide-react';

import Button from '~/components/Button';
import styles from './AnalysisHistoryRow.module.scss';

const cx = classNames.bind(styles);

const STATUS_META = {
    SUCCESS: {
        label: 'Thành công',
        className: 'completed',
    },
    COMPLETED: {
        label: 'Hoàn thành',
        className: 'completed',
    },
    PENDING: {
        label: 'Đang chờ',
        className: 'pending',
    },
    PROCESSING: {
        label: 'Đang xử lý',
        className: 'processing',
    },
    FAILED: {
        label: 'Thất bại',
        className: 'failed',
    },
};

function formatDate(value) {
    if (!value) return '--';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '--';

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

function formatTime(value) {
    if (!value) return '--';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '--';

    return new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

function getScoreValue(item) {
    const rawScore = item?.ai_result?.overall_score;

    const score = Number(rawScore);

    if (Number.isNaN(score)) return 0;

    return score;
}

function getScoreClassName(score) {
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';

    return 'low';
}

function formatScore(score) {
    if (!score) return '0';

    return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

function AnalysisHistoryRow({ item, onViewDetail }) {
    const statusMeta = STATUS_META[item?.status] || {
        label: item?.status || '--',
        className: 'default',
    };

    const score = getScoreValue(item);
    const scoreClassName = getScoreClassName(score);
    const isSuccess = item?.status === 'SUCCESS' || item?.status === 'COMPLETED';

    return (
        <tr className={cx('row')}>
            <td>
                <div className={cx('cvInfo')}>
                    <div className={cx('fileIcon')}>
                        <FileText />
                    </div>

                    <div className={cx('cvMeta')}>
                        <strong>{item?.cv_name || '--'}</strong>
                        <span>Vị trí: {item?.job_title || '--'}</span>
                    </div>
                </div>
            </td>

            <td>
                <div className={cx('dateInfo')}>
                    <strong>{formatDate(item?.createdAt)}</strong>
                    <span>{formatTime(item?.createdAt)}</span>
                </div>
            </td>

            <td>
                <div className={cx('scoreInfo', scoreClassName)}>
                    <strong>{isSuccess ? `${formatScore(score)}%` : '--'}</strong>

                    <div className={cx('scoreTrack')}>
                        <span
                            className={cx('scoreBar')}
                            style={{
                                width: `${isSuccess ? score : 0}%`,
                            }}
                        />
                    </div>
                </div>
            </td>

            <td>
                <span className={cx('statusBadge', statusMeta.className)}>
                    {statusMeta.label}
                </span>
            </td>

            <td>
                <Button
                    type="button"
                    className={cx('detailButton')}
                    onClick={() => onViewDetail?.(item)}
                    disabled={!item?.id}
                >
                    Xem chi tiết
                </Button>
            </td>
        </tr>
    );
}

export default AnalysisHistoryRow;