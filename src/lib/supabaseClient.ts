// Lovable Cloud generates its own typed Supabase client (env-aware for both
// client and SSR, with auth storage wired for the Lovable preview iframe) at
// src/integrations/supabase/client.ts — re-exporting it here instead of
// hand-rolling a second client instance keeps auth/session state consistent.
export { supabase } from "@/integrations/supabase/client";

// Lovable Cloud's env vars use "PUBLISHABLE_KEY" (their newer opaque API key
// format), not the older "ANON_KEY" naming.
export const isSupabaseConfigured = Boolean(
  import.meta.env["VITE_SUPABASE_URL"] && import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"],
);
