import { Link, useNavigate } from "@tanstack/react-router";
import { Droplet, LogOut } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const appNavItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/donors", label: "Donors" },
  { to: "/requests", label: "Requests" },
  { to: "/stock", label: "Stock" },
];

export function Navbar() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const signedIn = !isSupabaseConfigured || Boolean(session);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <nav className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <Droplet className="float-y h-5 w-5 fill-primary text-primary" aria-hidden />
          <span className="text-gradient-primary font-heading">BloodBridge</span>
          {isSupabaseConfigured && (
            <span
              title="Connected to Lovable Cloud - live updates enabled"
              className="ml-1 hidden items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-green-600 sm:flex dark:text-green-400"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              Live
            </span>
          )}
        </Link>
        <div className="flex items-center gap-1">
          {signedIn &&
            appNavItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "bg-primary text-primary-foreground shadow-sm" }}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
              >
                {item.label}
              </Link>
            ))}
          {!loading && isSupabaseConfigured && (
            <>
              {session ? (
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="ml-1 gap-1.5">
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </Button>
              ) : (
                <Button asChild size="sm" className="ml-1">
                  <Link to="/login">Sign in</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
