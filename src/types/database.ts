export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
        };
        Insert: {
          id: string;
          created_at?: string;
        };
        Update: {
          created_at?: string;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          user_id: string;
          calories_target: number;
          protein_target_g: number;
          carbs_target_g: number;
          fat_target_g: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          calories_target?: number;
          protein_target_g?: number;
          carbs_target_g?: number;
          fat_target_g?: number;
          updated_at?: string;
        };
        Update: {
          calories_target?: number;
          protein_target_g?: number;
          carbs_target_g?: number;
          fat_target_g?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      foods_cached: {
        Row: {
          id: string;
          source: string;
          source_food_id: string;
          name: string;
          brand: string | null;
          serving_unit: string;
          serving_size: number;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          source?: string;
          source_food_id: string;
          name: string;
          brand?: string | null;
          serving_unit?: string;
          serving_size?: number;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          created_at?: string;
        };
        Update: {
          source?: string;
          source_food_id?: string;
          name?: string;
          brand?: string | null;
          serving_unit?: string;
          serving_size?: number;
          calories?: number;
          protein_g?: number;
          carbs_g?: number;
          fat_g?: number;
        };
        Relationships: [];
      };
      daily_logs: {
        Row: {
          id: string;
          user_id: string;
          log_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          log_date: string;
          created_at?: string;
        };
        Update: {
          log_date?: string;
        };
        Relationships: [];
      };
      log_entries: {
        Row: {
          id: string;
          user_id: string;
          daily_log_id: string;
          food_name_snapshot: string;
          brand_snapshot: string | null;
          quantity: number;
          unit: string;
          calories_snapshot: number;
          protein_g_snapshot: number;
          carbs_g_snapshot: number;
          fat_g_snapshot: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          daily_log_id: string;
          food_name_snapshot: string;
          brand_snapshot?: string | null;
          quantity: number;
          unit: string;
          calories_snapshot: number;
          protein_g_snapshot: number;
          carbs_g_snapshot: number;
          fat_g_snapshot: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          quantity?: number;
          calories_snapshot?: number;
          protein_g_snapshot?: number;
          carbs_g_snapshot?: number;
          fat_g_snapshot?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type FoodRow = Database["public"]["Tables"]["foods_cached"]["Row"];
export type GoalRow = Database["public"]["Tables"]["goals"]["Row"];
export type EntryRow = Database["public"]["Tables"]["log_entries"]["Row"];
