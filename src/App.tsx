import { Analytics } from "@vercel/analytics/react";
import { useCallback, useState, useEffect } from "react";
import { Flame, Hammer, Lightbulb, MapPin, Sparkles, Star, Zap } from "lucide-react";
import CityVisualization from "./components/CityVisualization";
import { LiveActivityFeed } from "./components/LiveActivityFeed";
import { MapBackground } from "./components/MapBackground";
import { RecentGallery } from "./components/RecentGallery";
import { ShareableCard } from "./components/ShareableCard";
import { StreakBadge } from "./components/StreakBadge";
import WeatherDisplay from "./components/WeatherDisplay";
import { useCitySuggestions } from "./hooks/useCitySuggestions";
import { useGithubStars } from "./hooks/useGithubStars";
import { useStreak } from "./hooks/useStreak";
import { useWeatherController } from "./hooks/useWeatherController";
import { useWeatherRoast } from "./hooks/useWeatherRoast";
import { useServices } from "./services/serviceContext";
import type { WeatherSearchHistory } from "./services/supabaseService";

const VIRAL_TAGLINES = [
    "Your city's weather just got roasted",
    "Weather forecasts were boring. We fixed that.",
    "See your city. Get roasted. Share the pain.",
    "The weather app that fights back",
    "Finally, a weather app with personality",
];

function App() {
    const { weatherService, githubRepoService, geolocationService, imageService } = useServices();
    const [city, setCity] = useState("");
    const [searchLocation, setSearchLocation] = useState<string | null>(null);
    const [latestLocalEntry, setLatestLocalEntry] = useState<WeatherSearchHistory | null>(null);
    const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
    const [locating, setLocating] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [taglineIndex, setTaglineIndex] = useState(0);

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
    const { roast, loading: roastLoading, generateRoast, clearRoast } = useWeatherRoast();
    const {
        currentStreak,
        longestStreak,
        totalSearches,
        achievements,
        newAchievement,
        recordSearch,
        clearNewAchievement,
    } = useStreak();

    const featuredCities = ["Tokyo", "London", "New York", "Dubai", "Paris"];

    // Rotate taglines
    useEffect(() => {
        const interval = setInterval(() => {
            setTaglineIndex((prev) => (prev + 1) % VIRAL_TAGLINES.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            const trimmed = city.trim();
            if (!trimmed) return;

            clearError();
            clearRoast();
            setGeneratedImageUrl(null);
            const data = await searchByCity(trimmed);
            if (data) {
                setSearchLocation(`${data.city}, ${data.country}`);
                recordSearch();
                // Generate roast in parallel
                generateRoast(data);
            }
        },
        [city, clearError, clearRoast, searchByCity, recordSearch, generateRoast]
    );

    const handleUseCurrentLocation = useCallback(async () => {
        setLocating(true);
        clearError();
        clearRoast();
        setGeneratedImageUrl(null);
        setShowSuggestions(false);

        try {
            const coords = await geolocationService.getCurrentPosition({ timeout: 10000 });
            const data = await searchByCoords(coords.latitude, coords.longitude);
            if (data) {
                setCity(data.city);
                const formattedCoords = `${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`;
                setSearchLocation(`GPS ${formattedCoords} (${data.city}, ${data.country})`);
                recordSearch();
                // Generate roast in parallel
                generateRoast(data);
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
    }, [clearError, clearRoast, geolocationService, searchByCoords, setCustomError, recordSearch, generateRoast]);

    const handleQuickCity = useCallback(
        async (cityName: string) => {
            setCity(cityName);
            clearError();
            clearRoast();
            setGeneratedImageUrl(null);
            const data = await searchByCity(cityName);
            if (data) {
                setSearchLocation(`${data.city}, ${data.country}`);
                recordSearch();
                generateRoast(data);
            }
        },
        [clearError, clearRoast, searchByCity, recordSearch, generateRoast]
    );

    return (
        <>
            <Analytics />
            <MapBackground />
            <div className="relative min-h-screen overflow-hidden bg-transparent">
                <div className="relative max-w-6xl mx-auto px-4 py-6 md:py-12 lg:py-14 space-y-6 md:space-y-10">
                    {/* Hero Section */}
                    <div className="glass-panel relative z-20 p-5 md:p-8 lg:p-10 overflow-visible border-slate-200/60">
                        <div className="flex items-center flex-wrap gap-3 md:gap-4 mb-4 md:mb-6">
                            <div className="hidden md:flex items-center gap-2">
                                <div className="pill w-fit bg-gradient-to-r from-violet-100 to-purple-100 border-violet-300">
                                    <Zap className="w-4 h-4 text-violet-600" />
                                    <span className="text-violet-700 font-medium">AI-Powered Roasts</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end ml-auto">
                                {/* Streak Badge */}
                                <StreakBadge
                                    currentStreak={currentStreak}
                                    longestStreak={longestStreak}
                                    totalSearches={totalSearches}
                                    achievements={achievements}
                                    newAchievement={newAchievement}
                                    onClearAchievement={clearNewAchievement}
                                />

                                <a
                                    href="https://github.com/AswinAsok/nano-weather-app"
                                    className="pill flex items-center gap-2 border-amber-400 text-slate-900 transition group hover:bg-amber-50"
                                    target="_blank"
                                    rel="noreferrer"
                                    title="View on GitHub"
                                >
                                    <Star className="w-4 h-4 text-amber-500 transition group-hover:fill-amber-500 group-hover:text-amber-600" />
                                    {githubStars !== null && !githubStarsError && `${githubStars}`}
                                    {githubStars === null && !githubStarsError && "Star"}
                                </a>
                            </div>
                        </div>

                        <div className="relative grid grid-cols-1 gap-4 md:gap-8 items-center">
                            <div className="space-y-2 md:space-y-4">
                                <div className="flex items-center gap-2 text-sm text-violet-600 font-medium">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="transition-all duration-500">
                                        {VIRAL_TAGLINES[taglineIndex]}
                                    </span>
                                </div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
                                    Get Your City{" "}
                                    <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                        Roasted
                                    </span>
                                </h1>
                                <p className="text-base md:text-lg text-slate-600 max-w-xl">
                                    Search any city for live weather, AI-generated visuals, and a{" "}
                                    <span className="font-semibold text-slate-900">savage roast</span>{" "}
                                    you'll want to share everywhere.
                                </p>
                            </div>

                            <form
                                onSubmit={handleSearch}
                                className="glass-card border-slate-200/70 p-5 md:p-7 lg:p-8 space-y-4 md:space-y-6 overflow-visible"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-600 font-medium">
                                        Pick your victim
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-green-600">
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]" />
                                        Live
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 md:gap-5">
                                    <div className="relative">
                                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
                                            <div className="flex items-center gap-4 flex-1 rounded-3xl border border-slate-200 bg-white px-5 py-5 md:px-6 md:py-5 shadow-[0_14px_36px_rgba(15,23,42,0.08)] transition focus-within:border-violet-500/70 focus-within:shadow-[0_18px_42px_rgba(139,92,246,0.15)]">
                                                <MapPin className="w-5 h-5 text-slate-700" />
                                                <input
                                                    type="text"
                                                    value={city}
                                                    onFocus={() => setShowSuggestions(true)}
                                                    onBlur={() =>
                                                        setTimeout(() => setShowSuggestions(false), 120)
                                                    }
                                                    onChange={(e) => setCity(e.target.value)}
                                                    placeholder="Enter a city to roast..."
                                                    className="w-full bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 md:py-5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:shadow-xl hover:shadow-violet-500/30 hover:scale-[1.02] disabled:opacity-60 w-full md:w-auto"
                                            >
                                                {loading ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/80 border-t-transparent" />
                                                ) : (
                                                    <Flame className="w-4 h-4" />
                                                )}
                                                {loading ? "Roasting..." : "Roast This City"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleUseCurrentLocation}
                                                disabled={loading || locating}
                                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-3xl border border-slate-200 bg-white px-6 py-4 md:py-5 text-sm font-semibold text-slate-800 shadow-[0_14px_36px_rgba(15,23,42,0.06)] transition hover:border-violet-300 hover:text-violet-700 disabled:opacity-60 w-full md:w-auto"
                                            >
                                                {locating ? (
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-800/80 border-t-transparent" />
                                                ) : (
                                                    <MapPin className="w-4 h-4" />
                                                )}
                                                {locating ? "Finding you..." : "Roast Me"}
                                            </button>
                                        </div>

                                        {showSuggestions &&
                                            (suggestions.length > 0 || suggestionsLoading) && (
                                                <div className="absolute left-0 right-0 mt-2 rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/80 overflow-hidden z-50 max-h-64 overflow-auto">
                                                    {suggestionsLoading && (
                                                        <div className="px-4 py-3 text-sm text-slate-500">
                                                            Finding victims...
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
                                                            className="w-full text-left px-4 py-3 text-sm text-slate-800 hover:bg-violet-50 transition"
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

                                    <div className="flex flex-wrap items-center gap-2 pt-2">
                                        <span className="text-xs text-slate-500">Quick roast:</span>
                                        {featuredCities.map((cityName) => (
                                            <button
                                                key={cityName}
                                                type="button"
                                                onClick={() => handleQuickCity(cityName)}
                                                className="rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-xs text-slate-700 transition hover:border-violet-300 hover:text-violet-700 hover:bg-violet-50 shrink-0"
                                            >
                                                {cityName}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Results Section */}
                    {loading ? (
                        <div className="glass-panel border-slate-200/80 px-8 py-12 text-center space-y-6">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg shadow-violet-500/30">
                                <Flame className="w-10 h-10 animate-pulse" />
                            </div>
                            <div className="space-y-3">
                                <p className="text-2xl font-semibold text-slate-900">
                                    Preparing your roast...
                                </p>
                                <p className="text-slate-600">
                                    Our AI is sharpening its wit. This might hurt.
                                </p>
                            </div>
                        </div>
                    ) : weatherData ? (
                        <div className="space-y-6 md:space-y-10">
                            {/* Weather + Roast Combined Section */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <WeatherDisplay weather={weatherData} />

                                {/* Roast Card */}
                                <div className="glass-panel border-slate-200/80 p-6 md:p-8">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 text-white">
                                            <Flame className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">The Roast</h3>
                                            <p className="text-xs text-slate-500">AI-generated shade</p>
                                        </div>
                                    </div>

                                    {roastLoading ? (
                                        <div className="space-y-3 animate-pulse">
                                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-slate-200 rounded w-full"></div>
                                            <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                                        </div>
                                    ) : roast ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{roast.emoji}</span>
                                                <span className="text-sm font-semibold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                                                    {roast.vibe}
                                                </span>
                                            </div>
                                            <p className="text-lg text-slate-700 leading-relaxed">
                                                "{roast.roast}"
                                            </p>
                                            <div className="pt-2 border-t border-slate-100">
                                                <p className="text-xs text-slate-500">
                                                    Your weather personality:
                                                </p>
                                                <p className="font-semibold text-violet-600">
                                                    {roast.personality}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-500 text-sm">
                                            Roast generation failed. The AI was too kind today.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* City Visualization */}
                            <CityVisualization
                                weather={weatherData}
                                imageService={imageService}
                                searchLocation={searchLocation}
                                onImageGenerated={(entry) => {
                                    setLatestLocalEntry(entry);
                                    if (entry.image_data) {
                                        setGeneratedImageUrl(entry.image_data);
                                    }
                                }}
                            />

                            {/* Shareable Card (appears after image is generated) */}
                            {roast && generatedImageUrl && (
                                <div className="glass-panel border-violet-200/80 bg-gradient-to-br from-violet-50/50 to-purple-50/50 p-6 md:p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                            <Sparkles className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">
                                                Share Your Roast
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                Make your friends jealous (or worried)
                                            </p>
                                        </div>
                                    </div>
                                    <ShareableCard
                                        weather={weatherData}
                                        roast={roast}
                                        imageUrl={generatedImageUrl}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="glass-panel border-slate-200/80 px-8 py-12 text-center space-y-6">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-100 to-purple-100 border border-violet-200 text-violet-600 shadow-lg shadow-violet-500/10">
                                <Flame className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-2xl font-semibold text-slate-900">
                                    No city is safe
                                </p>
                                <p className="text-slate-600">
                                    Search any city above and watch our AI tear it apart (lovingly).
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Live Activity Feed */}
                    <LiveActivityFeed />

                    {/* Recent Gallery */}
                    <RecentGallery
                        limit={15}
                        currentEntry={latestLocalEntry}
                        loadRemote={!latestLocalEntry}
                    />

                    {/* Footer */}
                    <footer className="glass-card border-slate-200/80 px-6 py-5 md:px-8 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-700 font-semibold">
                                Nano Weather Roasts
                            </p>
                            <p className="text-sm text-slate-600">
                                Live weather, AI visuals, savage roasts, and zero chill.
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
                                <Hammer className="w-4 h-4 text-amber-500" />
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
