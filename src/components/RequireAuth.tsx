import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { isSupabaseConfigured } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Gates its children behind a signed-in session once Lovable Cloud is
 * enabled. While running on local mock data (no Cloud yet), there's no real
 * backend to protect, so everything stays open - this only starts enforcing
 * access once there's an actual database worth protecting.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (!isSupabaseConfigured) return <>{children}</>;

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 py-20 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Lock className="h-6 w-6" />
        </span>
        <h1 className="font-heading text-xl font-bold">Sign in required</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          This page manages real donor and patient data, so you'll need an account to view or edit
          it.
        </p>
        <Button asChild>
          <Link to="/login">Sign in</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
