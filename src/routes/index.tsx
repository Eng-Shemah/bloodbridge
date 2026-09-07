import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Droplet, HeartPulse, Siren, Users } from "lucide-react";
import { useDonors } from "@/hooks/useDonors";
import { useRequests } from "@/hooks/useRequests";
import { useStock } from "@/hooks/useStock";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: donors = [], isLoading: loadingDonors } = useDonors();
  const { data: requests = [], isLoading: loadingRequests } = useRequests();
  const { data: stock = [], isLoading: loadingStock } = useStock();

  const loading = loadingDonors || loadingRequests || loadingStock;

  const availableDonors = donors.filter((d) => d.is_available).length;
  const openRequests = requests.filter((r) => r.status === "open").length;
  const criticalRequests = requests.filter((r) => r.status === "open" && r.urgency === "critical");
  const lowStock = stock.filter((s) => s.units_available <= s.low_stock_threshold);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Droplet className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Live overview of donors, requests, and stock.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="Registered donors" value={donors.length} loading={loading} />
        <StatCard
          icon={HeartPulse}
          label="Available donors"
          value={availableDonors}
          loading={loading}
        />
        <StatCard
          icon={Siren}
          label="Open requests"
          value={openRequests}
          tone={openRequests > 0 ? "warning" : "default"}
          loading={loading}
        />
        <StatCard
          icon={AlertTriangle}
          label="Low-stock types"
          value={lowStock.length}
          tone={lowStock.length > 0 ? "danger" : "default"}
          loading={loading}
        />
      </div>

      {!loading && criticalRequests.length > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Siren className="h-4 w-4" /> Critical open requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-destructive">
              {criticalRequests.map((r) => (
                <li key={r.id}>
                  {r.blood_type_needed} — {r.units_needed} unit(s) for {r.requester_name} (
                  {r.location})
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {!loading && lowStock.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" /> Low stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1 text-sm text-amber-700 dark:text-amber-400">
              {lowStock.map((s) => (
                <li key={s.id}>
                  {s.blood_type}: {s.units_available} unit(s) left at {s.blood_bank_name}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone = "default",
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  tone?: "default" | "danger" | "warning";
  loading?: boolean;
}) {
  const toneClass =
    tone === "danger"
      ? "text-destructive"
      : tone === "warning"
        ? "text-amber-600 dark:text-amber-400"
        : "text-foreground";
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-10" />
          ) : (
            <div className={`mt-1 text-2xl font-bold ${toneClass}`}>{value}</div>
          )}
        </div>
        <Icon className={`h-4 w-4 ${toneClass} opacity-60`} />
      </CardContent>
    </Card>
  );
}
