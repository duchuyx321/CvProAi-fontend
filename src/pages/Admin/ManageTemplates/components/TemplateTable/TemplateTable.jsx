// src/pages/Admin/ManageTemplates/components/TemplateTable/TemplateTable.jsx

import classNames from 'classnames/bind';
import {
    FiChevronLeft,
    FiChevronRight,
    FiEdit2,
    FiEye,
    FiTrash2,
} from 'react-icons/fi';

import {
    formatNumber,
    getTemplateCreatedDate,
    getTemplateIdLabel,
    getTemplateUsageCount,
} from '../../utils';

import styles from './TemplateTable.module.scss';

const cx = classNames.bind(styles);

const getVisiblePages = ({ page, totalPages, maxPageButtons }) => {
    const safeTotal = Math.max(1, totalPages);
    const size = Math.min(maxPageButtons, safeTotal);
    const half = Math.floor(size / 2);
    let start = Math.max(1, page - half);
    const endOverflow = start + size - 1 - safeTotal;

    if (endOverflow > 0) {
        start = Math.max(1, start - endOverflow);
    }

    return Array.from({ length: size }).map((_, index) => start + index);
};

function TemplateTable({
    templates = [],
    loading = false,
    total = 0,
    displayTotal = total,
    page = 1,
    pageSize = 5,
    maxPageButtons = 5,
    onPageChange,
    onEdit,
    onDelete,
    onPreview,
}) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize) || 1);
    const visiblePages = getVisiblePages({
        page,
        totalPages,
        maxPageButtons,
    });

    const startIndex = displayTotal > 0 ? (page - 1) * pageSize + 1 : 0;
    const endIndex =
        displayTotal > 0
            ? Math.min(
                  (page - 1) * pageSize + templates.length,
                  displayTotal,
              )
            : 0;

    const renderSkeleton = () => {
        return Array.from({ length: pageSize }).map((_, index) => (
            <tr key={index}>
                <td colSpan="6">
                    <div className={cx('skeletonRow')} />
                </td>
            </tr>
        ));
    };

    return (
        <div className={cx('tableCard')}>
            <div className={cx('tableScroll')}>
                <table className={cx('table')}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tên mẫu CV</th>
                            <th>Lượt dùng</th>
                            <th>Trạng thái</th>
                            <th>Ngày tạo</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            renderSkeleton()
                        ) : templates.length > 0 ? (
                            templates.map((template, index) => (
                                <tr
                                    key={
                                        template?.id ||
                                        template?._id ||
                                        template?.code ||
                                        index
                                    }
                                >
                                    <td className={cx('idCell')}>
                                        {getTemplateIdLabel(
                                            template,
                                            (page - 1) * pageSize + index,
                                        )}
                                    </td>

                                    <td>
                                        <div className={cx('templateInfo')}>
                                            {template?.preview_url ? (
                                                <img
                                                    src={template.preview_url}
                                                    alt={
                                                        template?.name ||
                                                        'CV Template'
                                                    }
                                                    className={cx('thumbnail')}
                                                />
                                            ) : (
                                                <div
                                                    className={cx(
                                                        'thumbnailMock',
                                                        template?.thumbnail_variant ||
                                                            'classic',
                                                    )}
                                                >
                                                    <span />
                                                </div>
                                            )}

                                            <div className={cx('templateText')}>
                                                <strong>
                                                    {template?.name ||
                                                        'Mẫu CV chưa đặt tên'}
                                                </strong>
                                                <p>
                                                    {template?.description ||
                                                        template?.category ||
                                                        template?.code ||
                                                        'Chưa có mô tả'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className={cx('usageCell')}>
                                        {formatNumber(
                                            getTemplateUsageCount(template),
                                        )}
                                    </td>

                                    <td>
                                        <span
                                            className={cx('statusBadge', {
                                                inactive:
                                                    template?.is_active ===
                                                    false,
                                            })}
                                        >
                                            {template?.is_active === false
                                                ? 'Tạm ngưng'
                                                : 'Hoạt động'}
                                        </span>
                                    </td>

                                    <td className={cx('dateCell')}>
                                        {getTemplateCreatedDate(template)}
                                    </td>

                                    <td>
                                        <div className={cx('actions')}>
                                            <button
                                                type="button"
                                                title="Xem trước"
                                                onClick={() =>
                                                    onPreview?.(template)
                                                }
                                            >
                                                <FiEye />
                                            </button>

                                            <button
                                                type="button"
                                                title="Chỉnh sửa"
                                                onClick={() =>
                                                    onEdit?.(template)
                                                }
                                            >
                                                <FiEdit2 />
                                            </button>

                                            <button
                                                type="button"
                                                title="Xóa"
                                                className={cx('danger')}
                                                onClick={() =>
                                                    onDelete?.(template)
                                                }
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className={cx('empty')}>
                                    Chưa có mẫu CV nào
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className={cx('pagination')}>
                <p>
                    Hiển thị {startIndex} - {endIndex} của{' '}
                    {formatNumber(displayTotal)} mẫu CV
                </p>

                <div className={cx('pageActions')}>
                    <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => onPageChange?.(page - 1)}
                    >
                        <FiChevronLeft />
                    </button>

                    {visiblePages.map((pageNumber) => (
                        <button
                            key={pageNumber}
                            type="button"
                            className={cx({
                                active: pageNumber === page,
                            })}
                            onClick={() => onPageChange?.(pageNumber)}
                        >
                            {pageNumber}
                        </button>
                    ))}

                    <button
                        type="button"
                        disabled={page >= totalPages}
                        onClick={() => onPageChange?.(page + 1)}
                    >
                        <FiChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default TemplateTable;
