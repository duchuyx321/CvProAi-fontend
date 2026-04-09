export function isObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
}

export function isEmptyValue(value) {
    return (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '')
    );
}

export function deepMerge(base, override) {
    if (Array.isArray(override)) {
        return override.length > 0 ? override : Array.isArray(base) ? base : [];
    }

    if (!isObject(base) || !isObject(override)) {
        return isEmptyValue(override) ? base : override;
    }

    const result = { ...base };

    const keys = new Set([
        ...Object.keys(base || {}),
        ...Object.keys(override || {}),
    ]);

    keys.forEach((key) => {
        const baseValue = base?.[key];
        const overrideValue = override?.[key];

        if (Array.isArray(overrideValue)) {
            result[key] = overrideValue.length > 0 ? overrideValue : baseValue;
            return;
        }

        if (isObject(baseValue) && isObject(overrideValue)) {
            result[key] = deepMerge(baseValue, overrideValue);
            return;
        }

        result[key] = isEmptyValue(overrideValue) ? baseValue : overrideValue;
    });

    return result;
}
