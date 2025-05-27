"use client";

// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';

// Default to a valid URL structure if environment variables are not set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://example.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or Anon Key not provided in environment variables. Using placeholder values for development.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
