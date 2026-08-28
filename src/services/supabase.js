import { createClient } from '@supabase/supabase-js';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {});
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

let origin = null;
try {
  if (supabaseUrl) {
    origin = new URL(supabaseUrl).origin;
  }
} catch (e) {}

console.log("[SUPABASE CONFIG]", {
  urlConfigured: Boolean(supabaseUrl),
  keyConfigured: Boolean(supabaseAnonKey),
  origin
});

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Create single Supabase client instance
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
