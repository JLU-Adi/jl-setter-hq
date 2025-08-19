import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_DATA_URL || '';
const supabaseAnonKey = import.meta.env.VITE_DATA_ANON || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
  id: string;
  email: string;
  created_at: string;
};