import { useState } from 'react';
import { Search, MapPin, Sparkles } from 'lucide-react';
import WeatherDisplay from './components/WeatherDisplay';
import CityVisualization from './components/CityVisualization';
import { fetchWeather } from './services/weatherService';
import type { WeatherData } from './types/weather';

function App() {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const featuredCities = ['Lisbon', 'Berlin', 'Singapore'];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');

    try {
      const data = await fetchWeather(city);
      setWeatherData(data);
    } catch (err) {
      console.error('Failed to fetch weather', err);
      setError('City not found. Please try again.');
      setWeatherData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-grid-glow opacity-60 pointer-events-none" />
      <div className="absolute -left-10 -top-20 h-[420px] w-[420px] rounded-full bg-blue-400/15 blur-3xl" />
      <div className="absolute right-[-8%] top-[20%] h-[460px] w-[360px] rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="absolute left-[30%] bottom-[-12%] h-[400px] w-[400px] rounded-full bg-white/60 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 py-12 lg:py-14 space-y-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 glass-card flex items-center justify-center text-emerald-600 border-blue-100">
              <Sparkles className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm text-slate-500">Nano Weather Studio</p>
              <p className="text-lg font-semibold text-slate-900">Clarity for every city</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span className="pill">Live weather feed</span>
            <span className="pill">Generative cityscapes</span>
          </div>
        </header>

        <div className="glass-panel relative p-8 md:p-10 overflow-hidden border-blue-500/10">
          <div className="absolute right-10 top-4 h-36 w-36 bg-emerald-300/20 blur-3xl" />
          <div className="absolute -left-12 bottom-0 h-48 w-48 bg-blue-400/20 blur-3xl" />

          <div className="relative grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
            <div className="space-y-4">
              <div className="pill w-fit">
                <Sparkles className="w-4 h-4" />
                Live weather, instant visuals
              </div>
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-slate-900">
                Search a city. See it now.
              </h1>
              <p className="text-base text-slate-600 max-w-xl">
                Enter any city to stream its current conditions and generate a matching skyline.
              </p>
            </div>

            <form onSubmit={handleSearch} className="glass-card border-blue-500/15 p-6 md:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">City Search</p>
                <div className="flex items-center gap-2 text-xs text-emerald-600">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-2xl border border-blue-500/15 bg-white px-4 py-4 shadow-[0_14px_36px_rgba(59,130,246,0.16)] transition focus-within:border-emerald-500/50 focus-within:shadow-[0_18px_42px_rgba(16,185,129,0.22)]">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Search a city or region"
                    className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition hover:brightness-110 disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/80 border-t-transparent" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    {loading ? 'Searching' : 'Fetch weather'}
                  </button>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                    {error}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  {featuredCities.map((cityName) => (
                    <button
                      key={cityName}
                      type="button"
                      onClick={() => setCity(cityName)}
                      className="rounded-full border border-blue-500/15 bg-white/80 px-3 py-2 text-xs text-slate-700 transition hover:border-emerald-400/50 hover:text-emerald-700"
                    >
                      {cityName}
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>

        {weatherData ? (
          <div className="space-y-6">
            <WeatherDisplay weather={weatherData} />
            <CityVisualization weather={weatherData} />
          </div>
        ) : (
          <div className="glass-panel border-blue-500/10 px-8 py-12 text-center space-y-6">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/80 border border-blue-500/10 text-emerald-600 shadow-lg shadow-emerald-200/40">
              <MapPin className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-semibold text-slate-900">Start with any city</p>
              <p className="text-slate-600">
                We will pull live conditions and render a tailored 3D skyline that matches the vibe outside.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
