import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Database features will be disabled.');
}

export const supabase: SupabaseClient<Database> | null = supabaseUrl && supabaseAnonKey 
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null;
