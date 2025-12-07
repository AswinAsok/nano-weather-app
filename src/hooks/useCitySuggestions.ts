import { useEffect, useState } from "react";
import type { CitySuggestion, WeatherService } from "../services/contracts";
import { useDebouncedValue } from "./useDebouncedValue";

export function useCitySuggestions(query: string, weatherService: WeatherService) {
    const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const debouncedQuery = useDebouncedValue(query.trim(), 250);

    useEffect(() => {
        if (debouncedQuery.length < 2) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        let isActive = true;
        setLoading(true);

        const fetchSuggestions = async () => {
            try {
                const results = await weatherService.fetchCitySuggestions(debouncedQuery);
                if (isActive) setSuggestions(results);
            } catch {
                if (isActive) setSuggestions([]);
            } finally {
                if (isActive) setLoading(false);
            }
        };

        fetchSuggestions();

        return () => {
            isActive = false;
        };
    }, [debouncedQuery, weatherService]);

    return { suggestions, loading };
}
