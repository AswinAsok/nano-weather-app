import type { WeatherData } from "../types/weather";
import type { CitySuggestion, WeatherService } from "./contracts";

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || "demo";
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";

type WeatherApiResponse = {
    name: string;
    sys: { country: string };
    main: { temp: number; feels_like: number; humidity: number; pressure: number };
    weather: { description: string; icon: string }[];
    wind: { speed: number };
    visibility: number;
    timezone: number;
};

type GeoApiResponse = {
    name: string;
    country: string;
    state?: string;
    lat: number;
    lon: number;
};

class OpenWeatherService implements WeatherService {
    constructor(private readonly apiKey: string, private readonly baseUrl: string) {}

    async fetchByCity(city: string): Promise<WeatherData> {
        const trimmed = city.trim();
        if (!trimmed) throw new Error("City is required");

        const data = await this.fetchWeather<WeatherApiResponse>(
            `${this.baseUrl}?q=${encodeURIComponent(trimmed)}&appid=${this.apiKey}&units=metric`,
            "City not found"
        );

        return this.mapWeatherData(data);
    }

    async fetchByCoords(lat: number, lon: number): Promise<WeatherData> {
        const data = await this.fetchWeather<WeatherApiResponse>(
            `${this.baseUrl}?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`,
            "Location not found"
        );

        return this.mapWeatherData(data);
    }

    async fetchCitySuggestions(query: string): Promise<CitySuggestion[]> {
        const trimmed = query.trim();
        if (!trimmed) return [];

        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
            trimmed
        )}&limit=5&appid=${this.apiKey}`;
        const response = await fetch(geoUrl);
        if (!response.ok) throw new Error("Failed to fetch city suggestions");

        const data = (await response.json()) as GeoApiResponse[];
        if (!Array.isArray(data)) return [];

        return data.map((item) => ({
            name: item.name,
            country: item.country,
            state: item.state,
            lat: item.lat,
            lon: item.lon,
        }));
    }

    private async fetchWeather<T>(url: string, errorMessage: string): Promise<T> {
        const response = await fetch(url);
        if (!response.ok) throw new Error(errorMessage);
        return (await response.json()) as T;
    }

    private mapWeatherData(data: WeatherApiResponse): WeatherData {
        const condition = data.weather[0];
        return {
            city: data.name,
            country: data.sys.country,
            temperature: Math.round(data.main.temp),
            feelsLike: Math.round(data.main.feels_like),
            description: condition?.description ?? "Unknown",
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            pressure: data.main.pressure,
            visibility: data.visibility / 1000,
            icon: condition?.icon ?? "01d",
            timezone: data.timezone,
            timestamp: Date.now(),
        };
    }
}

export const openWeatherService: WeatherService = new OpenWeatherService(
    WEATHER_API_KEY,
    WEATHER_API_URL
);
