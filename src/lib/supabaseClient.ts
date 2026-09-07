import { createClient } from "@supabase/supabase-js";

const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const anonKey = import.meta.env["VITE_SUPABASE_ANON_KEY"] as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

// When VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY aren't set yet (Lovable Cloud not
// enabled), this client is never used — dataStore.ts falls back to localStorage.
export const supabase = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;
