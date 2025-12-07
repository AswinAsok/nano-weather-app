import { useEffect, useRef } from 'react';
import type { WeatherData } from '../types/weather';
import type { SupabaseService } from '../services/contracts';

/**
 * Hook to automatically sync weather data to Supabase
 */
export function useSupabaseSync(
    weatherData: WeatherData | null,
    imageDataUrl: string | null,
    prompt: string | null,
    searchLocation: string | null,
    supabaseService: SupabaseService
) {
    const lastSavedSignature = useRef<string | null>(null);

    useEffect(() => {
        if (!weatherData || !imageDataUrl || !prompt) {
            return;
        }

        const resolvedSearchLocation = searchLocation ?? `${weatherData.city}, ${weatherData.country}`;
        const signature = `${weatherData.city}-${weatherData.timestamp}-${imageDataUrl.slice(0, 48)}`;
        if (lastSavedSignature.current === signature) {
            return;
        }

        lastSavedSignature.current = signature;

        supabaseService
            .saveWeatherSearch(weatherData, imageDataUrl, prompt, resolvedSearchLocation)
            .catch((err) => {
                console.error('Failed to sync weather data to Supabase:', err);
            });
    }, [imageDataUrl, prompt, searchLocation, supabaseService, weatherData]);
}
