import { useId } from 'react';
import classNames from 'classnames/bind';
import { FiSearch } from 'react-icons/fi';

import Input from '~/components/Input';

import styles from './DataToolbar.module.scss';

const cx = classNames.bind(styles);

function DataToolbar({
    className,
    title,
    description,
    actions,
    searchId,
    searchValue = '',
    searchPlaceholder = 'Tìm kiếm...',
    onSearchChange,
    searchIcon = <FiSearch />,
    children,
    onResetFilters,
    resetLabel = 'Xóa lọc',
}) {
    const generatedSearchId = useId();
    const resolvedSearchId = searchId || `toolbar-search-${generatedSearchId}`;
    const hasFilters = Boolean(children) || Boolean(onResetFilters);

    return (
        <>
            {title || description || actions ? (
                <div className={cx('header', className)}>
                    <div>
                        {title ? <h2 className={cx('title')}>{title}</h2> : null}
                        {description ? (
                            <p className={cx('description')}>{description}</p>
                        ) : null}
                    </div>

                    {actions ? <div className={cx('actions')}>{actions}</div> : null}
                </div>
            ) : null}

            <div className={cx('toolbar', className)}>
                {onSearchChange ? (
                    <div className={cx('searchBox')}>
                        <Input
                            id={resolvedSearchId}
                            value={searchValue}
                            onChange={onSearchChange}
                            placeholder={searchPlaceholder}
                            leftIcon={searchIcon}
                        />
                    </div>
                ) : null}

                {hasFilters ? (
                    <div className={cx('filters')}>
                        {children}

                        {onResetFilters ? (
                            <button
                                type="button"
                                className={cx('resetButton')}
                                onClick={onResetFilters}
                            >
                                {resetLabel}
                            </button>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </>
    );
}

export default DataToolbar;
