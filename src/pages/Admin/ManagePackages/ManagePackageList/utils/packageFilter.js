import { toSafeString } from './packageFormatters';

export function startOfDay(value) {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
}

export function endOfDay(value) {
    const date = new Date(value);
    date.setHours(23, 59, 59, 999);
    return date;
}

export function matchesCreatedFilter(sourceDate, filters) {
    const { createdPreset, createdFrom, createdTo } = filters;

    if (
        createdPreset === 'all' &&
        !toSafeString(createdFrom) &&
        !toSafeString(createdTo)
    ) {
        return true;
    }

    if (!sourceDate) {
        return false;
    }

    const createdDate = new Date(sourceDate);

    if (Number.isNaN(createdDate.getTime())) {
        return false;
    }

    const now = new Date();

    if (createdPreset === '7days') {
        const from = startOfDay(now);
        from.setDate(from.getDate() - 6);
        return createdDate >= from && createdDate <= endOfDay(now);
    }

    if (createdPreset === '30days') {
        const from = startOfDay(now);
        from.setDate(from.getDate() - 29);
        return createdDate >= from && createdDate <= endOfDay(now);
    }

    if (createdPreset === 'custom') {
        const from = createdFrom ? startOfDay(createdFrom) : null;
        const to = createdTo ? endOfDay(createdTo) : null;

        if (from && to && from > to) {
            return false;
        }

        if (from && createdDate < from) {
            return false;
        }

        if (to && createdDate > to) {
            return false;
        }

        return true;
    }

    return true;
}

export function filterPackages(packageList = [], filters, keyword = '') {
    const normalizedKeyword = toSafeString(keyword).toLowerCase();

    return packageList.filter((item) => {
        const matchStatus =
            filters.status === 'ALL' || item.status === filters.status;

        const matchKeyword =
            !normalizedKeyword ||
            item.code.toLowerCase().includes(normalizedKeyword) ||
            item.name.toLowerCase().includes(normalizedKeyword);

        const matchDate = matchesCreatedFilter(item.createdAt, filters);

        return matchStatus && matchKeyword && matchDate;
    });
}