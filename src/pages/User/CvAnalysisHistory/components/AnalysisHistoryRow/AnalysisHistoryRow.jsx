import classNames from 'classnames/bind';
import { FileText } from 'lucide-react';

import Button from '~/components/Button';
import styles from './AnalysisHistoryRow.module.scss';

const cx = classNames.bind(styles);

const STATUS_META = {
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

function getScoreClassName(score) {
    if (score >= 80) return 'high';
    if (score >= 50) return 'medium';

    return 'low';
}

function AnalysisHistoryRow({ item, onViewDetail }) {
    const statusMeta = STATUS_META[item.status] || {
        label: item.status || '--',
        className: 'default',
    };

    const scoreClassName = getScoreClassName(Number(item.score));

    return (
        <tr className={cx('row')}>
            <td>
                <div className={cx('cvInfo')}>
                    <div className={cx('fileIcon')}>
                        <FileText />
                    </div>

                    <div className={cx('cvMeta')}>
                        <strong>{item.file_name || '--'}</strong>
                        <span>Vị trí: {item.position || '--'}</span>
                    </div>
                </div>
            </td>

            <td>
                <div className={cx('dateInfo')}>
                    <strong>{formatDate(item.createdAt)}</strong>
                    <span>{formatTime(item.createdAt)}</span>
                </div>
            </td>

            <td>
                <div className={cx('scoreInfo', scoreClassName)}>
                    <strong>{Number(item.score) || 0}%</strong>

                    <div className={cx('scoreTrack')}>
                        <span
                            className={cx('scoreBar')}
                            style={{
                                width: `${Number(item.score) || 0}%`,
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
                >
                    Xem chi tiết
                </Button>
            </td>
        </tr>
    );
}

export default AnalysisHistoryRow;