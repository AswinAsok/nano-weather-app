import { Analytics } from "@vercel/analytics/react";
import { useCallback, useState } from "react";
import { Hammer, Lightbulb, MapPin, Search, Sparkles, Star } from "lucide-react";
import CityVisualization from "./components/CityVisualization";
import { RecentGallery } from "./components/RecentGallery";
import WeatherDisplay from "./components/WeatherDisplay";
import { useCitySuggestions } from "./hooks/useCitySuggestions";
import { useGithubStars } from "./hooks/useGithubStars";
import { useWeatherController } from "./hooks/useWeatherController";
import { useServices } from "./services/serviceContext";
import type { WeatherSearchHistory } from "./services/supabaseService";

function App() {
    const { weatherService, githubRepoService, geolocationService, imageService } = useServices();
    const [city, setCity] = useState("");
    const [searchLocation, setSearchLocation] = useState<string | null>(null);
    const [latestLocalEntry, setLatestLocalEntry] = useState<WeatherSearchHistory | null>(null);
    const [locating, setLocating] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const {
        weatherData,
        loading,
        error,
        searchByCity,
        searchByCoords,
        clearError,
        setCustomError,
    } = useWeatherController(weatherService);
    const { suggestions, loading: suggestionsLoading } = useCitySuggestions(city, weatherService);
    const { stars: githubStars, error: githubStarsError } = useGithubStars(githubRepoService);

    const featuredCities = ["Lisbon", "Berlin", "Singapore"];

    const handleSearch = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            const trimmed = city.trim();
            if (!trimmed) return;

            clearError();
            const data = await searchByCity(trimmed);
            if (data) {
                setSearchLocation(`${data.city}, ${data.country}`);
            }
        },
        [city, clearError, searchByCity]
    );

    const handleUseCurrentLocation = useCallback(async () => {
        setLocating(true);
        clearError();
        setShowSuggestions(false);

        try {
            const coords = await geolocationService.getCurrentPosition({ timeout: 10000 });
            const data = await searchByCoords(coords.latitude, coords.longitude);
            if (data) {
                setCity(data.city);
                const formattedCoords = `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`;
                setSearchLocation(`GPS ${formattedCoords} (${data.city}, ${data.country})`);
            }
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Location permission denied. Please allow access or search for a city.";
            setCustomError(message);
        } finally {
            setLocating(false);
        }
    }, [clearError, geolocationService, searchByCoords, setCustomError]);

    return (
        <>
            <Analytics />
            <div className="relative min-h-screen overflow-hidden bg-slate-50">
                <div className="relative max-w-6xl mx-auto px-4 py-6 md:py-12 lg:py-14 space-y-6 md:space-y-10">
                    <div className="glass-panel relative z-20 p-5 md:p-8 lg:p-10 overflow-visible border-slate-200/60">
                        <div className="flex items-center flex-wrap gap-3 md:gap-4 mb-4 md:mb-6">
                            <div className="hidden md:flex items-center gap-2">
                                <div className="pill w-fit">
                                    <Sparkles className="w-4 h-4" />
                                    Live weather, instant visuals
                                </div>
                            </div>
                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end ml-auto">
                                <a
                                    href="https://github.com/AswinAsok/nano-weather-app"
                                    className="pill flex items-center gap-2 border-amber-400 text-slate-900 transition group"
                                    target="_blank"
                                    rel="noreferrer"
                                    title="View on GitHub"
                                >
                                    <Star className="w-4 h-4 text-amber-500 transition group-hover:fill-amber-500 group-hover:text-amber-600" />
                                    {githubStars !== null && !githubStarsError && `${githubStars} stars`}
                                    {githubStars === null &&
                                        !githubStarsError &&
                                        "APIs cost snacks—toss a star if this made you smile"}
                                    {githubStarsError && "GitHub unavailable"}
                                </a>
                                <a
                                    href="https://linkedin.com/in/-aswinasok"
                                    className="pill flex items-center gap-2 hover:border-slate-400/80 hover:text-slate-900 transition group"
                                    target="_blank"
                                    rel="noreferrer"
                                    title="Built by Aswin"
                                >
                                    <Hammer className="w-4 h-4 text-slate-700 transition group-hover:text-slate-900" />
                                    Built by Aswin
                                </a>
                            </div>
                        </div>
                        <div className="relative grid grid-cols-1 gap-4 md:gap-8 items-center">
                            <div className="space-y-2 md:space-y-4">
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
                                className="glass-card border-slate-200/70 p-5 md:p-7 lg:p-8 space-y-4 md:space-y-6 overflow-visible"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-600">City Search</p>
                                    <div className="flex items-center gap-2 text-xs text-green-600">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]" />
                                        Live
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 md:gap-5">
                                    <div className="relative">
                                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                                            <div className="flex items-center gap-4 flex-1 rounded-3xl border border-slate-200 bg-white px-5 py-5 md:px-6 md:py-5 shadow-[0_14px_36px_rgba(15,23,42,0.08)] transition focus-within:border-slate-900/70 focus-within:shadow-[0_18px_42px_rgba(15,23,42,0.12)]">
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
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl bg-slate-900 px-6 py-4 md:py-5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 disabled:opacity-60 w-full md:w-auto"
                                            >
                                                {loading ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/80 border-t-transparent" />
                                                ) : (
                                                    <Search className="w-4 h-4" />
                                                )}
                                                {loading ? "Searching" : "Fetch weather"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleUseCurrentLocation}
                                                disabled={loading || locating}
                                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl border border-slate-200 bg-white px-6 py-4 md:py-5 text-sm font-semibold text-slate-800 shadow-[0_14px_36px_rgba(15,23,42,0.06)] transition hover:border-slate-400 hover:text-slate-900 disabled:opacity-60 w-full md:w-auto"
                                            >
                                                {locating ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-800/80 border-t-transparent" />
                                                ) : (
                                                    <MapPin className="w-4 h-4" />
                                                )}
                                                {locating ? "Getting location" : "Use my location"}
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

                                    <div className="flex gap-2 pt-2 overflow-x-auto">
                                        {featuredCities.map((cityName) => (
                                            <button
                                                key={cityName}
                                                type="button"
                                                onClick={() => setCity(cityName)}
                                                className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-700 transition hover:border-slate-400 hover:text-slate-900 shrink-0"
                                            >
                                                {cityName}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {loading ? (
                        <div className="glass-panel border-slate-200/80 px-8 py-12 text-center space-y-6">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white/80 border border-slate-200 text-slate-800 shadow-lg shadow-slate-900/10">
                                <div className="animate-spin rounded-full h-10 w-10 border-3 border-slate-300 border-t-slate-800" />
                            </div>
                            <div className="space-y-3">
                                <p className="text-2xl font-semibold text-slate-900">
                                    Fetching weather magic...
                                </p>
                                <p className="text-slate-600">
                                    While our cloud hamsters run on their wheels, maybe drop us a star?
                                </p>
                                <a
                                    href="https://github.com/AswinAsok/nano-weather-app"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 mt-2 rounded-full border border-amber-400 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:bg-slate-800 hover:border-amber-500 group"
                                >
                                    <Star className="w-4 h-4 text-amber-500 transition group-hover:fill-amber-500 group-hover:text-amber-600" />
                                    Star the repo, make a dev smile
                                </a>
                            </div>
                        </div>
                    ) : weatherData ? (
                        <div className="space-y-6 md:space-y-10">
                            <WeatherDisplay weather={weatherData} />
                            <CityVisualization
                                weather={weatherData}
                                imageService={imageService}
                                searchLocation={searchLocation}
                                onImageGenerated={(entry) => setLatestLocalEntry(entry)}
                            />
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
                                    We will pull live conditions and render a tailored 3D skyline
                                    that matches the vibe outside.
                                </p>
                            </div>
                        </div>
                    )}

                    <RecentGallery
                        limit={15}
                        currentEntry={latestLocalEntry}
                        loadRemote={!latestLocalEntry}
                    />

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
                                href="https://in.linkedin.com/in/hafiscp"
                                className="pill hover:border-slate-400/80 hover:text-slate-900 transition"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Lightbulb className="w-4 h-4 text-slate-800" />
                                Idea by Hafis CP
                            </a>
                            <a
                                href="https://linkedin.com/in/-aswinasok"
                                className="pill border-amber-400 hover:border-amber-500 hover:text-slate-900 transition group"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <Star className="w-4 h-4 text-amber-500 transition group-hover:fill-amber-500 group-hover:text-amber-600" />
                                Built by Aswin
                            </a>
                        </div>
                    </footer>
                </div>
            </div>
        </>
    );
}

export default App;
