import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

interface AuthState {
  session: Session | null;
  /** True while the initial session check is still in flight. */
  loading: boolean;
}

/**
 * Tracks the current Supabase Auth session. On local mock data (no Cloud
 * connected yet) there's nothing to authenticate against, so this reports
 * `session: null, loading: false` immediately and the app just stays open -
 * access control only kicks in once Cloud (and its auth policies) are live.
 */
export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({
    session: null,
    loading: isSupabaseConfigured,
  });

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      setState({ session: data.session, loading: false });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, loading: false });
    });

    return () => subscription.unsubscribe();
  }, []);

  return state;
}
