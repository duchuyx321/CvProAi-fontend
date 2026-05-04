import { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import {
    FiAlertCircle,
    FiCalendar,
    FiChevronDown,
    FiCreditCard,
    FiDownload,
    FiFileText,
    FiGrid,
    FiLogOut,
    FiRefreshCw,
    FiSettings,
    FiShoppingCart,
    FiUsers,
} from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import styles from './AdminDashboard.module.scss';
import { getAdminDashboard } from '~/services/admin-dashboard.service';

const cx = classNames.bind(styles);

const NAV_ITEMS = [
    { icon: FiGrid, label: 'Trang tổng quan', active: true },
    { icon: FiUsers, label: 'Quản lý tài khoản' },
    { icon: FiFileText, label: 'Quản lý mẫu CV' },
    { icon: HiOutlineSparkles, label: 'Quản lý gói dịch vụ' },
    { icon: FiShoppingCart, label: 'Quản lý đơn hàng' },
    { icon: FiSettings, label: 'Cài đặt' },
];

function getTodayValue() {
    return new Date().toISOString().split('T')[0];
}

function getCurrentMonthValue() {
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, '0');
    return `${year}-${month}`;
}

function formatNumber(value) {
    if (value === null || value === undefined || value === '') return '0';
    return new Intl.NumberFormat('vi-VN').format(Number(value) || 0);
}

function formatMoney(value) {
    if (value === null || value === undefined || value === '') return '0đ';
    return `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)}đ`;
}

function SidebarNav() {
    return (
        <nav className={cx('nav')}>
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;

                return (
                    <button
                        key={item.label}
                        type="button"
                        className={cx('navItem', { active: item.active })}
                    >
                        <span className={cx('navIcon')}>
                            <Icon />
                        </span>
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}

function StatCard({ icon: Icon, label, value, change }) {
    return (
        <div className={cx('statCard')}>
            <div className={cx('statTop')}>
                <div className={cx('statIcon')}>
                    <Icon />
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
        const height = 260;
        const stepX = safeChartData.length > 1 ? width / (safeChartData.length - 1) : 0;

        return safeChartData
            .map((item, index) => {
                const x = index * stepX;
                const rawValue = Number(item?.[key]) || 0;
                const y = height - (rawValue / maxValue) * height;

                if (index === 0) {
                    return `M${x},${y}`;
                }

                return `L${x},${y}`;
            })
            .join(' ');
    };

    const usersPath = buildPath('users');
    const cvsPath = buildPath('cvs');
    const aiRunsPath = buildPath('aiRuns');

    return (
        <div className={cx('chartBox')}>
            <div className={cx('chartHeader')}>
                <h3>Tăng trưởng hoạt động hệ thống</h3>
                <button type="button" className={cx('ghostIconBtn')}>
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
                        viewBox="0 0 600 260"
                        preserveAspectRatio="none"
                    >
                        {usersPath ? (
                            <path d={usersPath} className={cx('lineBlue')} />
                        ) : null}
                        {cvsPath ? (
                            <path d={cvsPath} className={cx('lineCyan')} />
                        ) : null}
                        {aiRunsPath ? (
                            <path d={aiRunsPath} className={cx('linePurple')} />
                        ) : null}
                    </svg>

                    <div className={cx('xAxis')}>
                        {safeChartData.length > 0
                            ? safeChartData.map((item, index) => (
                                  <span key={`${item?.label || 'label'}-${index}`}>
                                      {item?.label || `M${index + 1}`}
                                  </span>
                              ))
                            : ['W1', 'W2', 'W3', 'W4'].map((item) => (
                                  <span key={item}>{item}</span>
                              ))}
                    </div>
                </div>
            </div>

            <div className={cx('chartLegend')}>
                <span className={cx('legendItem')}>
                    <i className={cx('dot', 'blue')} />
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

function RecentOrdersTable({ orders = [] }) {
    const safeOrders = Array.isArray(orders) ? orders : [];

    return (
        <div className={cx('card', 'tableCard')}>
            <div className={cx('tableHeader')}>
                <h3 className={cx('cardTitle')}>Giao dịch gần đây</h3>
                <button type="button" className={cx('linkBtn')}>
                    Xem tất cả
                </button>
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
    const [filterType, setFilterType] = useState('range');
    const [selectedRangeLabel, setSelectedRangeLabel] = useState('30 ngày gần nhất');
    const [selectedDay, setSelectedDay] = useState(getTodayValue());
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue());
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [isOpenFilter, setIsOpenFilter] = useState(false);

    const [stats, setStats] = useState([]);
    const [revenueItems, setRevenueItems] = useState([]);
    const [aiKeywords, setAiKeywords] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [chartData, setChartData] = useState([]);
    const [subscriptionData, setSubscriptionData] = useState({
        premiumUpgradeRate: '0%',
        paymentSuccessRate: '0%',
        pendingOrders: 0,
        failedPayments: 0,
    });
    const [aiSummary, setAiSummary] = useState({
        avgMatchScore: '0%',
        successRate: '0%',
        errorCount: 0,
    });

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const filterRef = useRef(null);

    const filterParams = useMemo(() => {
        if (filterType === 'day') {
            return {
                type: 'day',
                day: selectedDay,
            };
        }

        if (filterType === 'month') {
            return {
                type: 'month',
                month: selectedMonth,
            };
        }

        if (fromDate && toDate) {
            return {
                type: 'range',
                fromDate,
                toDate,
            };
        }

        return {
            type: 'preset',
            preset: '30_days',
        };
    }, [filterType, selectedDay, selectedMonth, fromDate, toDate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsOpenFilter(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const mapStats = (overview = {}) => {
        return [
            {
                id: 1,
                icon: FiUsers,
                label: 'Tổng người dùng',
                value: formatNumber(overview?.totalUsers),
                change: overview?.usersGrowth || '+0%',
            },
            {
                id: 2,
                icon: FiFileText,
                label: 'CV đã tạo',
                value: formatNumber(overview?.totalCvs),
                change: overview?.cvsGrowth || '+0%',
            },
            {
                id: 3,
                icon: HiOutlineSparkles,
                label: 'Lượt phân tích AI',
                value: formatNumber(overview?.totalAiRuns),
                change: overview?.aiRunsGrowth || '+0%',
            },
            {
                id: 4,
                icon: FiDownload,
                label: 'CV đã export',
                value: formatNumber(overview?.totalExports),
                change: overview?.exportsGrowth || '+0%',
            },
            {
                id: 5,
                icon: FiShoppingCart,
                label: 'Đơn hàng thành công',
                value: formatNumber(overview?.totalSuccessOrders),
                change: overview?.ordersGrowth || '+0%',
            },
            {
                id: 6,
                icon: FiCreditCard,
                label: 'Tổng doanh thu',
                value: formatMoney(overview?.totalRevenue),
                change: overview?.revenueGrowth || '+0%',
            },
        ];
    };

    const mapRevenueItems = (items = []) => {
        return (Array.isArray(items) ? items : []).map((item) => ({
            label: item?.label || item?.name || 'Không rõ',
            value: formatMoney(item?.value || item?.revenue || 0),
            width: `${item?.percent || 0}%`,
        }));
    };

    const mapRecentOrders = (items = []) => {
        return (Array.isArray(items) ? items : []).map((item) => {
            let statusType = 'warning';

            if (item?.status === 'ĐÃ THANH TOÁN' || item?.status === 'SUCCESS') {
                statusType = 'success';
            }

            if (item?.status === 'THẤT BẠI' || item?.status === 'FAILED') {
                statusType = 'danger';
            }

            return {
                id: item?.id || '',
                email: item?.email || item?.userEmail || '',
                plan: item?.plan || item?.packageName || '',
                amount: formatMoney(item?.amount || 0),
                status: item?.statusText || item?.status || '',
                statusType,
                time: item?.time || item?.createdAtLabel || '',
            };
        });
    };

    const mapChartData = (items = []) => {
        return (Array.isArray(items) ? items : []).map((item) => ({
            label: item?.label || '',
            users: Number(item?.users) || 0,
            cvs: Number(item?.cvs) || 0,
            aiRuns: Number(item?.aiRuns) || 0,
        }));
    };

    const fetchDashboardData = async (params = filterParams) => {
        try {
            setLoading(true);
            setErrorMessage('');

            const res = await getAdminDashboard(params);

            if (!res?.success) {
                const message =
                    res?.message || res?.messsage || 'Không tải được dashboard';
                setErrorMessage(message);
                return;
            }

            const dashboardData = res?.data || {};

            setStats(mapStats(dashboardData?.overview));
            setRevenueItems(mapRevenueItems(dashboardData?.revenueByPlan));
            setAiKeywords(
                Array.isArray(dashboardData?.aiKeywords)
                    ? dashboardData.aiKeywords
                    : [],
            );
            setRecentOrders(mapRecentOrders(dashboardData?.recentOrders));
            setChartData(mapChartData(dashboardData?.activityChart));

            setSubscriptionData({
                premiumUpgradeRate:
                    dashboardData?.subscription?.premiumUpgradeRate || '0%',
                paymentSuccessRate:
                    dashboardData?.subscription?.paymentSuccessRate || '0%',
                pendingOrders:
                    dashboardData?.subscription?.pendingOrders || 0,
                failedPayments:
                    dashboardData?.subscription?.failedPayments || 0,
            });

            setAiSummary({
                avgMatchScore:
                    dashboardData?.aiSummary?.avgMatchScore || '0%',
                successRate:
                    dashboardData?.aiSummary?.successRate || '0%',
                errorCount:
                    dashboardData?.aiSummary?.errorCount || 0,
            });
        } catch {
            setErrorMessage('Có lỗi xảy ra khi tải dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData(filterParams);
    }, [filterParams]);

    const handleResetFilter = () => {
        const today = getTodayValue();
        const currentMonth = getCurrentMonthValue();

        setFilterType('range');
        setSelectedRangeLabel('30 ngày gần nhất');
        setSelectedDay(today);
        setSelectedMonth(currentMonth);
        setFromDate('');
        setToDate('');
        setIsOpenFilter(false);
    };

    const handleApplyFilter = () => {
        if (filterType === 'day') {
            if (!selectedDay) return;
            setSelectedRangeLabel('Theo ngày');
        }

        if (filterType === 'month') {
            if (!selectedMonth) return;
            setSelectedRangeLabel('Theo tháng');
        }

        if (filterType === 'range') {
            if (!fromDate || !toDate) return;
            if (fromDate > toDate) return;
            setSelectedRangeLabel('Khoảng thời gian');
        }

        setIsOpenFilter(false);
    };

    const handleRefresh = () => {
        fetchDashboardData(filterParams);
    };

    return (
        <div className={cx('page')}>
            <aside className={cx('sidebar')}>
                <div className={cx('brand')}>
                    <div className={cx('brandLogo')}>CV</div>
                    <div>
                        <h2 className={cx('brandName')}>CVProAI</h2>
                        <p className={cx('brandSub')}>Hệ thống quản trị</p>
                    </div>
                </div>

                <SidebarNav />

                <button type="button" className={cx('logoutBtn')}>
                    <FiLogOut />
                    <span>Đăng xuất</span>
                </button>
            </aside>

            <main className={cx('main')}>
                <div className={cx('topbar')}>
                    <h1 className={cx('pageTitle')}>Trang thống kê</h1>

                    <button type="button" className={cx('userBtn')}>
                        <span className={cx('avatar')}>QT</span>
                        <span>Quản trị viên</span>
                        <FiChevronDown />
                    </button>
                </div>

                <section className={cx('content')}>
                    <div className={cx('headingRow')}>
                        <div>
                            <h2 className={cx('headingTitle')}>
                                Báo cáo & Thống kê
                            </h2>
                            <p className={cx('headingDesc')}>
                                Theo dõi người dùng, CV, AI analysis,
                                <br />
                                đơn hàng và doanh thu theo thời gian.
                            </p>
                        </div>

                        <div className={cx('headingActions')}>
                            <div className={cx('filterDropdown')} ref={filterRef}>
                                <button
                                    type="button"
                                    className={cx('filterBtn')}
                                    onClick={() =>
                                        setIsOpenFilter((prev) => !prev)
                                    }
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
                                                    active: filterType === 'day',
                                                })}
                                                onClick={() => setFilterType('day')}
                                            >
                                                Theo ngày
                                            </button>

                                            <button
                                                type="button"
                                                className={cx('filterTab', {
                                                    active:
                                                        filterType === 'month',
                                                })}
                                                onClick={() =>
                                                    setFilterType('month')
                                                }
                                            >
                                                Theo tháng
                                            </button>

                                            <button
                                                type="button"
                                                className={cx('filterTab', {
                                                    active:
                                                        filterType === 'range',
                                                })}
                                                onClick={() =>
                                                    setFilterType('range')
                                                }
                                            >
                                                Khoảng thời gian
                                            </button>
                                        </div>

                                        <div className={cx('filterBody')}>
                                            {filterType === 'day' && (
                                                <input
                                                    type="date"
                                                    className={cx('filterInput')}
                                                    value={selectedDay}
                                                    onChange={(event) =>
                                                        setSelectedDay(
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            )}

                                            {filterType === 'month' && (
                                                <input
                                                    type="month"
                                                    className={cx('filterInput')}
                                                    value={selectedMonth}
                                                    onChange={(event) =>
                                                        setSelectedMonth(
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            )}

                                            {filterType === 'range' && (
                                                <div
                                                    className={cx('filterRange')}
                                                >
                                                    <input
                                                        type="date"
                                                        className={cx(
                                                            'filterInput',
                                                        )}
                                                        value={fromDate}
                                                        onChange={(event) =>
                                                            setFromDate(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                    <input
                                                        type="date"
                                                        className={cx(
                                                            'filterInput',
                                                        )}
                                                        value={toDate}
                                                        onChange={(event) =>
                                                            setToDate(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                    />
                                                </div>
                                            )}
                                        </div>

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

                            <button type="button" className={cx('outlineBtn')}>
                                <FiDownload />
                                <span>Xuất báo cáo</span>
                            </button>

                            <button
                                type="button"
                                className={cx('primaryBtn')}
                                onClick={handleRefresh}
                            >
                                <FiRefreshCw />
                                <span>Làm mới</span>
                            </button>
                        </div>
                    </div>

                    {errorMessage ? (
                        <div className={cx('dashboardState')}>
                            <FiAlertCircle className={cx('stateIcon')} />
                            <h3>Không tải được dashboard</h3>
                            <p>{errorMessage}</p>
                            <button
                                type="button"
                                className={cx('retryBtn')}
                                onClick={handleRefresh}
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : loading ? (
                        <div className={cx('dashboardState')}>
                            <h3>Đang tải dữ liệu dashboard...</h3>
                        </div>
                    ) : (
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

                            <div className={cx('middleGrid')}>
                                <TrendChart chartData={chartData} />

                                <div className={cx('card')}>
                                    <h3 className={cx('cardTitle')}>
                                        Doanh thu theo gói
                                    </h3>

                                    <div className={cx('revenueList')}>
                                        {revenueItems.length > 0 ? (
                                            revenueItems.map((item) => (
                                                <div
                                                    key={item.label}
                                                    className={cx('revenueItem')}
                                                >
                                                    <div className={cx('revenueRow')}>
                                                        <span>{item.label}</span>
                                                        <strong>{item.value}</strong>
                                                    </div>

                                                    <div className={cx('progressTrack')}>
                                                        <div
                                                            className={cx('progressBar')}
                                                            style={{
                                                                width: item.width,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className={cx('emptyText')}>
                                                Chưa có dữ liệu doanh thu theo gói
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className={cx('smallGrid')}>
                                <div className={cx('card')}>
                                    <h3 className={cx('cardTitle')}>
                                        Hiệu suất AI Analysis
                                    </h3>

                                    <div className={cx('metricsGrid')}>
                                        <div>
                                            <span className={cx('miniLabel')}>
                                                Match Score trung bình
                                            </span>
                                            <strong className={cx('miniValue')}>
                                                {aiSummary.avgMatchScore}
                                            </strong>
                                        </div>

                                        <div>
                                            <span className={cx('miniLabel')}>
                                                Tỷ lệ phân tích thành công
                                            </span>
                                            <strong
                                                className={cx('miniValue', 'green')}
                                            >
                                                {aiSummary.successRate}
                                            </strong>
                                        </div>

                                        <div>
                                            <span className={cx('miniLabel')}>
                                                Lượt AI lỗi
                                            </span>
                                            <strong
                                                className={cx('miniValue', 'red')}
                                            >
                                                {aiSummary.errorCount}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className={cx('tagTitle')}>
                                        Từ khóa thiếu phổ biến
                                    </div>

                                    <div className={cx('tagList')}>
                                        {aiKeywords.length > 0 ? (
                                            aiKeywords.map((tag) => (
                                                <span key={tag} className={cx('tag')}>
                                                    {tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className={cx('emptyText')}>
                                                Chưa có dữ liệu
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className={cx('card')}>
                                    <h3 className={cx('cardTitle')}>
                                        Subscription & Payment
                                    </h3>

                                    <div className={cx('subscriptionItem')}>
                                        <div className={cx('revenueRow')}>
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
                                                    width:
                                                        subscriptionData.premiumUpgradeRate,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className={cx('subscriptionItem')}>
                                        <div className={cx('revenueRow')}>
                                            <span>Tỷ lệ thanh toán thành công</span>
                                            <strong className={cx('green')}>
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
                                                    width:
                                                        subscriptionData.paymentSuccessRate,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className={cx('paymentLegend')}>
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
                            </div>

                            <RecentOrdersTable orders={recentOrders} />
                        </>
                    )}
                </section>
            </main>
        </div>
    );
}