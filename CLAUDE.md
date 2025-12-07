# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development server (includes image generation API proxy)
yarn dev

# Type checking
yarn typecheck

# Linting
yarn lint

# Production build
yarn build

# Preview production build
yarn preview
```

## Environment Variables

Required in `.env`:
- `VITE_OPENWEATHER_API_KEY` - OpenWeatherMap API key for weather data
- `VITE_GEMINI_API_KEY` - Google Gemini API key for image and roast generation
- `VITE_GEMINI_IMAGE_MODEL` - Gemini image model (default: "gemini-2.5-flash-image")
- `VITE_GEMINI_TEXT_MODEL` - Gemini text model for roasts (default: "gemini-2.0-flash")
- `VITE_SUPABASE_URL` - Supabase project URL (optional, for persistence)
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key (optional)

## Architecture

### Service Layer Pattern
The app uses a dependency injection pattern through React Context. All external integrations are abstracted behind interfaces defined in `src/services/contracts.ts`:

- **WeatherService**: Fetches weather data (OpenWeatherMap implementation)
- **ImageService**: Generates city visualization images (Gemini API)
- **GithubRepoService**: Fetches GitHub star count
- **GeolocationService**: Browser geolocation wrapper
- **SupabaseService**: Optional persistence for search history

Services are composed in `src/services/index.ts` and provided via `ServiceContext` (`src/services/serviceContext.tsx`). Components access services through `useServices()` hook.

### API Proxy
Vite middleware proxy in `vite.config.ts` provides two endpoints:
- `/api/generate-image` - Forwards prompts to Gemini image model, returns base64-encoded images
- `/api/generate-roast` - Forwards weather data to Gemini text model, returns JSON with roast, vibe, emoji, shareText, personality

Both proxies work in dev and preview modes.

### Key Flows
1. **Weather Search**: `useWeatherController` hook → `WeatherService.fetchByCity/fetchByCoords` → `WeatherData` type
2. **Image Generation**: `CityVisualization` component → `ImageService.generateCityImage` → `PromptBuilder` constructs detailed prompt based on weather/time → Gemini generates isometric diorama
3. **City Suggestions**: `useCitySuggestions` hook with debouncing → OpenWeatherMap Geo API
4. **Weather Roasts**: `useWeatherRoast` hook → `/api/generate-roast` → Gemini text model generates savage commentary with vibe, emoji, personality

### Viral Features
- **AI Weather Roasts** (`src/services/roastService.ts`): Generates humorous, shareable roasts about city weather
- **Shareable Cards** (`src/components/ShareableCard.tsx`): Download/share buttons for Twitter, native share, and image download with canvas rendering
- **Live Activity Feed** (`src/components/LiveActivityFeed.tsx`): Real-time global search feed with Supabase subscription (or simulated data)
- **Streak System** (`src/hooks/useStreak.ts`): LocalStorage-based gamification with achievements and daily streaks
- **Streak Badge** (`src/components/StreakBadge.tsx`): Visual streak counter with achievement modal

### Prompt Engineering
The `PromptBuilder` class in `src/services/imageService.ts` generates detailed prompts for city visualizations. It incorporates:
- City timezone to determine local time of day (sunrise/morning/midday/sunset/night)
- Weather conditions for environmental effects
- Lighting descriptions based on time
- Weather icons and formatted date/time for the overlay

## Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS with custom glass morphism design system
- Supabase for optional data persistence
- Vercel Analytics
