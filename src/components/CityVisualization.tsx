import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, Star } from "lucide-react";
import { useSupabaseSync } from "../hooks/useSupabaseSync";
import type { ImageService } from "../services/contracts";
import { useServices } from "../services/serviceContext";
import type { WeatherData } from "../types/weather";

interface CityVisualizationProps {
    weather: WeatherData;
    imageService?: ImageService;
    searchLocation: string | null;
    onImageGenerated?: (entry: {
        image_data: string;
        prompt: string;
        city: string;
        country: string;
        condition: string;
        temperature: number;
        searched_at: string;
        search_location: string;
    }) => void;
}

export default function CityVisualization({
    weather,
    imageService,
    searchLocation,
    onImageGenerated,
}: CityVisualizationProps) {
    const { imageService: defaultImageService, supabaseService } = useServices();
    const activeImageService = useMemo(
        () => imageService ?? defaultImageService,
        [defaultImageService, imageService]
    );
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const generatingRef = useRef(false);
    const lastCityRef = useRef<string | null>(null);
    const [prompt, setPrompt] = useState<string | null>(null);

    // Persist the weather search and generated image to Supabase
    useSupabaseSync(weather, imageUrl, prompt, searchLocation, supabaseService);

    const generateImage = useCallback(async (forceRetry = false) => {
        // Prevent duplicate calls from StrictMode or rapid re-renders
        if (generatingRef.current) return;
        // Skip if we already generated for this city (unless retrying)
        if (!forceRetry && lastCityRef.current === weather.city) return;

        generatingRef.current = true;
        lastCityRef.current = weather.city;
        setLoading(true);
        setError("");
        setImageUrl(null);
        setPrompt(null);

        try {
            const { imageUrl: url, prompt: generatedPrompt } =
                await activeImageService.generateCityImage(weather);
            setImageUrl(url);
            setPrompt(generatedPrompt);

            onImageGenerated?.({
                image_data: url,
                prompt: generatedPrompt,
                city: weather.city,
                country: weather.country,
                condition: weather.description,
                temperature: weather.temperature,
                searched_at: new Date().toISOString(),
                search_location: searchLocation ?? `${weather.city}, ${weather.country}`,
            });
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to generate city visualization";
            setError(message);
            console.error("Image generation error:", err);
        } finally {
            setLoading(false);
            generatingRef.current = false;
        }
    }, [activeImageService, weather]);

    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement("a");
        link.href = imageUrl;
        link.download = `${weather.city.replace(/\s+/g, "_").toLowerCase()}_skyline.png`;
        link.click();
    };

    useEffect(() => {
        generateImage();
    }, [generateImage]);

    return (
        <div className="glass-panel relative overflow-hidden p-5 md:p-10">
            <div className="relative space-y-4 md:space-y-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <p className="text-sm text-slate-600">Generative skyline</p>
                        <h3 className="text-3xl font-semibold text-slate-900">3D City Visualization</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="pill text-xs">Adaptive to live conditions</span>
                        <button
                            type="button"
                            onClick={handleDownload}
                            disabled={!imageUrl}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </button>
                    </div>
                </div>

                <div className="relative rounded-2xl md:rounded-3xl border border-slate-200 bg-white/85 shadow-glow min-h-[280px] md:min-h-[360px] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/15 pointer-events-none" />

                    {loading && (
                        <div className="absolute inset-0 grid place-items-center">
                            <div className="text-center space-y-3">
                                <div className="mx-auto h-14 w-14 rounded-full border-4 border-slate-200 border-t-slate-700 animate-spin" />
                                <p className="text-sm text-slate-700">Painting your skyline with pixels...</p>
                                <a
                                    href="https://github.com/AswinAsok/nano-weather-app"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
                                >
                                    <Star className="w-4 h-4" />
                                    Star us while you wait!
                                </a>
                            </div>
                        </div>
                    )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center text-red-600 space-y-3">
                <div className="space-y-1">
                  <p className="font-medium">Image generation failed</p>
                  <p className="text-sm text-red-600/80 max-w-md">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => generateImage(true)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-800 border border-slate-200 shadow-sm transition hover:border-slate-400 disabled:opacity-60"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

                    {imageUrl && !loading && (
                        <img
                            src={imageUrl}
                            alt={`3D visualization of ${weather.city}`}
                            className="w-full h-full object-contain"
                        />
                    )}

                    {!imageUrl && !loading && !error && (
                        <div className="absolute inset-0 grid place-items-center text-slate-600 text-sm">
                            Awaiting search to render the skyline.
                        </div>
                    )}
                </div>

                {imageUrl && !loading && (
                    <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 pt-3 md:pt-4">
                        <p className="text-sm text-slate-600">We know you loved it!</p>
                        <a
                            href="https://github.com/AswinAsok/nano-weather-app"
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-slate-800"
                        >
                            <Star className="w-4 h-4" />
                            Star the repo
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
