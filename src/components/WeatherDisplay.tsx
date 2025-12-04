import { Thermometer, Droplets, Wind, Eye, Gauge } from 'lucide-react';
import type { WeatherData } from '../types/weather';

interface WeatherDisplayProps {
  weather: WeatherData;
}

export default function WeatherDisplay({ weather }: WeatherDisplayProps) {
  const getWeatherEmoji = (icon: string) => {
    const iconMap: Record<string, string> = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️',
    };
    return iconMap[icon] || '🌤️';
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            {weather.city}, {weather.country}
          </h2>
          <p className="text-gray-600 capitalize text-lg">
            {weather.description}
          </p>
        </div>
        <div className="text-7xl">
          {getWeatherEmoji(weather.icon)}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 mb-1">Temperature</p>
              <p className="text-5xl font-bold text-gray-800">
                {weather.temperature}°C
              </p>
              <p className="text-gray-500 mt-2">
                Feels like {weather.feelsLike}°C
              </p>
            </div>
            <Thermometer className="w-12 h-12 text-red-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              <p className="text-gray-600 text-sm">Humidity</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {weather.humidity}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-5 h-5 text-green-400" />
              <p className="text-gray-600 text-sm">Wind</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {weather.windSpeed} m/s
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-5 h-5 text-purple-400" />
              <p className="text-gray-600 text-sm">Pressure</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {weather.pressure} hPa
            </p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5 text-yellow-600" />
              <p className="text-gray-600 text-sm">Visibility</p>
            </div>
            <p className="text-2xl font-bold text-gray-800">
              {weather.visibility} km
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
