import { createClient } from '@supabase/supabase-js'

// Create a .env.local file with these two values:
// VITE_SUPABASE_URL=https://xxxx.supabase.co
// VITE_SUPABASE_ANON_KEY=eyJh...

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/*
  Run this SQL in your Supabase SQL editor:

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

  Then in Supabase dashboard → Authentication → Policies:
  Enable Row Level Security and add:
  - INSERT policy: allow all (for guest submissions)
  - SELECT policy: allow all (or restrict by role for admin)
*/
