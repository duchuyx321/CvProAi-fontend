export function toSafeString(value = '') {
    return String(value ?? '').trim();
}

export function toSafeNumber(value = 0) {
    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function formatCurrency(value = 0) {
    return `${new Intl.NumberFormat('vi-VN').format(toSafeNumber(value))}đ`;
}

export function formatDuration(unit, value) {
    if (unit === 'permanent') {
        return 'Vĩnh viễn';
    }

    if (unit === 'year') {
        return `${toSafeNumber(value) || 1} năm`;
    }

    return `${toSafeNumber(value) || 1} tháng`;
}