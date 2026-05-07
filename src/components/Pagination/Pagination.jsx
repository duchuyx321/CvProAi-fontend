import { useMemo } from 'react';
import classNames from 'classnames/bind';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import styles from './Pagination.module.scss';

const cx = classNames.bind(styles);

function buildVisiblePages(currentPage, totalPages) {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) return [1, 2, 3, 'end-ellipsis', totalPages];

    if (currentPage >= totalPages - 2) {
        return [
            1,
            'start-ellipsis',
            totalPages - 2,
            totalPages - 1,
            totalPages,
        ];
    }

    return [1, 'start-ellipsis', currentPage, 'end-ellipsis', totalPages];
}

function Pagination({
    currentPage = 1,
    totalPages = 1,
    onPageChange,
    disabled = false,
    className,
}) {
    const safeTotalPages = Math.max(Number(totalPages) || 1, 1);
    const safeCurrentPage = Math.min(
        Math.max(Number(currentPage) || 1, 1),
        safeTotalPages,
    );

    const visiblePages = useMemo(
        () => buildVisiblePages(safeCurrentPage, safeTotalPages),
        [safeCurrentPage, safeTotalPages],
    );

    const handlePageChange = (nextPage) => {
        if (
            disabled ||
            nextPage < 1 ||
            nextPage > safeTotalPages ||
            nextPage === safeCurrentPage
        ) {
            return;
        }

        onPageChange?.(nextPage);
    };

    return (
        <nav className={cx('wrapper', className)} aria-label="Phân trang">
            <button
                type="button"
                className={cx('pageButton')}
                disabled={disabled || safeCurrentPage <= 1}
                onClick={() => handlePageChange(safeCurrentPage - 1)}
                aria-label="Trang trước"
            >
                <ChevronLeft />
            </button>

            {visiblePages.map((item) =>
                typeof item === 'number' ? (
                    <button
                        type="button"
                        key={item}
                        className={cx('pageButton', {
                            current: item === safeCurrentPage,
                        })}
                        disabled={disabled}
                        onClick={() => handlePageChange(item)}
                        aria-current={
                            item === safeCurrentPage ? 'page' : undefined
                        }
                    >
                        {item}
                    </button>
                ) : (
                    <span key={item} className={cx('ellipsis')}>
                        ...
                    </span>
                ),
            )}

            <button
                type="button"
                className={cx('pageButton')}
                disabled={disabled || safeCurrentPage >= safeTotalPages}
                onClick={() => handlePageChange(safeCurrentPage + 1)}
                aria-label="Trang sau"
            >
                <ChevronRight />
            </button>
        </nav>
    );
}

export default Pagination;
