// src/pages/Admin/ManageTemplates/components/TemplateStatsCards/TemplateStatsCards.jsx

import classNames from 'classnames/bind';
import { FiCheckCircle, FiPauseCircle, FiTrendingUp } from 'react-icons/fi';

import { formatNumber } from '../../utils';

import styles from './TemplateStatsCards.module.scss';

const cx = classNames.bind(styles);

function TemplateStatsCards({ stats }) {
    const data = stats || {
        totalUsage: 0,
        activeCount: 0,
        inactiveCount: 0,
        activePercent: 0,
    };

    return (
        <div className={cx('grid')}>
            <div className={cx('card', 'usage')}>
                <div className={cx('icon')}>
                    <FiTrendingUp />
                </div>

                <div className={cx('body')}>
                    <h3>Tổng lượt sử dụng</h3>
                    <strong>{formatNumber(data.totalUsage)}</strong>
                    <p>Theo dữ liệu mẫu CV hiện có</p>
                </div>
            </div>

            <div className={cx('card', 'active')}>
                <div className={cx('icon')}>
                    <FiCheckCircle />
                </div>

                <div className={cx('body')}>
                    <h3>Mẫu đang hoạt động</h3>
                    <strong>{formatNumber(data.activeCount)}</strong>
                    <p>{data.activePercent}% tổng số mẫu</p>
                </div>
            </div>

            <div className={cx('card', 'inactive')}>
                <div className={cx('icon')}>
                    <FiPauseCircle />
                </div>

                <div className={cx('body')}>
                    <h3>Mẫu tạm ngưng</h3>
                    <strong>{formatNumber(data.inactiveCount)}</strong>
                    <p>Cần rà soát trước khi mở lại</p>
                </div>
            </div>
        </div>
    );
}

export default TemplateStatsCards;
