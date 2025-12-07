import { useCallback, useRef, useState } from "react";
import { Check, Copy, Download, Share2, Twitter } from "lucide-react";
import type { WeatherData } from "../types/weather";
import type { WeatherRoast } from "../services/roastService";

interface ShareableCardProps {
    weather: WeatherData;
    roast: WeatherRoast;
    imageUrl: string;
}

export function ShareableCard({ weather, roast, imageUrl }: ShareableCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);
    const [sharing, setSharing] = useState(false);

    // Generate shareable image as canvas
    const generateShareableImage = useCallback(async (): Promise<HTMLCanvasElement> => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported");

        // Set canvas size for social media (1080x1350 for Instagram)
        canvas.width = 1080;
        canvas.height = 1350;

        // Draw gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, "#0f172a");
        gradient.addColorStop(1, "#1e293b");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Load and draw the AI image
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise<void>((resolve, reject) => {
            img.onload = () => resolve();
            img.onerror = reject;
            img.src = imageUrl;
        });

        // Draw image with rounded corners effect
        const imgSize = 900;
        const imgX = (canvas.width - imgSize) / 2;
        const imgY = 80;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(imgX, imgY, imgSize, imgSize, 24);
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        ctx.restore();

        // Draw vibe badge
        ctx.font = "bold 28px Space Grotesk, Inter, sans-serif";
        ctx.fillStyle = "#fbbf24";
        ctx.textAlign = "center";
        ctx.fillText(`${roast.emoji} ${roast.vibe}`, canvas.width / 2, imgY + imgSize + 60);

        // Draw roast text
        ctx.font = "24px Space Grotesk, Inter, sans-serif";
        ctx.fillStyle = "#f1f5f9";
        ctx.textAlign = "center";

        // Word wrap the roast
        const maxWidth = 900;
        const lineHeight = 36;
        const words = roast.roast.split(" ");
        let line = "";
        let y = imgY + imgSize + 120;

        for (const word of words) {
            const testLine = line + word + " ";
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && line !== "") {
                ctx.fillText(line.trim(), canvas.width / 2, y);
                line = word + " ";
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line.trim(), canvas.width / 2, y);

        // Draw weather info
        y += 60;
        ctx.font = "bold 48px Space Grotesk, Inter, sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(`${weather.temperature}°C`, canvas.width / 2, y);

        ctx.font = "24px Space Grotesk, Inter, sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(`${weather.city}, ${weather.country}`, canvas.width / 2, y + 40);

        // Draw watermark
        ctx.font = "20px Space Grotesk, Inter, sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText("nano-weather.vercel.app", canvas.width / 2, canvas.height - 40);

        return canvas;
    }, [imageUrl, weather, roast]);

    // Convert canvas to File
    const canvasToFile = useCallback(async (canvas: HTMLCanvasElement): Promise<File> => {
        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Failed to create blob"));
                    return;
                }
                const file = new File(
                    [blob],
                    `${weather.city.toLowerCase().replace(/\s+/g, "-")}-weather-roast.png`,
                    { type: "image/png" }
                );
                resolve(file);
            }, "image/png");
        });
    }, [weather.city]);

    const handleCopyText = useCallback(async () => {
        const text = `${roast.shareText}\n\nCheck your city's weather roast at nano-weather.vercel.app`;
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [roast.shareText]);

    const handleDownload = useCallback(async () => {
        if (sharing) return;
        setSharing(true);

        try {
            const canvas = await generateShareableImage();
            const link = document.createElement("a");
            link.download = `${weather.city.toLowerCase().replace(/\s+/g, "-")}-weather-roast.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
        } catch (err) {
            console.error("Download failed:", err);
        } finally {
            setSharing(false);
        }
    }, [generateShareableImage, weather.city, sharing]);

    const handleShareTwitter = useCallback(() => {
        const text = encodeURIComponent(
            `${roast.shareText}\n\nGet roasted at nano-weather.vercel.app`
        );
        window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
    }, [roast.shareText]);

    const handleNativeShare = useCallback(async () => {
        if (sharing) return;
        setSharing(true);

        try {
            const canvas = await generateShareableImage();
            const file = await canvasToFile(canvas);
            const shareText = `${roast.shareText}\n\nGet roasted at nano-weather.vercel.app`;

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `${weather.city} Weather Roast`,
                    text: shareText,
                    files: [file],
                });
            } else {
                await navigator.share({
                    title: `${weather.city} Weather Roast`,
                    text: shareText,
                    url: "https://nano-weather.vercel.app",
                });
            }
        } catch (err) {
            if ((err as Error).name !== "AbortError") {
                console.error("Share failed:", err);
            }
        } finally {
            setSharing(false);
        }
    }, [generateShareableImage, canvasToFile, weather.city, roast.shareText, sharing]);

    return (
        <div className="space-y-4">
            {/* The card preview */}
            <div
                ref={cardRef}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 to-slate-800 p-6 text-white"
            >
                {/* Vibe badge */}
                <div className="mb-4 flex items-center justify-center">
                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-4 py-2 text-amber-400 font-semibold text-sm">
                        <span className="text-xl">{roast.emoji}</span>
                        {roast.vibe}
                    </span>
                </div>

                {/* Roast text */}
                <p className="text-center text-lg leading-relaxed text-slate-200 mb-6">
                    "{roast.roast}"
                </p>

                {/* Weather personality */}
                <div className="text-center mb-4">
                    <span className="text-xs uppercase tracking-wider text-slate-500">
                        Your weather personality
                    </span>
                    <p className="text-amber-400 font-semibold">{roast.personality}</p>
                </div>

                {/* Weather stats */}
                <div className="flex items-center justify-center gap-4 text-slate-400">
                    <span className="text-3xl font-bold text-white">{weather.temperature}°C</span>
                    <span className="text-sm">
                        {weather.city}, {weather.country}
                    </span>
                </div>
            </div>

            {/* Share buttons */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={handleShareTwitter}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#1DA1F2] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1a8cd8]"
                >
                    <Twitter className="w-4 h-4" />
                    Share on X
                </button>

                <button
                    onClick={handleCopyText}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
                >
                    {copied ? (
                        <>
                            <Check className="w-4 h-4 text-green-600" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <Copy className="w-4 h-4" />
                            Copy Text
                        </>
                    )}
                </button>

                <button
                    onClick={handleDownload}
                    disabled={sharing}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 disabled:opacity-60"
                >
                    {sharing ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-800/80 border-t-transparent" />
                    ) : (
                        <Download className="w-4 h-4" />
                    )}
                    Download
                </button>

                {typeof navigator !== "undefined" && "share" in navigator && (
                    <button
                        onClick={handleNativeShare}
                        disabled={sharing}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 disabled:opacity-60"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
