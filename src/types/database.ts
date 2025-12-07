export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      weather_searches: {
        Row: {
          id: string
          city: string
          country: string
          temperature: number
          condition: string
          image_data: string | null
          prompt: string | null
          search_location: string | null
          searched_at: string
        }
        Insert: {
          id?: string
          city: string
          country: string
          temperature: number
          condition: string
          image_data?: string | null
          prompt?: string | null
          search_location?: string | null
          searched_at?: string
        }
        Update: {
          id?: string
          city?: string
          country?: string
          temperature?: number
          condition?: string
          image_data?: string | null
          prompt?: string | null
          search_location?: string | null
          searched_at?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          id: string
          favorite_city: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          favorite_city?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          favorite_city?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
