import classNames from 'classnames/bind';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

import styles from '../UserTable.module.scss';

const cx = classNames.bind(styles);

function UserTablePagination({
    pagination,
    paginationItems,
    resultStart,
    resultEnd,
    onPageChange,
}) {
    return (
        <div className={cx('footer')}>
            <p className={cx('summary')}>
                Hiển thị {resultStart} đến {resultEnd} trong tổng số{' '}
                <strong>{pagination.totalItems}</strong> người dùng
            </p>

            <div className={cx('pagination')}>
                <button
                    type="button"
                    className={cx('pageButton', 'navButton')}
                    onClick={() =>
                        onPageChange(Math.max(pagination.currentPage - 1, 1))
                    }
                    disabled={pagination.currentPage === 1}
                    aria-label="Trang trước"
                >
                    <FiChevronLeft />
                </button>

                {paginationItems.map((item, index) =>
                    item === 'ellipsis' ? (
                        <span
                            key={`ellipsis-${index}`}
                            className={cx('ellipsis')}
                        >
                            ...
                        </span>
                    ) : (
                        <button
                            key={item}
                            type="button"
                            className={cx('pageButton', {
                                active: item === pagination.currentPage,
                            })}
                            onClick={() => onPageChange(item)}
                        >
                            {item}
                        </button>
                    ),
                )}

                <button
                    type="button"
                    className={cx('pageButton', 'navButton')}
                    onClick={() =>
                        onPageChange(
                            Math.min(
                                pagination.currentPage + 1,
                                pagination.totalPages,
                            ),
                        )
                    }
                    disabled={pagination.currentPage >= pagination.totalPages}
                    aria-label="Trang sau"
                >
                    <FiChevronRight />
                </button>
            </div>
        </div>
    );
}

export default UserTablePagination;
