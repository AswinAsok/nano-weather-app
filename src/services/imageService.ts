import type { WeatherData } from "../types/weather";
import type { ImageService } from "./contracts";

type TimeOfDay = "sunrise" | "morning" | "midday" | "sunset" | "night" | "day";

class PromptBuilder {
    constructor(private readonly clock: () => Date = () => new Date()) {}

    build(weather: WeatherData): string {
        const cityDate = this.getCityDate(weather.timezone);
        const timeOfDay = this.getTimeOfDay(cityDate);
        const localTime = this.formatTime(cityDate);
        const localDate = this.formatDate(cityDate);
        const weatherIcon = this.getWeatherIcon(weather.description);
        const lightingDescription = this.getLightingDescription(timeOfDay);

        return `Create an ultra-detailed, 45° top-down isometric miniature diorama of ${
            weather.city
        }. Research and faithfully recreate 4-6 of its most iconic, globally recognized landmarks and skyline anchors (towers, bridges, statues, cathedrals, arenas, waterfronts) with accurate silhouettes, materials, and proportions—avoid generic stand-ins. Layer the scene with foreground plazas and streets, mid-ground landmarks, and a background skyline or hills, plus signage, transit cues, and street furniture that fit the city.

Use premium, physically based materials and high-frequency micro-detailing: brick courses, window mullions, rooftop HVAC units, balcony rails, crosswalk markings, benches, varied foliage, and reflective glass. Light the scene with ${lightingDescription}, including subtle volumetric light and realistic shadows.

Integrate the current weather (${
            weather.description
        }) and the ${timeOfDay} atmosphere directly into the environment: ${
            timeOfDay === "night"
                ? "glowing windows, neon accents, and reflective wet asphalt if rainy"
                : "sun glow, aerial haze, crisp shadows; wet surfaces or puddles if rainy and snow accumulation if snowy"
        }. Show context-appropriate activity levels—${
            timeOfDay === "night"
                ? "calmer streets with illuminated buildings and selective traffic"
                : "bustling streets with pedestrians and light traffic"
        } that align to the weather. Populate the streets with authentic local vehicles (taxis, trams, buses, scooters) carrying regional colors, signage, and liveries.

Use a clean, minimal backdrop that complements the time of day so the diorama pops—avoid flat white; use soft gradients or subtle geometric/halftone patterns with very low contrast.

At the top-center, place the title "${weather.city}" in large bold text, followed by:
- A prominent weather icon ${weatherIcon}
- The current time "${localTime}" (medium text)
- The date "${localDate}" (small text)
- Temperature "${weather.temperature}°C" (medium text)

All text is centered with consistent spacing and may subtly overlap the tallest buildings; the text color must contrast with the background.

Include time-specific detailing:
- Window lights (${
            timeOfDay === "night"
                ? "bright and varied by floor"
                : "reflecting daylight with interior parallax"
        })
- Street lamps ${timeOfDay === "night" ? "glowing warmly with halo" : "present but off"}
- Shadows angle and length based on ${timeOfDay} sun position
- Sky gradients and horizon haze matching the exact hour
- Traffic and pedestrian density following typical city rhythms
- City-relevant vehicles visible on streets and avenues, rendered to real scale and styling
- If daytime, include pedestrians wearing clothing and accessories that reflect local culture, climate, and color palettes; at night, keep silhouettes subtle and sparse

Square 1080x1080 composition.`;
    }

    private getCityDate(timezone: number): Date {
        const now = this.clock();
        const utc = now.getTime() + now.getTimezoneOffset() * 60000;
        return new Date(utc + timezone * 1000);
    }

    private getTimeOfDay(cityTime: Date): TimeOfDay {
        const hour = cityTime.getHours();

        if (hour >= 5 && hour < 8) return "sunrise";
        if (hour >= 8 && hour < 12) return "morning";
        if (hour >= 12 && hour < 17) return "midday";
        if (hour >= 17 && hour < 20) return "sunset";
        if (hour >= 20 || hour < 5) return "night";
        return "day";
    }

    private getLightingDescription(timeOfDay: TimeOfDay): string {
        switch (timeOfDay) {
            case "sunrise":
            case "sunset":
                return "warm golden hour tones with soft orange and pink hues";
            case "morning":
                return "bright morning sun with clear, crisp lighting";
            case "midday":
                return "bright midday sun with sharp shadows";
            case "night":
                return "dark night scene with illuminated windows and street lights";
            default:
                return "natural daylight with soft shadows";
        }
    }

    private formatTime(date: Date): string {
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    }

    private formatDate(date: Date): string {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    }

    private getWeatherIcon(description: string): string {
        const desc = description.toLowerCase();
        if (desc.includes("clear")) return "☀️";
        if (desc.includes("cloud")) return "☁️";
        if (desc.includes("rain")) return "🌧️";
        if (desc.includes("storm") || desc.includes("thunder")) return "⛈️";
        if (desc.includes("snow")) return "❄️";
        if (desc.includes("mist") || desc.includes("fog")) return "🌫️";
        return "🌤️";
    }
}

class ServerImageService implements ImageService {
    constructor(private readonly endpoint: string, private readonly promptBuilder: PromptBuilder) {}

    async generateCityImage(weather: WeatherData): Promise<string> {
        const prompt = this.promptBuilder.build(weather);

        const res = await fetch(this.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt }),
        });

        if (!res.ok) {
            const message = await res.text();
            throw new Error(message || "Image generation failed");
        }

        const data = (await res.json()) as { dataUrl?: string; error?: string };
        if (data.error) throw new Error(data.error);
        if (!data.dataUrl) throw new Error("No image returned from server");

        return data.dataUrl;
    }
}

export const serverImageService: ImageService = new ServerImageService(
    "/api/generate-image",
    new PromptBuilder()
);
