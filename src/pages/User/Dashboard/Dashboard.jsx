import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import {
    FiArrowRight,
    FiAward,
    FiDownload,
    FiFileText,
    FiRefreshCcw,
} from 'react-icons/fi';
import { LuBrainCircuit } from 'react-icons/lu';
import { GrGenai } from 'react-icons/gr';

import Modal from '~/components/Modal';
import { config } from '~/config';
import { getDashboardOverview } from '~/services/dashboard.service';
import styles from './Dashboard.module.scss';

const cx = classNames.bind(styles);
const PREVIEW_CV_LIMIT = 5;
const DEFAULT_DASHBOARD_STATS = {
    totalCv: 0,
    aiUsed: 0,
    aiLimit: 0,
    currentPlan: '--',
    totalPdfExports: 0,
};

function Dashboard() {
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isAllCvModalOpen, setIsAllCvModalOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState({
        stats: DEFAULT_DASHBOARD_STATS,
        recentCvs: [],
    });

    const loadDashboardData = useCallback(async ({ silent = false } = {}) => {
        if (silent) {
            setIsRefreshing(true);
        } else {
            setIsLoading(true);
        }

        try {
            const result = await getDashboardOverview();

            if (!result?.success) {
                setErrorMessage(
                    result?.message ||
                        'Không thể tải dữ liệu dashboard. Vui lòng thử lại.',
                );
            } else {
                setErrorMessage('');
            }

            setDashboardData({
                stats:
                    result?.data?.stats ||
                    DEFAULT_DASHBOARD_STATS,
                recentCvs: result?.data?.recentCvs || [],
            });
        } catch (error) {
            setErrorMessage(
                error?.message ||
                    'Không thể tải dữ liệu dashboard. Vui lòng thử lại.',
            );
            setDashboardData({
                stats: DEFAULT_DASHBOARD_STATS,
                recentCvs: [],
            });
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    const { stats, recentCvs } = dashboardData;

    const aiUsageText =
        Number(stats?.aiLimit) > 0
            ? `${stats.aiUsed}/${stats.aiLimit}`
            : `${stats.aiUsed}`;

    const previewRecentCvs = useMemo(
        () => recentCvs.slice(0, PREVIEW_CV_LIMIT),
        [recentCvs],
    );

    const resolveCvEditPath = (cv = {}) => {
        const identifier = cv?.slug || cv?.id;

        if (!identifier) {
            return '';
        }

        return config.router.editCv.replace(':slug', String(identifier));
    };

    const handleOpenCvEditor = (cv = {}) => {
        const path = resolveCvEditPath(cv);
        if (!path) return;

        setIsAllCvModalOpen(false);
        navigate(path);
    };

    const renderCvRows = (items = []) => {
        if (!items.length) {
            return (
                <tr>
                    <td colSpan={4} className={cx('empty-state')}>
                        Chưa có CV nào gần đây.
                    </td>
                </tr>
            );
        }

        return items.map((cv, index) => {
            const rowKey = cv?.id || cv?.slug || `${cv?.name || 'cv'}-${index}`;
            const canOpen = Boolean(resolveCvEditPath(cv));

            return (
                <tr
                    key={rowKey}
                    className={cx({ 'clickable-row': canOpen })}
                    onClick={() => {
                        if (canOpen) {
                            handleOpenCvEditor(cv);
                        }
                    }}
                >
                    <td>
                        <div className={cx('cv-name-cell')}>
                            <FiFileText className={cx('file-icon')} />
                            <span className={cx('cv-name')}>{cv.name}</span>
                        </div>
                    </td>
                    <td className={cx('text-muted')}>{cv.template}</td>
                    <td className={cx('text-muted')}>{cv.updated}</td>
                    <td>
                        <span className={cx('status-badge', cv.statusCode)}>
                            {cv.status}
                        </span>
                    </td>
                </tr>
            );
        });
    };

    if (isLoading) {
        return (
            <div className={cx('loading-state')}>
                Đang tải dữ liệu tổng quan...
            </div>
        );
    }

    return (
        <>
            <div className={cx('dashboard-wrapper')}>
                <div className={cx('page-header')}>
                    <div>
                        <h1 className={cx('title')}>Trang tổng quan</h1>
                        <p className={cx('subtitle')}>
                            Theo dõi tiến độ tạo CV và gói tài khoản của bạn.
                        </p>
                    </div>

                    <button
                        type="button"
                        className={cx('btn-refresh')}
                        onClick={() => loadDashboardData({ silent: true })}
                        disabled={isRefreshing}
                    >
                        <FiRefreshCcw
                            className={cx('refresh-icon', {
                                spinning: isRefreshing,
                            })}
                        />
                        Làm mới
                    </button>
                </div>

                {errorMessage ? (
                    <div className={cx('error-banner')}>{errorMessage}</div>
                ) : null}

                <div className={cx('stats-grid')}>
                    <div className={cx('stat-card')}>
                        <div className={cx('stat-header')}>
                            <div className={cx('icon-wrapper', 'blue')}>
                                <FiFileText />
                            </div>
                            <span className={cx('tag', 'gray')}>Tổng cộng</span>
                        </div>
                        <p className={cx('stat-label')}>Số CV đã tạo</p>
                        <h3 className={cx('stat-value')}>{stats.totalCv}</h3>
                    </div>

                    <div className={cx('stat-card')}>
                        <div className={cx('stat-header')}>
                            <div className={cx('icon-wrapper', 'purple')}>
                                <GrGenai />
                            </div>
                            <span className={cx('tag', 'gray')}>Hạn mức</span>
                        </div>
                        <p className={cx('stat-label')}>Phân tích AI đã dùng</p>
                        <h3 className={cx('stat-value')}>{aiUsageText}</h3>
                    </div>

                    <div className={cx('stat-card')}>
                        <div className={cx('stat-header')}>
                            <div className={cx('icon-wrapper', 'yellow')}>
                                <FiAward />
                            </div>
                            <span className={cx('tag', 'yellow')}>
                                Đang hoạt động
                            </span>
                        </div>
                        <p className={cx('stat-label')}>Gói tài khoản</p>
                        <h3 className={cx('stat-value')}>{stats.currentPlan}</h3>
                    </div>

                    <div className={cx('stat-card')}>
                        <div className={cx('stat-header')}>
                            <div className={cx('icon-wrapper', 'green')}>
                                <FiDownload />
                            </div>
                            <span className={cx('tag', 'gray')}>Tổng cộng</span>
                        </div>
                        <p className={cx('stat-label')}>Số lần xuất PDF</p>
                        <h3 className={cx('stat-value')}>
                            {stats.totalPdfExports}
                        </h3>
                    </div>
                </div>

                <div className={cx('content-stack')}>
                    <div className={cx('box-card', 'cv-table-box')}>
                        <div className={cx('box-header')}>
                            <h2>CV gần đây</h2>

                            <div className={cx('header-actions')}>
                                <span className={cx('cv-count')}>
                                    {recentCvs.length} CV
                                </span>
                                <button
                                    type="button"
                                    className={cx('btn-link')}
                                    onClick={() => setIsAllCvModalOpen(true)}
                                    disabled={!recentCvs.length}
                                >
                                    Xem tất cả
                                </button>
                            </div>
                        </div>

                        <div className={cx('table-responsive')}>
                            <table className={cx('cv-table')}>
                                <thead>
                                    <tr>
                                        <th>TÊN CV</th>
                                        <th>MẪU THIẾT KẾ</th>
                                        <th>CẬP NHẬT</th>
                                        <th>TRẠNG THÁI</th>
                                    </tr>
                                </thead>
                                <tbody>{renderCvRows(previewRecentCvs)}</tbody>
                            </table>
                        </div>
                    </div>

                    <div className={cx('ai-banner')}>
                        <div className={cx('ai-banner-content')}>
                            <h2>Tối ưu CV của bạn với AI</h2>
                            <p>
                                Sử dụng công cụ phân tích từ khóa để tăng khả
                                năng vượt qua vòng lọc ATS.
                            </p>
                            <button className={cx('btn-ai-action')}>
                                Thử ngay bây giờ{' '}
                                <FiArrowRight className={cx('arrow')} />
                            </button>
                        </div>
                        <LuBrainCircuit className={cx('bg-icon')} />
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isAllCvModalOpen}
                onClose={() => setIsAllCvModalOpen(false)}
                title="Tất cả CV gần đây"
                description={`Đang hiển thị ${recentCvs.length} CV mới nhất của bạn.`}
                size="xl"
            >
                <div className={cx('modal-table-wrap')}>
                    <table className={cx('cv-table')}>
                        <thead>
                            <tr>
                                <th>TÊN CV</th>
                                <th>MẪU THIẾT KẾ</th>
                                <th>CẬP NHẬT</th>
                                <th>TRẠNG THÁI</th>
                            </tr>
                        </thead>
                        <tbody>{renderCvRows(recentCvs)}</tbody>
                    </table>
                </div>
            </Modal>
        </>
    );
}

export default Dashboard;
