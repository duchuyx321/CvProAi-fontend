// src/pages/Admin/ManageTemplates/components/TemplateToolbar/TemplateToolbar.jsx

import classNames from 'classnames/bind';
import { FiChevronDown, FiRefreshCw, FiRotateCcw, FiSearch } from 'react-icons/fi';

import {
    TEMPLATE_SORT_OPTIONS,
    TEMPLATE_TYPE_FILTERS,
} from '../../constants';

import styles from './TemplateToolbar.module.scss';

const cx = classNames.bind(styles);

function TemplateToolbar({
    searchValue,
    typeFilter,
    sortValue,
    loading = false,
    hasActiveFilters = false,
    onSearchChange,
    onTypeFilterChange,
    onSortChange,
    onRefresh,
    onResetFilters,
}) {
    return (
        <div className={cx('toolbar')}>
            <div className={cx('searchBox')}>
                <FiSearch className={cx('searchIcon')} />

                <input
                    value={searchValue}
                    onChange={(event) => onSearchChange?.(event.target.value)}
                    placeholder="Tìm kiếm theo tên, mã hoặc ID..."
                />
            </div>

            <div className={cx('filters')}>
                <div className={cx('selectWrap')}>
                    <select
                        className={cx('select')}
                        value={typeFilter}
                        onChange={(event) =>
                            onTypeFilterChange?.(event.target.value)
                        }
                    >
                        {TEMPLATE_TYPE_FILTERS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <FiChevronDown />
                </div>

                <div className={cx('selectWrap', 'sortWrap')}>
                    <select
                        className={cx('select')}
                        value={sortValue}
                        onChange={(event) =>
                            onSortChange?.(event.target.value)
                        }
                    >
                        {TEMPLATE_SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <FiChevronDown />
                </div>

                <button
                    type="button"
                    className={cx('iconButton')}
                    onClick={onRefresh}
                    disabled={loading}
                    title="Làm mới danh sách"
                >
                    <FiRefreshCw className={cx({ spinning: loading })} />
                </button>

                <button
                    type="button"
                    className={cx('iconButton')}
                    onClick={onResetFilters}
                    disabled={!hasActiveFilters}
                    title="Xóa bộ lọc"
                >
                    <FiRotateCcw />
                </button>
            </div>
        </div>
    );
}

export default TemplateToolbar;
