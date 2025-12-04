import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import WeatherDisplay from './components/WeatherDisplay';
import CityVisualization from './components/CityVisualization';
import { fetchWeather } from './services/weatherService';
import type { WeatherData } from './types/weather';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');

    try {
      const data = await fetchWeather(city);
      setWeatherData(data);
    } catch (err) {
      setError('City not found. Please try again.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-800 mb-3">
              Weather Explorer
            </h1>
            <p className="text-gray-600 text-lg">
              Discover the weather and see your city in 3D
            </p>
          </header>

          <form onSubmit={handleSearch} className="mb-8">
            <div className="max-w-2xl mx-auto relative">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city name..."
                className="w-full px-6 py-4 pr-14 rounded-2xl border-2 border-blue-200 focus:border-blue-400 focus:outline-none text-lg shadow-lg transition-all"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
                ) : (
                  <Search className="w-6 h-6" />
                )}
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-center mt-3">{error}</p>
            )}
          </form>

          {weatherData && (
            <div className="space-y-8">
              <WeatherDisplay weather={weatherData} />
              <CityVisualization weather={weatherData} />
            </div>
          )}

          {!weatherData && !loading && (
            <div className="text-center py-20">
              <MapPin className="w-20 h-20 text-blue-300 mx-auto mb-4" />
              <p className="text-gray-500 text-xl">
                Search for a city to see its weather and 3D visualization
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
