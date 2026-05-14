import { useCallback, useMemo, useState } from 'react';
import { INITIAL_FILTERS, PAGE_SIZE } from '../constants';
import { filterPackages } from '../utils/packageFilter';
import useDebounce from './useDebounce';

export function usePackageFilters(packageList = []) {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchValue, setSearchValue] = useState('');
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const debouncedKeyword = useDebounce(searchValue, 350);

    const filteredPackages = useMemo(
        () => filterPackages(packageList, filters, debouncedKeyword),
        [packageList, filters, debouncedKeyword]
    );

    const totalPages = Math.max(
        1,
        Math.ceil(filteredPackages.length / PAGE_SIZE)
    );
    const currentPageForView = Math.min(currentPage, totalPages);

    const paginatedPackages = useMemo(() => {
        const startIndex = (currentPageForView - 1) * PAGE_SIZE;

        return filteredPackages.slice(startIndex, startIndex + PAGE_SIZE);
    }, [currentPageForView, filteredPackages]);

    const handleChangePage = useCallback((page) => {
        setCurrentPage(Math.min(Math.max(1, page), totalPages));
    }, [totalPages]);

    const handleChangeFilter = useCallback((field, value) => {
        setFilters((previousState) => ({
            ...previousState,
            [field]: value,
        }));
        setCurrentPage(1);
    }, []);

    const handleChangeDateFilter = useCallback((nextDateFilter) => {
        setFilters((previousState) => ({
            ...previousState,
            ...nextDateFilter,
        }));
        setCurrentPage(1);
    }, []);

    const handleChangeSearch = useCallback((value) => {
        setSearchValue(value);
        setCurrentPage(1);
    }, []);

    return {
        filters,
        searchValue,
        currentPage: currentPageForView,
        totalPages,
        filteredPackages,
        paginatedPackages,
        setCurrentPage: handleChangePage,
        handleChangeFilter,
        handleChangeDateFilter,
        handleChangeSearch,
    };
}
