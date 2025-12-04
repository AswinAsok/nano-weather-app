import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import type { WeatherData } from '../types/weather';
import { generateCityImage } from '../services/imageService';

interface CityVisualizationProps {
  weather: WeatherData;
}

export default function CityVisualization({ weather }: CityVisualizationProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${weather.city.replace(/\s+/g, '_').toLowerCase()}_skyline.png`;
    link.click();
  };

  useEffect(() => {
    const generateImage = async () => {
      setLoading(true);
      setError('');
      setImageUrl(null);

      try {
        const url = await generateCityImage(weather);
        setImageUrl(url);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to generate city visualization';
        setError(message);
        console.error('Image generation error:', err);
      } finally {
        setLoading(false);
      }
    };

    generateImage();
  }, [weather]);

  return (
    <div className="glass-panel relative overflow-hidden p-8 md:p-10 border-blue-500/10">
      <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-white/0 to-white/40" />
      <div className="absolute -right-8 top-6 h-44 w-44 rounded-full bg-emerald-300/20 blur-3xl" />
      <div className="absolute -left-6 bottom-6 h-40 w-40 rounded-full bg-blue-300/20 blur-3xl" />

      <div className="relative space-y-6">
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
              className="inline-flex items-center gap-2 rounded-xl border border-blue-500/20 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-emerald-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        <div className="relative rounded-3xl border border-blue-500/10 bg-white/85 shadow-glow min-h-[360px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/15 pointer-events-none" />

          {loading && (
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center space-y-3">
                <div className="mx-auto h-14 w-14 rounded-full border-4 border-blue-200 border-t-emerald-400 animate-spin" />
                <p className="text-sm text-slate-700">Generating city visualization...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center p-6">
              <div className="text-center text-red-600 space-y-2">
                <p className="font-medium">Image generation failed</p>
                <p className="text-sm text-red-600/80 max-w-md">{error}</p>
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
      </div>
    </div>
  );
}
