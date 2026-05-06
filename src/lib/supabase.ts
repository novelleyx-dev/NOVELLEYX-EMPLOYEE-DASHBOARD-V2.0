import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase URL and Anon Key
// You can find them in your Supabase Project Settings > API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
