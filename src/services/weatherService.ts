import type { WeatherData } from '../types/weather';

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
