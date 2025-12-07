import { useCallback, useState } from "react";
import type { WeatherData } from "../types/weather";
import { roastService, type WeatherRoast } from "../services/roastService";

export function useWeatherRoast() {
    const [roast, setRoast] = useState<WeatherRoast | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateRoast = useCallback(async (weather: WeatherData) => {
        setLoading(true);
        setError(null);

        try {
            const result = await roastService.generateRoast(weather);
            setRoast(result);
            return result;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to generate roast";
            setError(message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const clearRoast = useCallback(() => {
        setRoast(null);
        setError(null);
    }, []);

    return {
        roast,
        loading,
        error,
        generateRoast,
        clearRoast,
    };
}
