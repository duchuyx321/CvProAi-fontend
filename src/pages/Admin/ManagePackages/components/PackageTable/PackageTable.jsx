import classNames from 'classnames/bind';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';
import styles from './PackageTable.module.scss';

const cx = classNames.bind(styles);

function getVisiblePages(currentPage, totalPages) {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, 'ellipsis-right', totalPages];
    }

    if (currentPage >= totalPages - 2) {
        return [1, 'ellipsis-left', totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, 'ellipsis-left', currentPage, 'ellipsis-right', totalPages];
}

function TablePagination({
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onChangePage,
}) {
    const safeTotalPages = Math.max(1, totalPages);
    const safeCurrentPage = Math.min(currentPage, safeTotalPages);
    const startItem = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
    const endItem = Math.min(safeCurrentPage * pageSize, totalItems);
    const pages = getVisiblePages(safeCurrentPage, safeTotalPages);

    return (
        <div className={cx('paginationWrapper')}>
            <p className={cx('summary')}>
                Hiển thị {startItem} - {endItem} trong {totalItems} gói dịch vụ
            </p>

            <div className={cx('pagination')}>
                <button
                    type="button"
                    className={cx('pageBtn')}
                    disabled={safeCurrentPage <= 1}
                    onClick={() => onChangePage(safeCurrentPage - 1)}
                    aria-label="Trang trước"
                >
                    <MdChevronLeft />
                </button>

                {pages.map((page, index) => {
                    if (typeof page !== 'number') {
                        return (
                            <span
                                key={`${page}-${index}`}
                                className={cx('ellipsis')}
                            >
                                ...
                            </span>
                        );
                    }

                    return (
                        <button
                            key={page}
                            type="button"
                            className={cx('pageBtn', {
                                active: page === safeCurrentPage,
                            })}
                            onClick={() => onChangePage(page)}
                            aria-label={`Chuyển tới trang ${page}`}
                            aria-current={page === safeCurrentPage ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    );
                })}

                <button
                    type="button"
                    className={cx('pageBtn')}
                    disabled={safeCurrentPage >= safeTotalPages}
                    onClick={() => onChangePage(safeCurrentPage + 1)}
                    aria-label="Trang sau"
                >
                    <MdChevronRight />
                </button>
            </div>
        </div>
    );
}

function PackageTable({
    loading,
    packages,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onChangePage,
    formatCurrency,
    formatDuration,
    renderActions,
}) {
    return (
        <div className={cx('tableShell')}>
            <div className={cx('wrapper')}>
                <table className={cx('table')}>
                    <thead>
    <tr>
        <th>ID</th>
        <th>TÊN GÓI</th>
        <th>GIÁ (VND)</th>
        <th>THỜI HẠN</th>
        <th>QUYỀN LỢI</th>
        <th>NGƯỜI DÙNG</th>
        <th>TRẠNG THÁI</th>
        <th>HÀNH ĐỘNG</th>
    </tr>
</thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={8} className={cx('placeholder')}>
                                    Đang tải danh sách gói dịch vụ...
                                </td>
                            </tr>
                        ) : packages.length === 0 ? (
                            <tr>
                                <td colSpan={8} className={cx('placeholder')}>
                                    Không có dữ liệu phù hợp.
                                </td>
                            </tr>
                        ) : (
                            packages.map((item) => (
                                <tr key={item.id}>
                                    <td className={cx('code')}>
                                        <span className={cx('codeText')}>
                                            {item.code}
                                        </span>
                                    </td>

                                    <td className={cx('name')}>
                                        <span className={cx('nameText')}>
                                            {item.name}
                                        </span>
                                    </td>

                                    <td>{formatCurrency(item.price)}</td>

                                    <td className={cx('duration')}>
                                        <span className={cx('durationText')}>
                                            {formatDuration(
                                                item.durationUnit,
                                                item.durationValue
                                            )}
                                        </span>
                                    </td>

                                    <td>
                                        <div className={cx('chipList')}>
                                            {item.benefits.length > 0 ? (
                                                item.benefits.map((benefit) => (
                                                    <span
                                                        key={`${item.id}-${benefit}`}
                                                        className={cx('chip')}
                                                    >
                                                        {benefit}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className={cx('emptyValue')}>
                                                    -
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    <td>
                                        {item.totalUsers.toLocaleString('vi-VN')}
                                    </td>

                                    <td>
                                        <span
                                            className={cx(
                                                'status',
                                                item.status === 'ACTIVE'
                                                    ? 'statusActive'
                                                    : 'statusPaused'
                                            )}
                                        >
                                            {item.status === 'ACTIVE'
                                                ? 'Hoạt động'
                                                : 'Tạm ngưng'}
                                        </span>
                                    </td>

                                    <td>
                                        <div className={cx('actions')}>
                                            {renderActions(item)}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onChangePage={onChangePage}
            />
        </div>
    );
}

export default PackageTable;