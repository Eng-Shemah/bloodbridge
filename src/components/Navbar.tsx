import { Link } from "@tanstack/react-router";
import { Droplet } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabaseClient";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/donors", label: "Donors" },
  { to: "/requests", label: "Requests" },
  { to: "/stock", label: "Stock" },
];

export function Navbar() {
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
        <div className="flex gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-primary text-primary-foreground shadow-sm" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
