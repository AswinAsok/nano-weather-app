import type { WeatherData } from "../types/weather";

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface CitySuggestion {
    name: string;
    country: string;
    state?: string;
    lat: number;
    lon: number;
}

export interface GeneratedImage {
    imageUrl: string;
    prompt: string;
}

export interface WeatherService {
    fetchByCity(city: string): Promise<WeatherData>;
    fetchByCoords(lat: number, lon: number): Promise<WeatherData>;
    fetchCitySuggestions(query: string): Promise<CitySuggestion[]>;
}

export interface ImageService {
    generateCityImage(weather: WeatherData): Promise<GeneratedImage>;
}

export interface GithubRepoService {
    fetchRepoStars(): Promise<number>;
}

export interface GeolocationService {
    getCurrentPosition(options?: PositionOptions): Promise<Coordinates>;
}

export interface SupabaseService {
    saveWeatherSearch(
        weather: WeatherData,
        imageDataUrl: string | null,
        prompt: string,
        searchLocation: string
    ): Promise<void>;
    getRecentSearches(limit?: number): Promise<Array<{
        id?: string;
        city: string;
        country: string;
        temperature: number;
        condition: string;
        image_data?: string | null;
        prompt?: string | null;
        search_location?: string | null;
        searched_at?: string;
    }>>;
    getFavoriteCity(): Promise<string | null>;
    setFavoriteCity(city: string): Promise<void>;
}

export interface ServiceContainer {
    weatherService: WeatherService;
    githubRepoService: GithubRepoService;
    imageService: ImageService;
    geolocationService: GeolocationService;
    supabaseService: SupabaseService;
}
