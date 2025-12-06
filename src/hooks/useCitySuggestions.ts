import { useEffect, useState } from "react";
import type { CitySuggestion, WeatherService } from "../services/contracts";

export function useCitySuggestions(query: string, weatherService: WeatherService) {
    const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const trimmed = query.trim();
        if (trimmed.length < 2) {
            setSuggestions([]);
            return;
        }

        let isActive = true;
        setLoading(true);
        const timer = setTimeout(async () => {
            try {
                const results = await weatherService.fetchCitySuggestions(trimmed);
                if (isActive) setSuggestions(results);
            } catch {
                if (isActive) setSuggestions([]);
            } finally {
                if (isActive) setLoading(false);
            }
        }, 250);

        return () => {
            isActive = false;
            clearTimeout(timer);
        };
    }, [query, weatherService]);

    return { suggestions, loading };
}
