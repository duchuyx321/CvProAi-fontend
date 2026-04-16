import { useEffect, useMemo, useState } from 'react';
import classNames from 'classnames/bind';
import {
    FiSearch,
    FiDownload,
    FiChevronLeft,
    FiChevronRight,
    FiFilter,
    FiTrendingUp,
} from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi2';
import { MdOutlineGridView } from 'react-icons/md';
import { IoRocketOutline } from 'react-icons/io5';
import styles from './CvAnalysisHistory.module.scss';
import AnalysisHistoryRow from './components/AnalysisHistoryRow';
import Button from '~/components/Button';
import { config } from '~/config';
// import {
//     getAnalysisHistory,
//     exportAnalysisHistory,
// } from '~/services/analysis-history.service';

const cx = classNames.bind(styles);

// eslint-disable-next-line react-refresh/only-export-components
export const ANALYSIS_STATUS = {
    QUEUED: 'QUEUED',
    RUNNING: 'RUNNING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
};

// eslint-disable-next-line react-refresh/only-export-components
export const HISTORY_DATA = {
    success: true,
    data: [
        {
            id: 1,
            fileName: 'Senior_UX_Designer_2024.pdf',
            isBest: true,
            role: 'Lead UI/UX Designer',
            analyzedAt: '14:20, 20/10/2023',
            score: 85,
            keywords: ['Figma', 'Design System', 'Strategy'],
            status: ANALYSIS_STATUS.SUCCESS,
        },
        {
            id: 2,
            fileName: 'Product_Manager_Tech.pdf',
            isBest: false,
            role: 'Senior Product Manager',
            analyzedAt: '09:15, 18/10/2023',
            score: 62,
            keywords: ['Agile', 'Backlog', 'Roadmap'],
            status: ANALYSIS_STATUS.RUNNING,
        },
        {
            id: 3,
            fileName: 'General_Marketing_CV.pdf',
            isBest: false,
            role: 'Digital Marketing Executive',
            analyzedAt: '16:45, 15/10/2023',
            score: 45,
            keywords: ['SEO'],
            status: ANALYSIS_STATUS.FAILED,
        },
        {
            id: 4,
            fileName: 'Backend_Engineer_Nodejs.pdf',
            isBest: false,
            role: 'Backend Engineer',
            analyzedAt: '11:30, 14/10/2023',
            score: null,
            keywords: [],
            status: ANALYSIS_STATUS.QUEUED,
        },
        {
            id: 5,
            fileName: 'Frontend_React_Developer.pdf',
            isBest: false,
            role: 'Frontend Developer',
            analyzedAt: '10:05, 12/10/2023',
            score: 78,
            keywords: ['ReactJS', 'Sass', 'REST API'],
            status: ANALYSIS_STATUS.SUCCESS,
        },
        {
            id: 6,
            fileName: 'Data_Analyst_Profile.pdf',
            isBest: false,
            role: 'Data Analyst',
            analyzedAt: '08:40, 11/10/2023',
            score: 71,
            keywords: ['SQL', 'Power BI', 'Excel'],
            status: ANALYSIS_STATUS.SUCCESS,
        },
        {
            id: 7,
            fileName: 'HR_Specialist_Application.pdf',
            isBest: false,
            role: 'HR Specialist',
            analyzedAt: '13:50, 10/10/2023',
            score: 53,
            keywords: ['Recruitment', 'Communication'],
            status: ANALYSIS_STATUS.SUCCESS,
        },
        {
            id: 8,
            fileName: 'QA_Automation_Tester.pdf',
            isBest: false,
            role: 'QA Automation Engineer',
            analyzedAt: '15:10, 09/10/2023',
            score: 66,
            keywords: ['Selenium', 'Test Case'],
            status: ANALYSIS_STATUS.RUNNING,
        },
        {
            id: 9,
            fileName: 'Business_Analyst_CV.pdf',
            isBest: false,
            role: 'Business Analyst',
            analyzedAt: '09:20, 08/10/2023',
            score: 58,
            keywords: ['BRD', 'Wireframe', 'UAT'],
            status: ANALYSIS_STATUS.SUCCESS,
        },
        {
            id: 10,
            fileName: 'DevOps_Engineer_Profile.pdf',
            isBest: false,
            role: 'DevOps Engineer',
            analyzedAt: '17:00, 07/10/2023',
            score: null,
            keywords: ['Docker', 'CI/CD'],
            status: ANALYSIS_STATUS.QUEUED,
        },
        {
            id: 11,
            fileName: 'Content_Writer_Portfolio.pdf',
            isBest: false,
            role: 'Content Writer',
            analyzedAt: '14:35, 06/10/2023',
            score: 49,
            keywords: ['Content SEO', 'Social Media'],
            status: ANALYSIS_STATUS.FAILED,
        },
        {
            id: 12,
            fileName: 'Mobile_Flutter_Developer.pdf',
            isBest: false,
            role: 'Flutter Developer',
            analyzedAt: '11:25, 05/10/2023',
            score: 74,
            keywords: ['Flutter', 'Dart', 'Firebase'],
            status: ANALYSIS_STATUS.SUCCESS,
        },
    ],
};

const PAGE_SIZE = 10;

function StatsCard({ icon, label, value, variant }) {
    return (
        <div className={cx('statsCard')}>
            <div className={cx('statsIcon', variant)}>{icon}</div>
            <div className={cx('statsContent')}>
                <p className={cx('statsLabel')}>{label}</p>
                <h3 className={cx('statsValue')}>{value}</h3>
            </div>
        </div>
    );
}

function CvAnalysisHistory() {
    const [analysisList, setAnalysisList] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const fetchAnalysisHistory = async () => {
            try {
                // const result = await getAnalysisHistory();
                const result = HISTORY_DATA;

                if (!result?.success) {
                    throw new Error(result?.message || 'Không thể tải lịch sử phân tích CV');
                }

                setAnalysisList(result?.data || []);
            } catch (error) {
                console.error('Lỗi lấy lịch sử phân tích CV:', error);
            } finally {
                // setLoading(false);
            }
        };

        fetchAnalysisHistory();
    }, []);

    const filteredAnalysisList = useMemo(() => {
        const keyword = searchValue.trim().toLowerCase();

        if (!keyword) return analysisList;

        return analysisList.filter(
            (item) =>
                item.fileName?.toLowerCase().includes(keyword) ||
                item.role?.toLowerCase().includes(keyword) ||
                item.keywords?.some((tag) => tag.toLowerCase().includes(keyword)),
        );
    }, [analysisList, searchValue]);

    const totalPages = Math.max(1, Math.ceil(filteredAnalysisList.length / PAGE_SIZE));

    const pagedList = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return filteredAnalysisList.slice(start, start + PAGE_SIZE);
    }, [filteredAnalysisList, currentPage]);

    const statsData = useMemo(() => {
        const total = analysisList.length;
        const successList = analysisList.filter(
            (item) => item.status === ANALYSIS_STATUS.SUCCESS,
        );

        const highestScore = successList.length
            ? Math.max(...successList.map((item) => item.score || 0))
            : 0;

        const avgScore = successList.length
            ? Math.round(
                successList.reduce((sum, item) => sum + (item.score || 0), 0) /
                successList.length,
            )
            : 0;

        return [
            {
                id: 1,
                label: 'Tổng số lần phân tích',
                value: String(total),
                icon: <MdOutlineGridView />,
                variant: 'purple',
            },
            {
                id: 2,
                label: 'Điểm cao nhất',
                value: `${highestScore}%`,
                icon: <HiOutlineSparkles />,
                variant: 'orange',
            },
            {
                id: 3,
                label: 'Điểm trung bình',
                value: `${avgScore}%`,
                icon: <FiTrendingUp />,
                variant: 'green',
            },
        ];
    }, [analysisList]);

    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
        setCurrentPage(1);
    };

    const handleResetFilter = () => {
        setSearchValue('');
        setCurrentPage(1);
    };

    const handleExportHistory = () => {
        // Chưa có backend export
        console.log('Export analysis history - mock mode');
    };

    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    const startItem =
        filteredAnalysisList.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(currentPage * PAGE_SIZE, filteredAnalysisList.length);

    return (
        <div className={cx('wrapper')}>
            <div className={cx('topSection')}>
                <div>
                    <h1 className={cx('pageTitle')}>Lịch sử phân tích CV</h1>
                    <p className={cx('pageDesc')}>
                        Xem lại các lần AI đã đánh giá CV và theo dõi mức cải thiện theo
                        thời gian.
                    </p>
                </div>

                <div className={cx('topActions')}>
                    <button
                        type="button"
                        className={cx('secondaryBtn')}
                        onClick={handleExportHistory}
                    >
                        <FiDownload />
                        Xuất lịch sử
                    </button>

                    <Button
                        primary
                        to={config.router.cvAnalysisNew}
                        type="button"
                        className={cx('primaryBtn')}
                    >
                        <IoRocketOutline />
                        Phân tích CV mới
                    </Button>
                </div>
            </div>

            <div className={cx('statsGrid')}>
                {statsData.map((item) => (
                    <StatsCard key={item.id} {...item} />
                ))}
            </div>

            <div className={cx('filterCard')}>
                <div className={cx('filterTop')}>
                    <div className={cx('searchBox')}>
                        <FiSearch className={cx('searchIcon')} />
                        <input
                            type="text"
                            placeholder="Tìm tên CV, vị trí, từ khóa..."
                            className={cx('searchInput')}
                            value={searchValue}
                            onChange={handleSearchChange}
                        />
                    </div>

                    <button type="button" className={cx('filterChip')}>
                        Khoảng thời gian
                    </button>

                    <button type="button" className={cx('filterChip')}>
                        Điểm phù hợp
                    </button>
                </div>

                <div className={cx('filterBottom')}>
                    <button type="button" className={cx('iconFilterBtn')}>
                        <FiFilter />
                    </button>
                    <button
                        type="button"
                        className={cx('resetBtn')}
                        onClick={handleResetFilter}
                    >
                        Reset
                    </button>
                </div>
            </div>

            <div className={cx('tableCard')}>
                <div className={cx('tableHeader')}>
                    <div className={cx('th', 'fileCell')}>TÊN CV</div>
                    <div className={cx('th', 'roleCell')}>VỊ TRÍ ỨNG TUYỂN</div>
                    <div className={cx('th', 'dateCell')}>NGÀY PHÂN TÍCH</div>
                    <div className={cx('th', 'scoreCell')}>ĐIỂM MATCHING</div>
                    <div className={cx('th', 'keywordCell')}>TỪ KHÓA ĐẠT</div>
                    <div className={cx('th', 'statusCell')}>TRẠNG THÁI</div>
                </div>

                <div className={cx('tableBody')}>
                    {pagedList.length === 0 ? (
                        <div className={cx('emptyState')}>
                            Không có lịch sử phân tích CV phù hợp.
                        </div>
                    ) : (
                        pagedList.map((item) => (
                            <AnalysisHistoryRow
                                key={item.id}
                                item={item}
                                analysisStatus={ANALYSIS_STATUS}
                            />
                        ))
                    )}
                </div>

                <div className={cx('tableFooter')}>
                    <p className={cx('resultText')}>
                        Hiển thị {startItem}–{endItem} của {filteredAnalysisList.length}{' '}
                        kết quả
                    </p>

                    <div className={cx('pagination')}>
                        <button
                            type="button"
                            className={cx('pageNav')}
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        >
                            <FiChevronLeft />
                        </button>

                        {pageNumbers.map((page) => (
                            <button
                                key={page}
                                type="button"
                                className={cx('pageBtn', {
                                    active: currentPage === page,
                                })}
                                onClick={() => setCurrentPage(page)}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            type="button"
                            className={cx('pageNav')}
                            disabled={currentPage === totalPages}
                            onClick={() =>
                                setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CvAnalysisHistory;