import { useState, useEffect } from 'react';
import type { WeatherData } from '../types/weather';
import { generateCityImage } from '../services/imageService';

interface CityVisualizationProps {
  weather: WeatherData;
}

export default function CityVisualization({ weather }: CityVisualizationProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const generateImage = async () => {
      setLoading(true);
      setError('');
      setImageUrl(null);

      try {
        const url = await generateCityImage(weather);
        setImageUrl(url);
      } catch (err) {
        setError('Failed to generate city visualization');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    generateImage();
  }, [weather.city, weather.description]);

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8">
      <h3 className="text-3xl font-bold text-gray-800 mb-6">
        3D City Visualization
      </h3>

      <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden aspect-square">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
              <p className="text-gray-600">Generating city visualization...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-red-500">
              <p>{error}</p>
              <p className="text-sm text-gray-500 mt-2">
                Please check your image generation API configuration
              </p>
            </div>
          </div>
        )}

        {imageUrl && !loading && (
          <img
            src={imageUrl}
            alt={`3D visualization of ${weather.city}`}
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </div>
  );
}
