import { useEffect, useState } from 'react';

function useDebounce(value, delay = 350) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timerId = window.setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => window.clearTimeout(timerId);
    }, [value, delay]);

    return debouncedValue;
}

export default useDebounce;