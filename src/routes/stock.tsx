import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { adjustStock, listStock, listStockTransactions } from "@/lib/dataStore";
import type { BloodType, StockEntry, StockTransaction } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/stock")({
  component: Stock,
});

const changeLabel: Record<StockTransaction["change_type"], string> = {
  donation_in: "Donation in",
  usage_out: "Usage out",
  adjustment: "Manual adjustment",
};

function Stock() {
  const [stock, setStock] = useState<StockEntry[]>([]);
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  function refresh() {
    return Promise.all([listStock().then(setStock), listStockTransactions().then(setTransactions)]);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function handleAdjust(bloodType: BloodType, delta: number) {
    await adjustStock(
      bloodType,
      delta,
      delta > 0 ? "donation_in" : "usage_out",
      "Manual stock adjustment",
    );
    await refresh();
    toast.success(`${bloodType} stock ${delta > 0 ? "+1" : "-1"}`);
  }

  if (loading) return <p className="text-muted-foreground">Loading stock…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Blood Stock</h1>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Blood bank</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Units available</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Adjust</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stock.map((s) => {
              const isLow = s.units_available <= s.low_stock_threshold;
              return (
                <TableRow key={s.id}>
                  <TableCell>{s.blood_bank_name}</TableCell>
                  <TableCell className="font-semibold text-primary">{s.blood_type}</TableCell>
                  <TableCell>{s.units_available}</TableCell>
                  <TableCell>
                    {isLow ? (
                      <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-400">
                        Low stock
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-400">
                        OK
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                      onClick={() => handleAdjust(s.blood_type, 1)}
                      title="Log a donation in"
                    >
                      +1 in
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={s.units_available <= 0}
                      onClick={() => handleAdjust(s.blood_type, -1)}
                      title="Log usage out"
                    >
                      -1 out
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <div>
        <h2 className="mb-2 font-semibold">Recent activity</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No stock movements logged yet.</p>
        ) : (
          <Card className="divide-y">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex justify-between px-4 py-2 text-sm">
                <span>
                  <span className="font-medium text-primary">{tx.blood_type}</span>{" "}
                  {changeLabel[tx.change_type]} ({tx.units > 0 ? "+" : ""}
                  {tx.units}){tx.note ? ` — ${tx.note}` : ""}
                </span>
                <span className="text-muted-foreground">
                  {new Date(tx.created_at).toLocaleString()}
                </span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
