import { Thermometer, Droplets, Wind, Eye, Gauge, Clock3, MapPin } from "lucide-react";
import type { WeatherData } from "../types/weather";
import { deriveLocalTime, resolveWeatherEmoji } from "../utils/weatherPresentation";

interface WeatherDisplayProps {
    weather: WeatherData;
}

export default function WeatherDisplay({ weather }: WeatherDisplayProps) {
    const localTime = deriveLocalTime(weather.timezone);

    return (
        <div className="glass-panel relative overflow-hidden p-8 md:p-10">
            <div className="relative space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-3">
                        <div className="pill w-fit">
                            <MapPin className="w-4 h-4" />
                            {weather.city}, {weather.country}
                        </div>
                        <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">
                            {weather.city}
                        </h2>
                        <div className="flex items-center gap-3 text-slate-600">
                            <Clock3 className="w-4 h-4" />
                            <span className="text-sm">
                                Local time{" "}
                                {localTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            <span className="text-xs rounded-full bg-white/70 px-3 py-1 border border-slate-200 text-slate-700">
                                {weather.description}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 rounded-2xl border border-slate-200 bg-white/85 px-6 py-5 shadow-glow">
                        <div className="text-6xl">{resolveWeatherEmoji(weather.icon)}</div>
                        <div className="space-y-1 text-right">
                            <p className="text-4xl md:text-5xl font-semibold text-slate-900">
                                {weather.temperature}°C
                            </p>
                            <p className="text-slate-600">Feels like {weather.feelsLike}°C</p>
                            <p className="text-xs text-slate-600">Updated just now</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card border-slate-200/70 p-5 sm:p-6 grid sm:grid-cols-3 gap-4 items-center">
                    <div className="flex items-center gap-3 sm:col-span-2">
                        <Thermometer className="w-10 h-10 text-slate-700" />
                        <div>
                            <p className="text-sm text-slate-600">Thermal comfort</p>
                            <p className="text-lg text-slate-900 font-semibold">{weather.description}</p>
                            <p className="text-sm text-slate-600">
                                Calibrated to local daylight and humidity.
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end text-xs">
                        <span className="px-3 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                            Air
                        </span>
                        <span className="px-3 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                            Visibility
                        </span>
                        <span className="px-3 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                            Pressure
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[
                        {
                            label: "Humidity",
                            value: `${weather.humidity}%`,
                            helper: "Ambient moisture right now.",
                            icon: Droplets,
                            accent: "from-slate-200/70 to-transparent",
                        },
                        {
                            label: "Wind",
                            value: `${weather.windSpeed} m/s`,
                            helper: "Surface wind speed recorded.",
                            icon: Wind,
                            accent: "from-slate-200/70 to-transparent",
                        },
                        {
                            label: "Pressure",
                            value: `${weather.pressure} hPa`,
                            helper: "Sea-level adjusted pressure.",
                            icon: Gauge,
                            accent: "from-slate-200/70 to-transparent",
                        },
                        {
                            label: "Visibility",
                            value: `${weather.visibility} km`,
                            helper: "Line of sight in kilometers.",
                            icon: Eye,
                            accent: "from-slate-200/70 to-transparent",
                        },
                    ].map((metric) => (
                        <div
                            key={metric.label}
                            className="glass-card relative overflow-hidden p-4 border-slate-200/70"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${metric.accent} opacity-70`} />
                            <div className="relative flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <p className="text-xs uppercase tracking-wide text-slate-600">
                                        {metric.label}
                                    </p>
                                    <p className="text-2xl font-semibold text-slate-900">{metric.value}</p>
                                    <p className="text-sm text-slate-600">{metric.helper}</p>
                                </div>
                                <metric.icon className="w-6 h-6 text-slate-600" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
