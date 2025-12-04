import type { WeatherData } from '../types/weather';

function getTimeOfDay(timezone: number): string {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const cityTime = new Date(utc + (timezone * 1000));
  const hour = cityTime.getHours();

  if (hour >= 5 && hour < 8) return 'sunrise';
  if (hour >= 8 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'midday';
  if (hour >= 17 && hour < 20) return 'sunset';
  if (hour >= 20 || hour < 5) return 'night';
  return 'day';
}

function getLocalTime(timezone: number): string {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const cityTime = new Date(utc + (timezone * 1000));
  return cityTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function getLocalDate(timezone: number): string {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const cityTime = new Date(utc + (timezone * 1000));
  return cityTime.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

function getWeatherIcon(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes('clear')) return '☀️';
  if (desc.includes('cloud')) return '☁️';
  if (desc.includes('rain')) return '🌧️';
  if (desc.includes('storm') || desc.includes('thunder')) return '⛈️';
  if (desc.includes('snow')) return '❄️';
  if (desc.includes('mist') || desc.includes('fog')) return '🌫️';
  return '🌤️';
}

function buildPrompt(weather: WeatherData): string {
  const timeOfDay = getTimeOfDay(weather.timezone);
  const localTime = getLocalTime(weather.timezone);
  const localDate = getLocalDate(weather.timezone);
  const weatherIcon = getWeatherIcon(weather.description);

  let lightingDescription = '';
  switch (timeOfDay) {
    case 'sunrise':
    case 'sunset':
      lightingDescription = 'warm golden hour tones with soft orange and pink hues';
      break;
    case 'morning':
      lightingDescription = 'bright morning sun with clear, crisp lighting';
      break;
    case 'midday':
      lightingDescription = 'bright midday sun with sharp shadows';
      break;
    case 'night':
      lightingDescription = 'dark night scene with illuminated windows and street lights';
      break;
    default:
      lightingDescription = 'natural daylight with soft shadows';
  }

  return `Present a clear, 45° top-down isometric miniature 3D cartoon scene of ${weather.city}, featuring its most iconic landmarks and architectural elements. Use soft, refined textures with realistic PBR materials and lighting that reflects ${lightingDescription}.

Integrate both the current weather conditions (${weather.description}) and time-based atmospheric effects directly into the city environment. Show appropriate activity levels - ${timeOfDay === 'night' ? 'quieter scenes with illuminated buildings' : 'bustling streets with activity'}.

Use a clean, minimalistic composition with a soft, solid-colored background that complements the time of day.

At the top-center, place the title "${weather.city}" in large bold text, followed by:
- A prominent weather icon ${weatherIcon}
- The current time "${localTime}" (medium text)
- The date "${localDate}" (small text)
- Temperature "${weather.temperature}°C" (medium text)

All text must be centered with consistent spacing, and may subtly overlap the tops of the buildings. The text color should contrast appropriately with the time-based background.

Include time-specific details like:
- Window lights (${timeOfDay === 'night' ? 'brightly lit' : 'reflecting daylight'})
- Street lamp illumination ${timeOfDay === 'night' ? 'glowing warmly' : 'inactive'}
- Shadows angle and length based on ${timeOfDay} sun position
- Sky color gradients reflecting the exact hour
- Traffic density patterns matching typical city rhythms

Square 1080x1080 dimension.`;
}

export async function generateCityImage(weather: WeatherData): Promise<string> {
  const prompt = buildPrompt(weather);

  const res = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || 'Image generation failed');
  }

  const data = (await res.json()) as { dataUrl?: string; error?: string };
  if (data.error) throw new Error(data.error);
  if (!data.dataUrl) throw new Error('No image returned from server');

  return data.dataUrl;
}
