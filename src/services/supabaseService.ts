import { supabase } from '../lib/supabaseClient';
import type { WeatherData } from '../types/weather';

export interface WeatherSearchHistory {
    id?: string;
    city: string;
    country: string;
    temperature: number;
    condition: string;
    image_data?: string | null;
    prompt?: string | null;
    search_location?: string | null;
    searched_at?: string;
}

export interface SupabaseService {
    saveWeatherSearch(
        weather: WeatherData,
        imageDataUrl: string | null,
        prompt: string,
        searchLocation: string
    ): Promise<void>;
    getRecentSearches(limit?: number): Promise<WeatherSearchHistory[]>;
    getFavoriteCity(): Promise<string | null>;
    setFavoriteCity(city: string): Promise<void>;
}

class SupabaseServiceImpl implements SupabaseService {
    async saveWeatherSearch(
        weather: WeatherData,
        imageDataUrl: string | null,
        prompt: string,
        searchLocation: string
    ): Promise<void> {
        if (!supabase) {
            console.warn('Supabase not configured');
            return;
        }

        try {
            const { error } = await supabase
                .from('weather_searches')
                .insert({
                    city: weather.city,
                    country: weather.country,
                    temperature: weather.temperature,
                    condition: weather.description,
                    image_data: imageDataUrl ?? null,
                    prompt,
                    search_location: searchLocation,
                });

            if (error) {
                console.error('Error saving weather search:', error);
            }
        } catch (err) {
            console.error('Failed to save weather search:', err);
        }
    }

    async getRecentSearches(limit: number = 15): Promise<WeatherSearchHistory[]> {
        if (!supabase) {
            return [];
        }

        try {
            const { data, error } = await supabase
                .from('weather_searches')
                .select('*')
                .not('image_data', 'is', null)
                .order('searched_at', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Error fetching recent searches:', error);
                return [];
            }

            return data || [];
        } catch (err) {
            console.error('Failed to fetch recent searches:', err);
            return [];
        }
    }

    async getFavoriteCity(): Promise<string | null> {
        if (!supabase) {
            return null;
        }

        try {
            const { data, error } = await supabase
                .from('user_preferences')
                .select('favorite_city')
                .maybeSingle();

            if (error) {
                return null;
            }

            return data?.favorite_city || null;
        } catch (err) {
            return null;
        }
    }

    async setFavoriteCity(city: string): Promise<void> {
        if (!supabase) {
            return;
        }

        try {
            const { error } = await supabase
                .from('user_preferences')
                .upsert({ favorite_city: city });

            if (error) {
                console.error('Error setting favorite city:', error);
            }
        } catch (err) {
            console.error('Failed to set favorite city:', err);
        }
    }
}

export const supabaseService = new SupabaseServiceImpl();
