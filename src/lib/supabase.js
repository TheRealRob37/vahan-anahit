import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// Create a .env.local file in the project root with:
// VITE_SUPABASE_URL=https://your-project.supabase.co
// VITE_SUPABASE_ANON_KEY=your-anon-key-here

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Initialize Supabase client for database operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/*
  Database Setup Instructions:

  1. Create table in Supabase SQL Editor:
  CREATE TABLE rsvp_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    attending TEXT NOT NULL CHECK (attending IN ('yes', 'no')),
    host TEXT NOT NULL CHECK (host IN ('anahit', 'vahan')),
    guests INTEGER NOT NULL,
    name1 TEXT NOT NULL,
    surname1 TEXT NOT NULL,
    name2 TEXT,
    surname2 TEXT
  );

  2. Enable Row Level Security in Authentication → Policies:
  - INSERT: Allow all (for guest RSVP submissions)
  - SELECT: Allow all (for admin dashboard access)
*/
