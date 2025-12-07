import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import type { Connect, ViteDevServer, PreviewServer } from "vite";
import { GoogleGenAI } from "@google/genai";

type MiddlewareContainer =
    | Connect.Server
    | ViteDevServer["middlewares"]
    | PreviewServer["middlewares"];

function createApiProxies(env: Record<string, string>) {
    const apiKey = env.VITE_GEMINI_API_KEY || "";
    const imageModel = env.VITE_GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
    const textModel = env.VITE_GEMINI_TEXT_MODEL || "gemini-2.0-flash";

    const ai = new GoogleGenAI({ apiKey });

    // Image generation handler
    const imageHandler: Connect.NextHandleFunction = (req, res, next) => {
        if (req.url !== "/api/generate-image") return next();
        if (req.method !== "POST") {
            res.statusCode = 405;
            res.end("Method not allowed");
            return;
        }

        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        req.on("end", async () => {
            try {
                const body = JSON.parse(Buffer.concat(chunks).toString() || "{}") as {
                    prompt?: string;
                };
                if (!body.prompt) {
                    res.statusCode = 400;
                    res.end("Missing prompt");
                    return;
                }

                const response = await ai.models.generateContent({
                    model: imageModel,
                    contents: body.prompt,
                    config: {
                        responseModalities: ["image", "text"],
                    },
                });

                console.log("Image API Response:", JSON.stringify(response, null, 2));

                const parts = response.candidates?.[0]?.content?.parts;
                const imagePart = parts?.find(
                    (part: { inlineData?: { data?: string; mimeType?: string } }) =>
                        part.inlineData?.data
                );

                if (!imagePart?.inlineData?.data) {
                    console.error("No image in response. Parts:", JSON.stringify(parts, null, 2));
                    res.statusCode = 502;
                    res.end(`No image returned from model "${imageModel}". Check server logs.`);
                    return;
                }

                res.setHeader("Content-Type", "application/json");
                res.end(
                    JSON.stringify({
                        dataUrl: `data:${imagePart.inlineData.mimeType || "image/png"};base64,${
                            imagePart.inlineData.data
                        }`,
                    })
                );
            } catch (err) {
                console.error("Image proxy error:", err);
                res.statusCode = 500;
                res.end(
                    err instanceof Error
                        ? err.message
                        : "Image generation failed. Check API key and model availability."
                );
            }
        });
    };

    // Weather roast generation handler
    const roastHandler: Connect.NextHandleFunction = (req, res, next) => {
        if (req.url !== "/api/generate-roast") return next();
        if (req.method !== "POST") {
            res.statusCode = 405;
            res.end("Method not allowed");
            return;
        }

        const chunks: Buffer[] = [];
        req.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        req.on("end", async () => {
            try {
                const body = JSON.parse(Buffer.concat(chunks).toString() || "{}") as {
                    weather?: {
                        city: string;
                        country: string;
                        temperature: number;
                        description: string;
                        humidity: number;
                        windSpeed: number;
                    };
                };

                if (!body.weather) {
                    res.statusCode = 400;
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

                const response = await ai.models.generateContent({
                    model: textModel,
                    contents: prompt,
                });

                const text = response.candidates?.[0]?.content?.parts?.[0];
                if (!text || !('text' in text)) {
                    throw new Error("No text response from model");
                }

                // Clean the response - remove any markdown code blocks if present
                let jsonText = text.text.trim();
                if (jsonText.startsWith('```')) {
                    jsonText = jsonText.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
                }

                const roastData = JSON.parse(jsonText);

                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(roastData));
            } catch (err) {
                console.error("Roast proxy error:", err);
                res.statusCode = 500;
                res.end(
                    err instanceof Error
                        ? err.message
                        : "Roast generation failed."
                );
            }
        });
    };

    return (middlewares: MiddlewareContainer) => {
        middlewares.use(imageHandler);
        middlewares.use(roastHandler);
    };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");
    const attachProxies = createApiProxies(env);

    return {
        plugins: [
            react(),
            {
                name: "genai-api-proxies",
                configureServer(server) {
                    attachProxies(server.middlewares);
                },
                configurePreviewServer(server) {
                    attachProxies(server.middlewares);
                },
            },
        ],
    };
});
