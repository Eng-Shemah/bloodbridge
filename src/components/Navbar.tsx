import { Link } from "@tanstack/react-router";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/donors", label: "Donors" },
  { to: "/requests", label: "Requests" },
  { to: "/stock", label: "Stock" },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary">
          <span aria-hidden>🩸</span>
          <span>BloodBridge</span>
        </Link>
        <div className="flex gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "bg-primary text-primary-foreground" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
