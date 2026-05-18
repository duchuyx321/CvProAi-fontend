import {
    createElement,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import {
    FiAlertCircle,
    FiCalendar,
    FiChevronDown,
    FiCreditCard,
    FiDownload,
    FiRefreshCw,
} from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { LuDownload, LuFileText, LuUsers } from 'react-icons/lu';
import { RiMoneyDollarCircleLine } from 'react-icons/ri';
import { toast } from 'react-toastify';

import { config } from '~/config';
import {
    downloadBlob,
    EXPORT_CONFIG,
    exportAdminDashboardReport,
    getAdminDashboard,
    getFileNameFromHeaders,
} from '~/services/dashboard.service';
import styles from './AdminDashboard.module.scss';

const cx = classNames.bind(styles);

const FILTER_OPTIONS = {
    '7d': '7 ngày gần nhất',
    '30d': '30 ngày gần nhất',
    month: 'Tháng này',
    year: 'Năm nay',
    custom: 'Khoảng thời gian',
};

function formatPercent(value, digits = 1) {
    const numberValue = Number(value) || 0;
    const fixedValue = numberValue.toFixed(digits);

    return `${Number(fixedValue)}%`;
}

function formatNumber(value) {
    if (value === null || value === undefined || value === '') return '0';

    return new Intl.NumberFormat('vi-VN').format(Number(value) || 0);
}

function formatMoney(value) {
    if (value === null || value === undefined || value === '') return '0đ';

    return `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)}đ`;
}

function formatMoneyShort(value) {
    const amount = Number(value) || 0;

    if (amount >= 1000000) {
        return `${(amount / 1000000).toFixed(1).replace('.0', '')}tr`;
    }

    if (amount >= 1000) {
        return `${new Intl.NumberFormat('vi-VN').format(amount / 1000)}k`;
    }

    return `${amount}`;
}

function formatGrowthPercent(value, digits = 1) {
    if (value === null || value === undefined) return '+0%';

    const numberValue = Number(value) || 0;
    const fixedValue = Number(numberValue.toFixed(digits));

    return `${fixedValue >= 0 ? '+' : ''}${fixedValue}%`;
}

function formatRelativeTime(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Vừa xong';
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} giờ trước`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays} ngày trước`;

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
}

function StatCard({ icon, label, value, change }) {
    return (
        <div className={cx('statCard')}>
            <div className={cx('statTop')}>
                <div className={cx('statIcon')}>
                    {icon ? createElement(icon) : null}
                </div>
                <span className={cx('statChange')}>{change}</span>
            </div>

            <div className={cx('statLabel')}>{label}</div>
            <div className={cx('statValue')}>{value}</div>
        </div>
    );
}

function TrendChart({ chartData = [] }) {
    const safeChartData = Array.isArray(chartData) ? chartData : [];

    const maxValue = Math.max(
        ...safeChartData.flatMap((item) => [
            Number(item?.users) || 0,
            Number(item?.cvs) || 0,
            Number(item?.aiRuns) || 0,
        ]),
        1,
    );

    const buildPath = (key) => {
        if (safeChartData.length === 0) return '';

        const width = 600;
        const height = 220;
        const stepX =
            safeChartData.length > 1 ? width / (safeChartData.length - 1) : 0;

        return safeChartData
            .map((item, index) => {
                const x = index * stepX;
                const rawValue = Number(item?.[key]) || 0;
                const y = height - (rawValue / maxValue) * height;

                if (index === 0) return `M${x},${y}`;
                return `L${x},${y}`;
            })
            .join(' ');
    };

    return (
        <div className={cx('panel')}>
            <div className={cx('panelHeader')}>
                <h3>Tăng trưởng hoạt động hệ thống</h3>
                <button type="button" className={cx('ghostBtn')}>
                    ...
                </button>
            </div>

            <div className={cx('chartArea')}>
                <div className={cx('yAxis')}>
                    <span>{formatNumber(maxValue)}</span>
                    <span>{formatNumber(Math.round(maxValue * 0.66))}</span>
                    <span>{formatNumber(Math.round(maxValue * 0.33))}</span>
                    <span>0</span>
                </div>

                <div className={cx('chartCanvas')}>
                    <div className={cx('gridLine', 'line1')} />
                    <div className={cx('gridLine', 'line2')} />
                    <div className={cx('gridLine', 'line3')} />
                    <div className={cx('gridLine', 'line4')} />

                    <svg
                        className={cx('chartSvg')}
                        viewBox="0 0 600 220"
                        preserveAspectRatio="none"
                    >
                        <path
                            d={buildPath('users')}
                            className={cx('lineBlue')}
                        />
                        <path d={buildPath('cvs')} className={cx('lineCyan')} />
                        <path
                            d={buildPath('aiRuns')}
                            className={cx('linePurple')}
                        />
                    </svg>

                    <div className={cx('xAxis')}>
                        {safeChartData.length > 0 ? (
                            safeChartData.map((item, index) => (
                                <span key={`${item?.label || 'label'}-${index}`}>
                                    {item?.label || `W${index + 1}`}
                                </span>
                            ))
                        ) : (
                            <>
                                <span>W1</span>
                                <span>W2</span>
                                <span>W3</span>
                                <span>W4</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className={cx('legend')}>
                <span className={cx('legendItem')}>
                    <i className={cx('dot', 'yellow')} />
                    Người dùng
                </span>
                <span className={cx('legendItem')}>
                    <i className={cx('dot', 'cyan')} />
                    CV
                </span>
                <span className={cx('legendItem')}>
                    <i className={cx('dot', 'purple')} />
                    AI Analysis
                </span>
            </div>
        </div>
    );
}

function RevenueDonut({ chartPieData = {} }) {
    const totalRevenue = Number(chartPieData?.totalRevenues) || 0;
    const totalPremiums = Number(chartPieData?.totalPremiums) || 0;
    const totalAddons = Number(chartPieData?.totalAddons) || 0;
    const otherRevenue = Number(chartPieData?.totalOthers) || 0;

    const radius = 52;
    const circumference = 2 * Math.PI * radius;

    const premiumPercent = totalRevenue > 0 ? totalPremiums / totalRevenue : 0;
    const addonPercent = totalRevenue > 0 ? totalAddons / totalRevenue : 0;
    const otherPercent = totalRevenue > 0 ? otherRevenue / totalRevenue : 0;

    const premiumLength = circumference * premiumPercent;
    const addonLength = circumference * addonPercent;
    const otherLength = circumference * otherPercent;

    return (
        <div className={cx('panel')}>
            <div className={cx('panelHeader')}>
                <h3>Doanh thu theo gói</h3>
            </div>

            <div className={cx('donutWrap')}>
                <div className={cx('donutChart')}>
                    <svg viewBox="0 0 140 140" className={cx('donutSvg')}>
                        <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            className={cx('donutTrack')}
                        />

                        <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            className={cx('donutPremium')}
                            strokeDasharray={`${premiumLength} ${circumference}`}
                            strokeDashoffset="0"
                        />

                        <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            className={cx('donutAddon')}
                            strokeDasharray={`${addonLength} ${circumference}`}
                            strokeDashoffset={-premiumLength}
                        />

                        <circle
                            cx="70"
                            cy="70"
                            r={radius}
                            className={cx('donutOther')}
                            strokeDasharray={`${otherLength} ${circumference}`}
                            strokeDashoffset={-(premiumLength + addonLength)}
                        />
                    </svg>

                    <div className={cx('donutCenter')}>
                        <span>TỔNG DOANH THU</span>
                        <strong>{formatMoneyShort(totalRevenue)}</strong>
                    </div>
                </div>
            </div>

            <div className={cx('revenueList')}>
                <div className={cx('revenueItem')}>
                    <span className={cx('revenueLabel')}>
                        <i className={cx('dot', 'blue')} />
                        Premium Monthly
                    </span>
                    <strong>{formatMoneyShort(totalPremiums)}</strong>
                </div>

                <div className={cx('revenueItem')}>
                    <span className={cx('revenueLabel')}>
                        <i className={cx('dot', 'cyan')} />
                        AI Add-on
                    </span>
                    <strong>{formatMoneyShort(totalAddons)}</strong>
                </div>

                <div className={cx('revenueItem')}>
                    <span className={cx('revenueLabel')}>
                        <i className={cx('dot', 'gray')} />
                        Khác
                    </span>
                    <strong>{formatMoneyShort(otherRevenue)}</strong>
                </div>
            </div>
        </div>
    );
}

function RecentOrdersTable({ orders = [] }) {
    const safeOrders = Array.isArray(orders) ? orders : [];

    return (
        <div className={cx('panel', 'tablePanel')}>
            <div className={cx('panelHeader')}>
                <h3>Giao dịch gần đây</h3>
                <Link to={config.router.adminOrders} className={cx('linkBtn')}>
                    Xem tất cả
                </Link>
            </div>

            <div className={cx('tableWrap')}>
                <table className={cx('table')}>
                    <thead>
                        <tr>
                            <th>MÃ ĐƠN HÀNG</th>
                            <th>NGƯỜI DÙNG</th>
                            <th>GÓI</th>
                            <th>SỐ TIỀN</th>
                            <th>TRẠNG THÁI</th>
                            <th>THỜI GIAN</th>
                        </tr>
                    </thead>
                    <tbody>
                        {safeOrders.length > 0 ? (
                            safeOrders.map((item) => (
                                <tr key={item?.id}>
                                    <td>{item?.id}</td>
                                    <td>{item?.email}</td>
                                    <td>{item?.plan}</td>
                                    <td>{item?.amount}</td>
                                    <td>
                                        <span
                                            className={cx(
                                                'statusPill',
                                                item?.statusType || 'warning',
                                            )}
                                        >
                                            {item?.status}
                                        </span>
                                    </td>
                                    <td>{item?.time}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className={cx('emptyTable')}>
                                    Chưa có giao dịch gần đây
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const [appliedFilterType, setAppliedFilterType] = useState('30d');
    const [appliedFromDate, setAppliedFromDate] = useState('');
    const [appliedToDate, setAppliedToDate] = useState('');

    const [draftFilterType, setDraftFilterType] = useState('30d');
    const [draftFromDate, setDraftFromDate] = useState('');
    const [draftToDate, setDraftToDate] = useState('');

    const [selectedRangeLabel, setSelectedRangeLabel] =
        useState('30 ngày gần nhất');
    const [isOpenFilter, setIsOpenFilter] = useState(false);

    const [stats, setStats] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [chartPieData, setChartPieData] = useState({});
    const [subscriptionData, setSubscriptionData] = useState({
        premiumUpgradeRate: '0%',
        paymentSuccessRate: '0%',
        pendingOrders: 0,
        failedPayments: 0,
    });

    const [loading, setLoading] = useState(false);
    const [firstLoading, setFirstLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const filterRef = useRef(null);
    const hasDashboardDataRef = useRef(false);

    const filterParams = useMemo(() => {
        if (appliedFilterType === 'custom') {
            return {
                from: appliedFromDate,
                to: appliedToDate,
            };
        }

        return {
            range: appliedFilterType,
        };
    }, [appliedFilterType, appliedFromDate, appliedToDate]);

    const hasData =
        stats.length > 0 ||
        chartData.length > 0 ||
        recentOrders.length > 0 ||
        Number(chartPieData?.totalRevenues) > 0;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                filterRef.current &&
                !filterRef.current.contains(event.target)
            ) {
                setIsOpenFilter(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const mapStats = useCallback((summary = {}) => {
        return [
            {
                id: 1,
                icon: LuUsers,
                label: 'Tổng người dùng',
                value: formatNumber(summary?.total_users?.value),
                change: formatGrowthPercent(
                    summary?.total_users?.growth_percent,
                ),
            },
            {
                id: 2,
                icon: LuFileText,
                label: 'CV đã tạo',
                value: formatNumber(summary?.total_cvs?.value),
                change: formatGrowthPercent(summary?.total_cvs?.growth_percent),
            },
            {
                id: 3,
                icon: HiOutlineSparkles,
                label: 'Lượt phân tích AI',
                value: formatNumber(summary?.total_aiRuns?.value),
                change: formatGrowthPercent(
                    summary?.total_aiRuns?.growth_percent,
                ),
            },
            {
                id: 4,
                icon: LuDownload,
                label: 'CV đã export',
                value: formatNumber(summary?.total_exports?.value),
                change: formatGrowthPercent(
                    summary?.total_exports?.growth_percent,
                ),
            },
            {
                id: 5,
                icon: FiCreditCard,
                label: 'Đơn hàng thành công',
                value: formatNumber(summary?.total_success_payments?.value),
                change: formatGrowthPercent(
                    summary?.total_success_payments?.growth_percent,
                ),
            },
            {
                id: 6,
                icon: RiMoneyDollarCircleLine,
                label: 'Tổng doanh thu',
                value: formatMoneyShort(summary?.total_amount?.value),
                change: formatGrowthPercent(
                    summary?.total_amount?.growth_percent,
                ),
            },
        ];
    }, []);

    const mapRecentOrders = useCallback((items = []) => {
        return (Array.isArray(items) ? items : []).map((item) => {
            let statusType = 'warning';
            let statusText = item?.status || '';

            if (item?.status === 'PAID') {
                statusType = 'success';
                statusText = 'ĐÃ THANH TOÁN';
            }

            if (item?.status === 'PENDING') {
                statusType = 'warning';
                statusText = 'ĐANG CHỜ';
            }

            if (item?.status === 'CANCELED' || item?.status === 'FAILED') {
                statusType = 'danger';
                statusText = 'THẤT BẠI';
            }

            let planName = '';
            if (item?.order_type === 'BOTH') {
                const plan = item?.plan?.name || '';
                const addon = item?.addon_package?.name || '';
                planName = [plan, addon].filter(Boolean).join(' + ');
            } else if (item?.plan?.name) {
                planName = item.plan.name;
            } else if (item?.addon_package?.name) {
                planName = item.addon_package.name;
            }

            return {
                id: item?.order_code || item?.id || '',
                email: item?.user?.email || '',
                plan: planName || 'Không rõ',
                amount: formatMoney(item?.amount_cents),
                status: statusText,
                statusType,
                time: formatRelativeTime(item?.createdAt || item?.created_at),
            };
        });
    }, []);

    const mapChartData = useCallback((items = []) => {
        return (Array.isArray(items) ? items : []).map((item) => ({
            label: item?.label || '',
            users: Number(item?.users?.value) || 0,
            cvs: Number(item?.cvs?.value) || 0,
            aiRuns: Number(item?.aiRuns?.value) || 0,
        }));
    }, []);

    const fetchDashboardData = useCallback(
    async (params, showRefresh = false) => {
        const shouldShowErrorState =
            !showRefresh || !hasDashboardDataRef.current;

        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            if (!showRefresh) {
                setErrorMessage('');
            }

            const res = await getAdminDashboard(params);

            if (!res?.success) {
                const message =
                    res?.message ||
                    res?.messsage ||
                    'Không tải được dashboard';

                if (shouldShowErrorState) {
                    setErrorMessage(message);
                }

                return {
                    success: false,
                    message,
                };
            }

            const dashboardData = res?.data || {};

            setStats(mapStats(dashboardData?.summary));
            setChartData(mapChartData(dashboardData?.chartLineData));
            setChartPieData(dashboardData?.chartPieData || {});

            setSubscriptionData({
                premiumUpgradeRate: formatPercent(
                    dashboardData?.chartProgress?.premiumRate,
                    1,
                ),
                paymentSuccessRate: formatPercent(
                    dashboardData?.chartProgress?.paymentPaidRate,
                    1,
                ),
                pendingOrders: dashboardData?.chartProgress?.pending || 0,
                failedPayments: dashboardData?.chartProgress?.canceled || 0,
            });

            setRecentOrders(
                mapRecentOrders(
                    dashboardData?.payments?.data?.data || [],
                ).slice(0, 4),
            );

            hasDashboardDataRef.current = true;

            return {
                success: true,
            };
        } catch {
            const message = 'Có lỗi xảy ra khi tải dashboard';

            if (shouldShowErrorState) {
                setErrorMessage(message);
            }

            return {
                success: false,
                message,
            };
        } finally {
            setLoading(false);
            setRefreshing(false);
            setFirstLoading(false);
        }
    },
    [mapChartData, mapStats, mapRecentOrders],
);

    useEffect(() => {
        fetchDashboardData(filterParams);
    }, [fetchDashboardData, filterParams]);

    const handleResetFilter = () => {
        setDraftFilterType('30d');
        setDraftFromDate('');
        setDraftToDate('');

        setAppliedFilterType('30d');
        setAppliedFromDate('');
        setAppliedToDate('');
        setSelectedRangeLabel('30 ngày gần nhất');
        setIsOpenFilter(false);
    };

    const handleApplyFilter = () => {
        if (draftFilterType === 'custom') {
            if (!draftFromDate || !draftToDate) {
                toast.warning(
                    'Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.',
                );
                return;
            }

            if (draftFromDate > draftToDate) {
                toast.warning('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
                return;
            }
        }

        setAppliedFilterType(draftFilterType);
        setAppliedFromDate(draftFromDate);
        setAppliedToDate(draftToDate);
        setSelectedRangeLabel(FILTER_OPTIONS[draftFilterType]);
        setIsOpenFilter(false);
    };

    const handleRefresh = async () => {
        const result = await fetchDashboardData(filterParams, true);

        if (result?.success) {
            toast.success('Dashboard đã được làm mới.');
            return;
        }

        toast.error(result?.message || 'Không thể làm mới dashboard.');
    };

    const fetchApi = async (params, format = 'excel') => {
        const response = await exportAdminDashboardReport(params, format);
        const config = EXPORT_CONFIG[format] || EXPORT_CONFIG.excel;

        const blobData = response?.data || response;

        if (!(blobData instanceof Blob)) {
            throw new Error('Dữ liệu tải xuống không hợp lệ.');
        }

        if (blobData.size === 0) {
            throw new Error('File tải xuống rỗng.');
        }

        const fileName = getFileNameFromHeaders(
            response?.headers,
            `dashboard-report.${config.extension}`,
        );

        const blob = new Blob([blobData], {
            type: blobData.type || config.mime,
        });

        downloadBlob(blob, fileName);

        return true;
    };

    const handleExportReport = async () => {
        setExporting(true);

        try {
            await toast.promise(fetchApi(filterParams, 'excel'), {
                pending: 'Đang tải xuống...',
                success: 'Tải xuống thành công.',
                error: {
                    render({ data }) {
                        return (
                            data?.message ||
                            data?.toString?.() ||
                            'Hệ thống đang xảy ra lỗi vui lòng thử lại sau giây lát.'
                        );
                    },
                },
            });
        } finally {
            setExporting(false);
        }
    };

    const showInitialLoading = firstLoading && loading;
    const showContent = !showInitialLoading && !errorMessage && hasData;

    return (
        <div className={cx('page')}>
            <div className={cx('headerRow')}>
                <div>
                    <h1 className={cx('pageTitle')}>Báo cáo & Thống kê</h1>
                    <p className={cx('pageDesc')}>
                        Theo dõi người dùng, CV, AI analysis,
                        <br />
                        đơn hàng và doanh thu của hệ thống.
                    </p>
                </div>

                <div className={cx('actions')}>
                    <div className={cx('filterDropdown')} ref={filterRef}>
                        <button
                            type="button"
                            className={cx('filterBtn')}
                            onClick={() => setIsOpenFilter((prev) => !prev)}
                            disabled={showInitialLoading || refreshing}
                        >
                            <FiCalendar />
                            <span>{selectedRangeLabel}</span>
                            <FiChevronDown />
                        </button>

                        {isOpenFilter && (
                            <div className={cx('filterPanel')}>
                                <div className={cx('filterTabs')}>
                                    <button
                                        type="button"
                                        className={cx('filterTab', {
                                            active: draftFilterType === '7d',
                                        })}
                                        onClick={() => setDraftFilterType('7d')}
                                    >
                                        7 ngày
                                    </button>

                                    <button
                                        type="button"
                                        className={cx('filterTab', {
                                            active: draftFilterType === '30d',
                                        })}
                                        onClick={() => setDraftFilterType('30d')}
                                    >
                                        30 ngày
                                    </button>

                                    <button
                                        type="button"
                                        className={cx('filterTab', {
                                            active: draftFilterType === 'month',
                                        })}
                                        onClick={() =>
                                            setDraftFilterType('month')
                                        }
                                    >
                                        Tháng
                                    </button>

                                    <button
                                        type="button"
                                        className={cx('filterTab', {
                                            active: draftFilterType === 'year',
                                        })}
                                        onClick={() =>
                                            setDraftFilterType('year')
                                        }
                                    >
                                        Năm
                                    </button>

                                    <button
                                        type="button"
                                        className={cx('filterTab', {
                                            active: draftFilterType === 'custom',
                                        })}
                                        onClick={() =>
                                            setDraftFilterType('custom')
                                        }
                                    >
                                        Khoảng thời gian
                                    </button>
                                </div>

                                {draftFilterType === 'custom' && (
                                    <div className={cx('filterBody')}>
                                        <div className={cx('filterRange')}>
                                            <input
                                                type="date"
                                                className={cx('filterInput')}
                                                value={draftFromDate}
                                                onChange={(event) =>
                                                    setDraftFromDate(
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <input
                                                type="date"
                                                className={cx('filterInput')}
                                                value={draftToDate}
                                                onChange={(event) =>
                                                    setDraftToDate(
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className={cx('filterActions')}>
                                    <button
                                        type="button"
                                        className={cx('filterReset')}
                                        onClick={handleResetFilter}
                                    >
                                        Đặt lại
                                    </button>

                                    <button
                                        type="button"
                                        className={cx('filterApply')}
                                        onClick={handleApplyFilter}
                                    >
                                        Áp dụng
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        className={cx('ghostActionBtn')}
                        onClick={handleExportReport}
                        disabled={exporting || showInitialLoading}
                    >
                        <FiDownload />
                        <span>
                            {exporting ? 'Đang xuất...' : 'Xuất báo cáo'}
                        </span>
                    </button>

                    <button
                        type="button"
                        className={cx('primaryActionBtn')}
                        onClick={handleRefresh}
                        disabled={refreshing || showInitialLoading}
                    >
                        <FiRefreshCw
                            className={cx('refreshIcon', {
                                spinning: refreshing || loading,
                            })}
                        />
                        <span>
                            {refreshing || loading ? 'Đang tải...' : 'Làm mới'}
                        </span>
                    </button>
                </div>
            </div>

            {errorMessage ? (
                <div className={cx('stateBox')}>
                    <FiAlertCircle className={cx('stateIcon')} />
                    <h3>Không tải được dashboard</h3>
                    <p>{errorMessage}</p>
                </div>
            ) : showInitialLoading ? (
                <div className={cx('stateBox')}>
                    <h3>Đang tải dữ liệu dashboard...</h3>
                </div>
            ) : showContent ? (
                <>
                    <div className={cx('statsGrid')}>
                        {stats.map((item) => (
                            <StatCard
                                key={item.id}
                                icon={item.icon}
                                label={item.label}
                                value={item.value}
                                change={item.change}
                            />
                        ))}
                    </div>

                    <div className={cx('topGrid')}>
                        <TrendChart chartData={chartData} />
                        <RevenueDonut chartPieData={chartPieData} />
                    </div>

                    <div className={cx('panel')}>
                        <div className={cx('panelHeader')}>
                            <h3>Subscription & Payment</h3>
                        </div>

                        <div className={cx('progressBlock')}>
                            <div className={cx('progressRow')}>
                                <div className={cx('progressHeader')}>
                                    <span>Tỷ lệ nâng cấp Premium</span>
                                    <strong>
                                        {subscriptionData.premiumUpgradeRate}
                                    </strong>
                                </div>
                                <div className={cx('progressTrack')}>
                                    <div
                                        className={cx(
                                            'progressBar',
                                            'purpleBar',
                                        )}
                                        style={{
                                            width: subscriptionData.premiumUpgradeRate,
                                        }}
                                    />
                                </div>
                            </div>

                            <div className={cx('progressRow')}>
                                <div className={cx('progressHeader')}>
                                    <span>Tỷ lệ thanh toán thành công</span>
                                    <strong className={cx('greenText')}>
                                        {subscriptionData.paymentSuccessRate}
                                    </strong>
                                </div>
                                <div className={cx('progressTrack')}>
                                    <div
                                        className={cx(
                                            'progressBar',
                                            'greenBar',
                                        )}
                                        style={{
                                            width: subscriptionData.paymentSuccessRate,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={cx('paymentMeta')}>
                            <span className={cx('legendItem')}>
                                <i className={cx('dot', 'orange')} />
                                Đơn hàng đang chờ
                                <strong>
                                    {subscriptionData.pendingOrders}
                                </strong>
                            </span>

                            <span className={cx('legendItem')}>
                                <i className={cx('dot', 'red')} />
                                Thanh toán thất bại
                                <strong>
                                    {subscriptionData.failedPayments}
                                </strong>
                            </span>
                        </div>
                    </div>

                    <RecentOrdersTable orders={recentOrders} />
                </>
            ) : (
                <div className={cx('stateBox')}>
                    <h3>Chưa có dữ liệu dashboard</h3>
                    <p>
                        Hãy thử chọn khoảng thời gian khác hoặc làm mới dữ liệu.
                    </p>
                </div>
            )}
        </div>
    );
}
