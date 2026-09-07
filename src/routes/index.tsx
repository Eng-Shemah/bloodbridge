import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listDonors, listRequests, listStock } from "@/lib/dataStore";
import type { BloodRequest, Donor, StockEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [stock, setStock] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([listDonors(), listRequests(), listStock()])
      .then(([d, r, s]) => {
        setDonors(d);
        setRequests(r);
        setStock(s);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted-foreground">Loading dashboard…</p>;

  const availableDonors = donors.filter((d) => d.is_available).length;
  const openRequests = requests.filter((r) => r.status === "open").length;
  const criticalRequests = requests.filter((r) => r.status === "open" && r.urgency === "critical");
  const lowStock = stock.filter((s) => s.units_available <= s.low_stock_threshold);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Registered donors" value={donors.length} />
        <StatCard label="Available donors" value={availableDonors} />
        <StatCard
          label="Open requests"
          value={openRequests}
          tone={openRequests > 0 ? "warning" : "default"}
        />
        <StatCard
          label="Low-stock types"
          value={lowStock.length}
          tone={lowStock.length > 0 ? "danger" : "default"}
        />
      </div>

      {criticalRequests.length > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">🚨 Critical open requests</CardTitle>
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

      {lowStock.length > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-amber-600 dark:text-amber-400">⚠️ Low stock</CardTitle>
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
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "danger" | "warning";
}) {
  const toneClass =
    tone === "danger"
      ? "text-destructive"
      : tone === "warning"
        ? "text-amber-600 dark:text-amber-400"
        : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className={`mt-1 text-2xl font-bold ${toneClass}`}>{value}</div>
      </CardContent>
    </Card>
  );
}
