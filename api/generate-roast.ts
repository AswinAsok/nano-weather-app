/* eslint-env node */

import type { IncomingMessage, ServerResponse } from "http";
import { GoogleGenAI } from "@google/genai";

type Req = IncomingMessage & { body?: unknown; method?: string };
type Res = ServerResponse & {
    status?: (statusCode: number) => Res;
    json?: (payload: unknown) => void;
    send?: (payload: unknown) => void;
};

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
const model =
    process.env.VITE_GEMINI_TEXT_MODEL || process.env.GEMINI_TEXT_MODEL || "gemini-2.0-flash";

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

async function readJsonBody(req: Req): Promise<unknown> {
    if (req.body) return req.body;

    const chunks: Buffer[] = [];
    for await (const chunk of req) {
        chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }

    if (!chunks.length) return undefined;

    try {
        return JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
        return undefined;
    }
}

interface WeatherData {
    city: string;
    country: string;
    temperature: number;
    description: string;
    humidity: number;
    windSpeed: number;
}

export default async function handler(req: Req, res: Res) {
    if (req.method !== "POST") {
        if (res.status) res.status(405);
        else res.statusCode = 405;
        res.end("Method not allowed");
        return;
    }

    if (!ai) {
        if (res.status) res.status(500);
        else res.statusCode = 500;
        res.end("Server misconfigured: missing Gemini API key");
        return;
    }

    const body = (await readJsonBody(req)) as { weather?: WeatherData } | undefined;

    if (!body?.weather) {
        if (res.status) res.status(400);
        else res.statusCode = 400;
        res.end("Missing weather data");
        return;
    }

    const { city, country, temperature, description, humidity, windSpeed } = body.weather;

    const prompt = `You are a savage, witty comedian who roasts cities based on their weather. Generate a JSON response with these exact fields:

{
  "roast": "A 2-3 sentence BRUTAL but funny roast about ${city}, ${country}'s weather. Current conditions: ${temperature}°C, ${description}, ${humidity}% humidity, wind ${windSpeed} m/s. Make it specific to the city's culture/stereotypes and the weather. Be savage but not offensive. Make it something people would screenshot and share on Twitter.",
  "vibe": "A 3-5 word vibe/mood description like 'Main Character Energy' or 'Cozy Blanket Vibes' or 'Touch Grass Weather'",
  "emoji": "A single emoji that captures the vibe",
  "shareText": "A short, punchy tweet-ready version (under 200 chars) that includes the city name and is highly shareable",
  "personality": "A fun weather personality type like 'Sunshine Optimist' or 'Rain Romantic' or 'Cold Heart' based on what weather they searched"
}

IMPORTANT: Return ONLY valid JSON, no markdown, no code blocks, just the raw JSON object.`;

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
        });

        const text = response.candidates?.[0]?.content?.parts?.[0];
        if (!text || !("text" in text)) {
            throw new Error("No text response from model");
        }

        // Clean the response - remove any markdown code blocks if present
        let jsonText = text.text.trim();
        if (jsonText.startsWith("```")) {
            jsonText = jsonText.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        }

        const roastData = JSON.parse(jsonText);

        res.setHeader("Content-Type", "application/json");
        if (res.status) res.status(200);
        else res.statusCode = 200;
        res.end(JSON.stringify(roastData));
    } catch (err) {
        console.error("Roast generation error:", err);
        const message = err instanceof Error ? err.message : "Roast generation failed.";
        if (res.status) res.status(500);
        else res.statusCode = 500;
        res.end(message);
    }
}
