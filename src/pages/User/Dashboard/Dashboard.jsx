import React, { useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './Dashboard.module.scss';
import { FiFileText, FiDownload, FiMoreHorizontal, FiCheckCircle, FiEdit2, FiPlusCircle, FiArrowRight, FiAward } from 'react-icons/fi';
import { LuBrainCircuit } from 'react-icons/lu';
import { GrGenai } from 'react-icons/gr';

const cx = classNames.bind(styles);

function Dashboard() {

    const [isLoading, setIsLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        stats: null,
        recentCvs: [],
        recentActivities: []
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);

                // const response = await axios.get('/api/v1/user/dashboard');
                // setDashboardData(response.data);

                // Giả lập API delay 0.5s 
                await new Promise(resolve => setTimeout(resolve, 100));

                setDashboardData({
                    stats: {
                        totalCv: 24,
                        aiUsed: 45,
                        aiLimit: 100,
                        currentPlan: 'Premium',
                        totalPdfExports: 12
                    },
                    recentCvs: [
                        { id: 1, name: 'Senior React Developer', template: 'Modern Professional', updated: '2 giờ trước', status: 'Hoàn tất', statusCode: 'success' },
                        { id: 2, name: 'UX Designer - Google', template: 'Minimalist Dark', updated: 'Hôm qua', status: 'Đang sửa', statusCode: 'warning' },
                        { id: 3, name: 'Frontend Engineer', template: 'Academic CV', updated: '3 ngày trước', status: 'Hoàn tất', statusCode: 'success' },
                    ],
                    recentActivities: [
                        { id: 1, type: 'export', title: 'Xuất file thành công', desc: 'Bạn đã tải xuống CV "Senior React Developer" dưới dạng PDF.', time: '15 PHÚT TRƯỚC' },
                        { id: 2, type: 'edit', title: 'Chỉnh sửa CV', desc: 'Đã cập nhật phần "Kinh nghiệm làm việc" trong hồ sơ UX Designer.', time: '2 GIỜ TRƯỚC' },
                        { id: 3, type: 'ai', title: 'Phân tích AI hoàn tất', desc: 'AI đã chấm điểm 88/100 cho hồ sơ "Frontend Engineer".', time: 'HÔM QUA' },
                        { id: 4, type: 'create', title: 'Tạo CV mới', desc: 'Bạn đã bắt đầu một CV mới sử dụng mẫu "Minimalist Dark".', time: '3 NGÀY TRƯỚC' },
                    ]
                });
            } catch (error) {
                console.error("Lỗi tải dữ liệu dashboard:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (isLoading) {
        return <div className={cx('loading-state')}>Đang tải dữ liệu tổng quan...</div>;
    }

    const { stats, recentCvs, recentActivities } = dashboardData;

    return (
        <div className={cx('dashboard-wrapper')}>

            <div className={cx('page-header')}>
                <h1 className={cx('title')}>Trang tổng quan</h1>
                <p className={cx('subtitle')}>Chào mừng bạn quay trở lại, hãy tiếp tục tối ưu hóa sự nghiệp của bạn.</p>
            </div>

            <div className={cx('stats-grid')}>
                <div className={cx('stat-card')}>
                    <div className={cx('stat-header')}>
                        <div className={cx('icon-wrapper', 'blue')}><FiFileText /></div>
                        <span className={cx('tag', 'green')}>+3 tháng này</span>
                    </div>
                    <p className={cx('stat-label')}>Số CV đã tạo</p>
                    <h3 className={cx('stat-value')}>{stats.totalCv}</h3>
                </div>

                <div className={cx('stat-card')}>
                    <div className={cx('stat-header')}>
                        <div className={cx('icon-wrapper', 'purple')}><GrGenai /></div>
                        <span className={cx('tag', 'gray')}>Hạn mức tháng</span>
                    </div>
                    <p className={cx('stat-label')}>Phân tích AI đã dùng</p>
                    <h3 className={cx('stat-value')}>{stats.aiUsed}/{stats.aiLimit}</h3>
                </div>

                <div className={cx('stat-card')}>
                    <div className={cx('stat-header')}>
                        <div className={cx('icon-wrapper', 'yellow')}><FiAward /></div>
                        <span className={cx('tag', 'yellow')}>Đang hoạt động</span>
                    </div>
                    <p className={cx('stat-label')}>Gói tài khoản</p>
                    <h3 className={cx('stat-value')}>{stats.currentPlan}</h3>
                </div>

                <div className={cx('stat-card')}>
                    <div className={cx('stat-header')}>
                        <div className={cx('icon-wrapper', 'green')}><FiDownload /></div>
                        <span className={cx('tag', 'gray')}>Tổng cộng</span>
                    </div>
                    <p className={cx('stat-label')}>Số lần xuất PDF</p>
                    <h3 className={cx('stat-value')}>{stats.totalPdfExports}</h3>
                </div>
            </div>


            <div className={cx('main-grid')}>

                <div className={cx('left-column')}>

                    <div className={cx('box-card', 'cv-table-box')}>
                        <div className={cx('box-header')}>
                            <h2>CV gần đây</h2>
                            <button className={cx('btn-link')}>Xem tất cả</button>
                        </div>
                        <div className={cx('table-responsive')}>
                            <table className={cx('cv-table')}>
                                <thead>
                                    <tr >
                                        <th>TÊN CV</th>
                                        <th>MẪU THIẾT KẾ</th>
                                        <th>CẬP NHẬT</th>
                                        <th>TRẠNG THÁI</th>
                                        <th>HÀNH ĐỘNG</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentCvs.map(cv => (
                                        <tr key={cv.id}>
                                            <td>
                                                <div className={cx('cv-name-cell')}>
                                                    <FiFileText className={cx('file-icon')} />
                                                    <span className={cx('cv-name')}>{cv.name}</span>
                                                </div>
                                            </td>
                                            <td className={cx('text-muted')}>{cv.template}</td>
                                            <td className={cx('text-muted')}>{cv.updated}</td>
                                            <td>
                                                <span className={cx('status-badge', cv.statusCode)}>{cv.status}</span>
                                            </td>
                                            <td>
                                                <button className={cx('btn-icon')}><FiMoreHorizontal /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className={cx('ai-banner')}>
                        <div className={cx('ai-banner-content')}>
                            <h2>Tối ưu CV của bạn với AI</h2>
                            <p>Sử dụng công cụ phân tích từ khóa để tăng 85% khả năng vượt qua vòng lọc CV (ATS).</p>
                            <button className={cx('btn-ai-action')}>
                                Thử ngay bây giờ <FiArrowRight className={cx('arrow')} />
                            </button>
                        </div>
                        <LuBrainCircuit className={cx('bg-icon')} />
                    </div>
                </div>

                {/* Phải */}
                <div className={cx('right-column')}>
                    <div className={cx('box-card', 'activity-box')}>
                        <div className={cx('box-header')}>
                            <h2>Hoạt động gần đây</h2>
                        </div>
                        <div className={cx('activity-list')}>
                            {recentActivities.map(act => (
                                <div key={act.id} className={cx('activity-item')}>
                                    <div className={cx('activity-icon', act.type)}>
                                        {act.type === 'export' && <FiCheckCircle />}
                                        {act.type === 'edit' && <FiEdit2 />}
                                        {act.type === 'ai' && <LuBrainCircuit />}
                                        {act.type === 'create' && <FiPlusCircle />}
                                    </div>
                                    <div className={cx('activity-content')}>
                                        <h4>{act.title}</h4>
                                        <p>{act.desc}</p>
                                        <span className={cx('time')}>{act.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className={cx('btn-load-more')}>Tải thêm hoạt động</button>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default Dashboard;