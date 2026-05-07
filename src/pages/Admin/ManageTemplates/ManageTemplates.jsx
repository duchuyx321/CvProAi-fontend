// src/pages/Admin/ManageTemplates/ManageTemplates.jsx

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import { FiPlus } from 'react-icons/fi';

import Button from '~/components/Button';
import { config } from '~/config';
import {
    getCvTemplates,
    updateCvTemplate,
} from '~/services/cv-teamplate.service';

import DeleteTemplateModal from './components/DeleteTemplateModal';
import TemplateStatsCards from './components/TemplateStatsCards';
import TemplateTable from './components/TemplateTable';
import TemplateToolbar from './components/TemplateToolbar';

import {
    DEFAULT_TEMPLATE_FILTERS,
    MOCK_ADMIN_TEMPLATES,
    MOCK_TEMPLATE_STATS,
    MOCK_TEMPLATE_TOTAL,
    TEMPLATE_PAGE_SIZE,
} from './constants';
import {
    buildTemplateStats,
    filterTemplates,
    getTemplateListFromResponse,
    getTemplateRecordId,
} from './utils';

import styles from './ManageTemplates.module.scss';

const cx = classNames.bind(styles);

function ManageTemplates() {
    const navigate = useNavigate();

    const [templates, setTemplates] = useState(MOCK_ADMIN_TEMPLATES);
    const [displayTotal, setDisplayTotal] = useState(MOCK_TEMPLATE_TOTAL);
    const [usingMockData, setUsingMockData] = useState(true);

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [searchValue, setSearchValue] = useState(
        DEFAULT_TEMPLATE_FILTERS.searchValue,
    );
    const [typeFilter, setTypeFilter] = useState(
        DEFAULT_TEMPLATE_FILTERS.typeFilter,
    );
    const [sortValue, setSortValue] = useState(
        DEFAULT_TEMPLATE_FILTERS.sortValue,
    );
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true);

            const result = await getCvTemplates(100, 1);

            if (result?.success === false) {
                setUsingMockData(true);
                setTemplates(MOCK_ADMIN_TEMPLATES);
                setDisplayTotal(MOCK_TEMPLATE_TOTAL);
                toast.warning(
                    result?.message || 'Không thể tải dữ liệu mẫu CV',
                );
                return;
            }

            const list = getTemplateListFromResponse(result);

            if (list.length > 0) {
                setUsingMockData(false);
                setTemplates(list);
                setDisplayTotal(
                    result?.data?.total ||
                        result?.data?.totalItems ||
                        result?.total ||
                        list.length,
                );
            } else {
                setUsingMockData(true);
                setTemplates(MOCK_ADMIN_TEMPLATES);
                setDisplayTotal(MOCK_TEMPLATE_TOTAL);
            }
        } catch (error) {
            console.error(error);
            setUsingMockData(true);
            setTemplates(MOCK_ADMIN_TEMPLATES);
            setDisplayTotal(MOCK_TEMPLATE_TOTAL);
            toast.error('Không thể tải dữ liệu mẫu CV');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchValue, typeFilter, sortValue]);

    const filteredTemplates = useMemo(() => {
        return filterTemplates({
            templates,
            searchValue,
            typeFilter,
            sortValue,
        });
    }, [templates, searchValue, typeFilter, sortValue]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredTemplates.length / TEMPLATE_PAGE_SIZE),
    );

    useEffect(() => {
        setCurrentPage((page) => Math.min(page, totalPages));
    }, [totalPages]);

    const paginatedTemplates = useMemo(() => {
        const start = (currentPage - 1) * TEMPLATE_PAGE_SIZE;
        const end = start + TEMPLATE_PAGE_SIZE;
        return filteredTemplates.slice(start, end);
    }, [filteredTemplates, currentPage]);

    const stats = useMemo(() => {
        if (usingMockData) return MOCK_TEMPLATE_STATS;
        return buildTemplateStats(templates);
    }, [templates, usingMockData]);

    const tableDisplayTotal =
        usingMockData && searchValue.trim() === '' && typeFilter === 'all'
            ? displayTotal
            : filteredTemplates.length;

    const hasActiveFilters =
        searchValue !== DEFAULT_TEMPLATE_FILTERS.searchValue ||
        typeFilter !== DEFAULT_TEMPLATE_FILTERS.typeFilter ||
        sortValue !== DEFAULT_TEMPLATE_FILTERS.sortValue;

    const handleResetFilters = () => {
        setSearchValue(DEFAULT_TEMPLATE_FILTERS.searchValue);
        setTypeFilter(DEFAULT_TEMPLATE_FILTERS.typeFilter);
        setSortValue(DEFAULT_TEMPLATE_FILTERS.sortValue);
    };

    const getTemplateNavigationId = (template) => {
        return (
            getTemplateRecordId(template) ||
            template?.id ||
            template?._id ||
            template?.code ||
            null
        );
    };

    const handleOpenCreate = () => {
        navigate(config.router.createTemplate);
    };

    const handleOpenEdit = (template) => {
        const templateId = getTemplateNavigationId(template);

        if (!templateId) {
            toast.warning('Không tìm thấy ID mẫu CV cần chỉnh sửa');
            return;
        }

        navigate(`/admin/templates/${encodeURIComponent(templateId)}/edit`, {
            state: { template },
        });
    };

    const handleOpenPreview = (template) => {
        const templateId = getTemplateNavigationId(template);

        if (!templateId) {
            toast.warning('Không tìm thấy ID mẫu CV để xem trước');
            return;
        }

        navigate(
            `/admin/templates/${encodeURIComponent(templateId)}/preview`,
            { state: { template } },
        );
    };

    const handleOpenDelete = (template) => {
        setDeleteTarget(template);
    };

    const handleCloseDelete = () => {
        if (submitting) return;
        setDeleteTarget(null);
    };

    const handleDeleteTemplate = async () => {
        if (!deleteTarget || submitting) return;

        const templateId = getTemplateRecordId(deleteTarget);
        if (!templateId) {
            toast.warning('Không tìm thấy ID mẫu CV cần xóa');
            return;
        }

        try {
            setSubmitting(true);

            if (usingMockData) {
                setTemplates((prev) =>
                    prev.filter(
                        (item) =>
                            getTemplateRecordId(item) !==
                            getTemplateRecordId(deleteTarget),
                    ),
                );
                setDisplayTotal((prev) => Math.max(0, prev - 1));
                setDeleteTarget(null);
                toast.success('Xóa mẫu CV thành công');
                return;
            }

            const result = await updateCvTemplate(templateId, {
                is_active: false,
                is_deleted: true,
            });

            if (result?.success === false) {
                toast.error(result?.message || 'Xóa mẫu CV thất bại');
                return;
            }

            toast.success('Xóa mẫu CV thành công');
            setDeleteTarget(null);
            fetchTemplates();
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi xóa mẫu CV');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className={cx('wrapper')}>
            <div className={cx('pageHeader')}>
                <div>
                    <h1 className={cx('title')}>Quản lý mẫu CV</h1>
                    <p className={cx('description')}>
                        Quản lý, kiểm tra và cập nhật danh sách mẫu CV cho hệ
                        thống AI.
                    </p>
                </div>

                <Button
                    primary
                    type="button"
                    leftIcon={<FiPlus />}
                    className={cx('createButton')}
                    onClick={handleOpenCreate}
                >
                    Thêm mẫu CV
                </Button>
            </div>

            <TemplateToolbar
                searchValue={searchValue}
                typeFilter={typeFilter}
                sortValue={sortValue}
                loading={loading}
                hasActiveFilters={hasActiveFilters}
                onSearchChange={setSearchValue}
                onTypeFilterChange={setTypeFilter}
                onSortChange={setSortValue}
                onRefresh={fetchTemplates}
                onResetFilters={handleResetFilters}
            />

            <TemplateTable
                templates={paginatedTemplates}
                loading={loading}
                total={filteredTemplates.length}
                displayTotal={tableDisplayTotal}
                page={currentPage}
                pageSize={TEMPLATE_PAGE_SIZE}
                onPageChange={setCurrentPage}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onPreview={handleOpenPreview}
            />

            <TemplateStatsCards stats={stats} />

            <DeleteTemplateModal
                template={deleteTarget}
                submitting={submitting}
                onClose={handleCloseDelete}
                onConfirm={handleDeleteTemplate}
            />
        </section>
    );
}

export default ManageTemplates;
