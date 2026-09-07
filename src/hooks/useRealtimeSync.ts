import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { donorsKey } from "@/hooks/useDonors";
import { requestsKey } from "@/hooks/useRequests";
import { stockKey, stockTransactionsKey } from "@/hooks/useStock";

/**
 * Subscribes to Postgres changes on every BloodBridge table (once Lovable
 * Cloud is enabled) and invalidates the matching React Query cache, so every
 * open tab/device reflects a change within moments - no polling, no manual
 * refresh. A no-op while running on local mock data.
 *
 * Requires the tables to be added to Supabase's `supabase_realtime`
 * publication (see supabase/migrations/20260907200000_enable_realtime.sql) -
 * if that hasn't been run yet, this simply never fires, no different from
 * before.
 */
export function useRealtimeSync(queryClient: QueryClient): void {
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel("bloodbridge-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "donors" }, () =>
        queryClient.invalidateQueries({ queryKey: donorsKey }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "blood_requests" }, () =>
        queryClient.invalidateQueries({ queryKey: requestsKey }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "blood_stock" }, () =>
        queryClient.invalidateQueries({ queryKey: stockKey }),
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "stock_transactions" }, () =>
        queryClient.invalidateQueries({ queryKey: stockTransactionsKey }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
