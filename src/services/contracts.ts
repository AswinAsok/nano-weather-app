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

export interface WeatherService {
    fetchByCity(city: string): Promise<WeatherData>;
    fetchByCoords(lat: number, lon: number): Promise<WeatherData>;
    fetchCitySuggestions(query: string): Promise<CitySuggestion[]>;
}

export interface ImageService {
    generateCityImage(weather: WeatherData): Promise<string>;
}

export interface GithubRepoService {
    fetchRepoStars(): Promise<number>;
}

export interface GeolocationService {
    getCurrentPosition(options?: PositionOptions): Promise<Coordinates>;
}

export interface ServiceContainer {
    weatherService: WeatherService;
    githubRepoService: GithubRepoService;
    imageService: ImageService;
    geolocationService: GeolocationService;
}
