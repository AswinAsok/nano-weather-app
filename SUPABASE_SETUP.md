# Supabase Integration Setup

This guide explains how to set up Supabase as a backend for the nano-weather-app to store weather search history and user preferences.

## Prerequisites

- A Supabase account ([sign up here](https://supabase.com))
- Node.js and npm installed

## Setup Steps

### 1. Create a Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in your project details:
   - Name: `nano-weather-app` (or any name you prefer)
   - Database Password: Create a strong password
   - Region: Choose the closest region to your users
4. Click "Create new project" and wait for the project to be initialized

### 2. Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (found under "Project URL")
   - **anon/public key** (found under "Project API keys")

### 3. Configure Environment Variables

1. Open `.env.local` in your project root
2. Add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 4. Set Up Database Tables

1. In your Supabase project dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the contents of `supabase-schema.sql` from the project root
4. Click "Run" to execute the SQL and create the tables

Alternatively, you can run the SQL file using the Supabase CLI:
```bash
supabase db push
```

### 5. Verify the Setup

The tables created are:

#### `weather_searches`
Stores the history of weather searches:
- `id`: UUID (primary key)
- `city`: City name
- `country`: Country name
- `temperature`: Temperature in Celsius
- `condition`: Weather condition (e.g., "Clear", "Rain")
- `image_data`: Base64 data URL for the generated skyline image
- `prompt`: The exact prompt used for image generation
- `search_location`: The user input or coordinates used to kick off the search
- `searched_at`: Timestamp of the search

#### `user_preferences`
Stores user preferences:
- `id`: UUID (primary key)
- `favorite_city`: User's favorite city
- `created_at`: Creation timestamp
- `updated_at`: Last update timestamp

## Features Enabled

With Supabase integrated, your weather app now supports:

1. **Search History**: Automatically saves every weather search
2. **Recent Searches**: Retrieve recently searched cities
3. **Favorite City**: Save and retrieve a user's favorite city

## Usage in Code

The Supabase service is automatically injected into your app through the service container:

```typescript
const { supabaseService } = useServices();

// Save a weather search
await supabaseService.saveWeatherSearch(
  weatherData,
  imageDataUrl,       // data URL returned by the image generator
  prompt,             // prompt sent to the model
  searchLocation      // user input or GPS coordinates used for the search
);

// Get recent searches
const recentSearches = await supabaseService.getRecentSearches(10);

// Set favorite city
await supabaseService.setFavoriteCity("Tokyo");

// Get favorite city
const favoriteCity = await supabaseService.getFavoriteCity();
```

`imageDataUrl` is an optional base64 data URL returned by the image generator so each stored search also keeps the rendered skyline.

## Security Considerations

The current RLS (Row Level Security) policies allow public access to all tables. For production use, you should:

1. Implement Supabase Authentication
2. Update RLS policies to restrict access based on authenticated users
3. Consider rate limiting on the database side

## Troubleshooting

### "Supabase credentials not found" Warning

If you see this warning in the console, ensure:
- Your `.env.local` file has the correct environment variables
- The variable names start with `VITE_` prefix
- You've restarted the development server after adding the variables

### Tables Not Found

If you get errors about missing tables:
- Verify you've run the SQL migration in the Supabase SQL Editor
- Check the table names match exactly (case-sensitive)
- Ensure RLS policies are properly configured

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
