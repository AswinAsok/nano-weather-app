import { Droplets, Wind, Eye, Gauge, Clock3, MapPin, ExternalLink } from "lucide-react";
import type { WeatherData } from "../types/weather";
import { deriveLocalTime, resolveWeatherEmoji } from "../utils/weatherPresentation";

interface WeatherDisplayProps {
    weather: WeatherData;
}

export default function WeatherDisplay({ weather }: WeatherDisplayProps) {
    const localTime = deriveLocalTime(weather.timezone);

    return (
        <div className="glass-panel relative overflow-hidden p-6 md:p-8">
            <div className="relative space-y-6">
                {/* Header with city and temperature */}
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="pill w-fit text-xs">
                                <MapPin className="w-3.5 h-3.5" />
                                {weather.city}, {weather.country}
                            </div>
                            <a
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    `${weather.city}, ${weather.country}`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-100 hover:border-blue-300 transition-colors"
                                title="Open in Google Maps"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        </div>
                        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900">
                            {weather.city}
                        </h2>
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <Clock3 className="w-3.5 h-3.5" />
                            <span>
                                {localTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="text-xs rounded-full bg-slate-100 px-2 py-0.5 border border-slate-200 text-slate-600">
                                {weather.description}
                            </span>
                        </div>
                    </div>

                    {/* Temperature card */}
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
                        <div className="text-4xl md:text-5xl">{resolveWeatherEmoji(weather.icon)}</div>
                        <div className="text-right">
                            <p className="text-3xl md:text-4xl font-semibold text-slate-900">
                                {weather.temperature}°C
                            </p>
                            <p className="text-sm text-slate-500">Feels {weather.feelsLike}°C</p>
                        </div>
                    </div>
                </div>

                {/* Stats grid - 2x2 */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        {
                            label: "Humidity",
                            value: `${weather.humidity}%`,
                            icon: Droplets,
                        },
                        {
                            label: "Wind",
                            value: `${weather.windSpeed} m/s`,
                            icon: Wind,
                        },
                        {
                            label: "Pressure",
                            value: `${weather.pressure} hPa`,
                            icon: Gauge,
                        },
                        {
                            label: "Visibility",
                            value: `${weather.visibility} km`,
                            icon: Eye,
                        },
                    ].map((metric) => (
                        <div
                            key={metric.label}
                            className="rounded-xl border border-slate-200 bg-white/80 p-4"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                                        {metric.label}
                                    </p>
                                    <p className="text-xl font-semibold text-slate-900">{metric.value}</p>
                                </div>
                                <metric.icon className="w-5 h-5 text-slate-400" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
