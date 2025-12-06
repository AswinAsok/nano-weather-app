import { useCallback, useState } from "react";
import type { WeatherService } from "../services/contracts";
import type { WeatherData } from "../types/weather";

export function useWeatherController(weatherService: WeatherService) {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const clearError = useCallback(() => setError(""), []);

    const setCustomError = useCallback((message: string) => {
        setError(message);
        setWeatherData(null);
    }, []);

    const searchByCity = useCallback(
        async (city: string): Promise<WeatherData | null> => {
            const trimmed = city.trim();
            if (!trimmed) return null;

            setLoading(true);
            setError("");

            try {
                const data = await weatherService.fetchByCity(trimmed);
                setWeatherData(data);
                return data;
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "City not found. Please try again.";
                setError(message);
                setWeatherData(null);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [weatherService]
    );

    const searchByCoords = useCallback(
        async (lat: number, lon: number): Promise<WeatherData | null> => {
            setLoading(true);
            setError("");

            try {
                const data = await weatherService.fetchByCoords(lat, lon);
                setWeatherData(data);
                return data;
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : "Unable to fetch weather for your location.";
                setError(message);
                setWeatherData(null);
                return null;
            } finally {
                setLoading(false);
            }
        },
        [weatherService]
    );

    return {
        weatherData,
        loading,
        error,
        searchByCity,
        searchByCoords,
        clearError,
        setCustomError,
    };
}
