export function resolveWeatherEmoji(icon: string): string {
    const iconMap: Record<string, string> = {
        "01d": "☀️",
        "01n": "🌙",
        "02d": "⛅",
        "02n": "☁️",
        "03d": "☁️",
        "03n": "☁️",
        "04d": "☁️",
        "04n": "☁️",
        "09d": "🌧️",
        "09n": "🌧️",
        "10d": "🌦️",
        "10n": "🌧️",
        "11d": "⛈️",
        "11n": "⛈️",
        "13d": "❄️",
        "13n": "❄️",
        "50d": "🌫️",
        "50n": "🌫️",
    };

    return iconMap[icon] ?? "🌤️";
}

export function deriveLocalTime(timezone: number, now: number = Date.now()): Date {
    const utcNow = now + new Date(now).getTimezoneOffset() * 60000;
    return new Date(utcNow + timezone * 1000);
}
