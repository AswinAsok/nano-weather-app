import type { WeatherData } from '../types/weather';

export interface CitySuggestion {
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo';
const WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

export async function fetchWeather(city: string): Promise<WeatherData> {
  const response = await fetch(
    `${WEATHER_API_URL}?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`
  );

  if (!response.ok) {
    throw new Error('City not found');
  }

  const data = await response.json();

  return {
    city: data.name,
    country: data.sys.country,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    description: data.weather[0].description,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    pressure: data.main.pressure,
    visibility: data.visibility / 1000,
    icon: data.weather[0].icon,
    timezone: data.timezone,
    timestamp: Date.now(),
  };
}

export async function fetchWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
  const response = await fetch(
    `${WEATHER_API_URL}?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
  );

  if (!response.ok) {
    throw new Error('Location not found');
  }

  const data = await response.json();

  return {
    city: data.name,
    country: data.sys.country,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    description: data.weather[0].description,
    humidity: data.main.humidity,
    windSpeed: data.wind.speed,
    pressure: data.main.pressure,
    visibility: data.visibility / 1000,
    icon: data.weather[0].icon,
    timezone: data.timezone,
    timestamp: Date.now(),
  };
}

export async function fetchCitySuggestions(query: string): Promise<CitySuggestion[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(trimmed)}&limit=5&appid=${WEATHER_API_KEY}`;
  const response = await fetch(geoUrl);

  if (!response.ok) {
    console.error('Failed to fetch city suggestions');
    return [];
  }

  const data = await response.json();
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    name: item.name,
    country: item.country,
    state: item.state,
    lat: item.lat,
    lon: item.lon,
  }));
}
