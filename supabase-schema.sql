-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS weather_searches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    city VARCHAR(255) NOT NULL,
    country VARCHAR(100) NOT NULL,
    temperature DECIMAL(5, 2) NOT NULL,
    condition VARCHAR(100) NOT NULL,
    image_data TEXT,
    prompt TEXT,
    search_location TEXT,
    searched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on searched_at for faster queries
CREATE INDEX IF NOT EXISTS idx_weather_searches_searched_at 
ON weather_searches(searched_at DESC);

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    favorite_city VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE weather_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust these based on your auth requirements)
-- Allow anyone to insert weather searches
CREATE POLICY "Allow public insert on weather_searches" 
ON weather_searches FOR INSERT 
WITH CHECK (true);

-- Allow anyone to read weather searches
CREATE POLICY "Allow public read on weather_searches" 
ON weather_searches FOR SELECT 
USING (true);

-- Allow anyone to read and write user preferences
CREATE POLICY "Allow public access to user_preferences" 
ON user_preferences FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at
CREATE TRIGGER update_user_preferences_updated_at 
BEFORE UPDATE ON user_preferences 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
