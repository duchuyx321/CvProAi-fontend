export function isObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value);
  }
  
  export function deepMerge(base, override) {
    if (Array.isArray(override)) return override;
    if (!isObject(base) || !isObject(override)) return override ?? base;
  
    const result = { ...base };
  
    Object.keys(override).forEach((key) => {
      const baseValue = base?.[key];
      const overrideValue = override?.[key];
  
      if (Array.isArray(overrideValue)) {
        result[key] = overrideValue;
        return;
      }
  
      if (isObject(baseValue) && isObject(overrideValue)) {
        result[key] = deepMerge(baseValue, overrideValue);
        return;
      }
  
      result[key] = overrideValue;
    });
  
    return result;
  }