import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValidUrl = (url: string | undefined): url is string => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
  console.warn('Supabase credentials not found or invalid. Please check your environment variables.');
}

export const supabase = (isValidUrl(supabaseUrl) && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * MIGRATION SQL (Run this in Supabase SQL Editor):
 * 
// 1. Update candidates table to support multi-tenancy and all features
// CREATE TABLE IF NOT EXISTS candidates (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   created_at TIMESTAMPTZ DEFAULT now(),
//   user_id UUID REFERENCES auth.users(id),
//   name TEXT NOT NULL,
//   email TEXT,
//   phone TEXT,
//   score FLOAT,
//   role TEXT,
//   status TEXT DEFAULT 'Em Análise',
//   analysis TEXT,
//   job_description TEXT,
//   experience_years TEXT,
//   file_name TEXT,
//   skills JSONB DEFAULT '[]'::jsonb,
//   strengths JSONB DEFAULT '[]'::jsonb,
//   attention_areas JSONB DEFAULT '[]'::jsonb,
//   tags JSONB DEFAULT '[]'::jsonb
// );
// 
// -- Enable RLS
// ALTER TABLE candidates ENABLE ROW LEVEL SECURITY;
// 
// -- Create RLS Policies
// CREATE POLICY "Users can only see their own candidates" ON candidates FOR SELECT USING (auth.uid() = user_id);
// CREATE POLICY "Users can only insert their own candidates" ON candidates FOR INSERT WITH CHECK (auth.uid() = user_id);
// CREATE POLICY "Users can only update their own candidates" ON candidates FOR UPDATE USING (auth.uid() = user_id);
// CREATE POLICY "Users can only delete their own candidates" ON candidates FOR DELETE USING (auth.uid() = user_id);
// 
// -- Repeat for jobs table
// CREATE TABLE IF NOT EXISTS jobs (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   created_at TIMESTAMPTZ DEFAULT now(),
//   user_id UUID REFERENCES auth.users(id),
//   title TEXT,
//   description TEXT
// );
// ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Users can only see their own jobs" ON jobs FOR SELECT USING (auth.uid() = user_id);
// CREATE POLICY "Users can only insert their own jobs" ON jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
 */
