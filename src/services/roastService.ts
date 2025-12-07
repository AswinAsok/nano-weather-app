import type { WeatherData } from "../types/weather";

export interface WeatherRoast {
    roast: string;
    vibe: string;
    emoji: string;
    shareText: string;
    personality: string;
}

export interface RoastService {
    generateRoast(weather: WeatherData): Promise<WeatherRoast>;
}

class ServerRoastService implements RoastService {
    constructor(private readonly endpoint: string) {}

    async generateRoast(weather: WeatherData): Promise<WeatherRoast> {
        const res = await fetch(this.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ weather }),
        });

        if (!res.ok) {
            throw new Error("Failed to generate roast");
        }

        const data = await res.json() as WeatherRoast;
        return data;
    }
}

export const roastService: RoastService = new ServerRoastService("/api/generate-roast");
