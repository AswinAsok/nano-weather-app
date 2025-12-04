import { useEffect, useState } from "react";
import { Search, MapPin, Sparkles, Star } from "lucide-react";
import WeatherDisplay from "./components/WeatherDisplay";
import CityVisualization from "./components/CityVisualization";
import { fetchWeather, fetchCitySuggestions, type CitySuggestion } from "./services/weatherService";
import { fetchRepoStars } from "./services/githubService";
import type { WeatherData } from "./types/weather";

function App() {
    const [city, setCity] = useState("");
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [githubStars, setGithubStars] = useState<number | null>(null);
    const [githubStarsError, setGithubStarsError] = useState(false);

    const featuredCities = ["Lisbon", "Berlin", "Singapore"];

    useEffect(() => {
        const query = city.trim();
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        let active = true;
        setSuggestionsLoading(true);
        const timer = setTimeout(async () => {
            try {
                const results = await fetchCitySuggestions(query);
                if (active) setSuggestions(results);
            } catch (err) {
                console.error("Failed to fetch suggestions", err);
                if (active) setSuggestions([]);
            } finally {
                if (active) setSuggestionsLoading(false);
            }
        }, 250);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [city]);

    useEffect(() => {
        let active = true;

        const loadStars = async () => {
            try {
                const stars = await fetchRepoStars();
                if (active) setGithubStars(stars);
            } catch (err) {
                console.error("Failed to fetch GitHub stars", err);
                if (active) setGithubStarsError(true);
            }
        };

        loadStars();
        return () => {
            active = false;
        };
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!city.trim()) return;

        setLoading(true);
        setError("");

        try {
            const data = await fetchWeather(city);
            setWeatherData(data);
        } catch (err) {
            console.error("Failed to fetch weather", err);
            setError("City not found. Please try again.");
            setWeatherData(null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50">
            <div className="relative max-w-6xl mx-auto px-4 py-12 lg:py-14 space-y-10">
                <div className="glass-panel relative z-20 p-8 md:p-10 overflow-visible border-slate-200/60">
                    <div className="relative grid grid-cols-1 gap-8 items-center">
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="pill w-fit">
                                    <Sparkles className="w-4 h-4" />
                                    Live weather, instant visuals
                                </div>
                                <a
                                    href="https://github.com/AswinAsok/nano-weather-app"
                                    className="pill flex items-center gap-2 hover:border-slate-400/80 hover:text-slate-900 transition"
                                    target="_blank"
                                    rel="noreferrer"
                                    title="View on GitHub"
                                >
                                    <Star className="w-4 h-4 text-slate-800" />
                                    {githubStars !== null &&
                                        !githubStarsError &&
                                        `${githubStars} stars`}
                                    {githubStars === null &&
                                        !githubStarsError &&
                                        "APIs cost snacks—toss a star if this made you smile"}
                                    {githubStarsError && "GitHub unavailable"}
                                </a>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-slate-900">
                                Search a city. See it now.
                            </h1>
                            <p className="text-base text-slate-600 max-w-xl">
                                Enter any city to stream its current conditions and generate a
                                matching skyline.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSearch}
                            className="glass-card border-slate-200/70 p-7 md:p-8 space-y-6 overflow-visible"
                        >
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-600">City Search</p>
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <div className="h-2 w-2 rounded-full bg-slate-700 animate-pulse" />
                                    Live
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 md:gap-5">
                                <div className="relative">
                                    <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white px-5 py-5 md:px-6 md:py-5 shadow-[0_14px_36px_rgba(15,23,42,0.08)] transition focus-within:border-slate-900/70 focus-within:shadow-[0_18px_42px_rgba(15,23,42,0.12)]">
                                        <MapPin className="w-5 h-5 text-slate-700" />
                                        <input
                                            type="text"
                                            value={city}
                                            onFocus={() => setShowSuggestions(true)}
                                            onBlur={() =>
                                                setTimeout(() => setShowSuggestions(false), 120)
                                            }
                                            onChange={(e) => setCity(e.target.value)}
                                            placeholder="Search a city or region"
                                            className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 disabled:opacity-60"
                                        >
                                            {loading ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/80 border-t-transparent" />
                                            ) : (
                                                <Search className="w-4 h-4" />
                                            )}
                                            {loading ? "Searching" : "Fetch weather"}
                                        </button>
                                    </div>

                                    {showSuggestions &&
                                        (suggestions.length > 0 || suggestionsLoading) && (
                                            <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/80 overflow-hidden z-50 max-h-64 overflow-auto">
                                                {suggestionsLoading && (
                                                    <div className="px-4 py-3 text-sm text-slate-500">
                                                        Searching...
                                                    </div>
                                                )}
                                                {suggestions.map((suggestion) => (
                                                    <button
                                                        key={`${suggestion.name}-${suggestion.lat}-${suggestion.lon}`}
                                                        type="button"
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        onClick={() => {
                                                            setCity(suggestion.name);
                                                            setShowSuggestions(false);
                                                        }}
                                                        className="w-full text-left px-4 py-3 text-sm text-slate-800 hover:bg-slate-100"
                                                    >
                                                        <span className="font-semibold">
                                                            {suggestion.name}
                                                        </span>
                                                        {suggestion.state
                                                            ? `, ${suggestion.state}`
                                                            : ""}{" "}
                                                        {suggestion.country
                                                            ? `(${suggestion.country})`
                                                            : ""}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
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
                                            className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-700 transition hover:border-slate-400 hover:text-slate-900"
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
                    <div className="glass-panel border-slate-200/80 px-8 py-12 text-center space-y-6">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/80 border border-slate-200 text-slate-800 shadow-lg shadow-slate-900/10">
                            <MapPin className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-2xl font-semibold text-slate-900">
                                Start with any city
                            </p>
                            <p className="text-slate-600">
                                We will pull live conditions and render a tailored 3D skyline that
                                matches the vibe outside.
                            </p>
                        </div>
                    </div>
                )}

                <footer className="glass-card border-slate-200/80 px-6 py-5 md:px-8 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-700">
                            Nano Weather Studio
                        </p>
                        <p className="text-sm text-slate-600">
                            Live data, generative skylines, and adaptive lighting in one glance.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center text-sm text-slate-700">
                        <a
                            href="https://github.com/AswinAsok/nano-weather-app"
                            className="pill hover:border-slate-400/80 hover:text-slate-900 transition"
                            target="_blank"
                            rel="noreferrer"
                        >
                            <Star className="w-4 h-4 text-slate-800" />
                            View on GitHub
                        </a>
                        <span className="pill bg-white/70 border-slate-200">
                            Powered by OpenWeather + Gemini
                        </span>
                    </div>
                </footer>
            </div>
        </div>
    );
}

export default App;
