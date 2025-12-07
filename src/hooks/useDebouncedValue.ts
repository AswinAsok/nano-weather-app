import { useEffect, useState } from "react";

export function useDebouncedValue<T>(value: T, delayMs: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handle = setTimeout(() => setDebouncedValue(value), delayMs);
        return () => clearTimeout(handle);
    }, [value, delayMs]);

    return debouncedValue;
}
