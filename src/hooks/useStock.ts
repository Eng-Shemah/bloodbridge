import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adjustStock, listStock, listStockTransactions, recordDonation } from "@/lib/dataStore";
import { donorsKey } from "@/hooks/useDonors";
import type { BloodType, Donor, StockChangeType } from "@/types";

export const stockKey = ["stock"] as const;
export const stockTransactionsKey = ["stockTransactions"] as const;

export function useStock() {
  return useQuery({ queryKey: stockKey, queryFn: listStock });
}

export function useStockTransactions() {
  return useQuery({ queryKey: stockTransactionsKey, queryFn: () => listStockTransactions() });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      bloodType,
      delta,
      changeType,
      note,
    }: {
      bloodType: BloodType;
      delta: number;
      changeType?: StockChangeType;
      note?: string;
    }) => adjustStock(bloodType, delta, changeType, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockKey });
      queryClient.invalidateQueries({ queryKey: stockTransactionsKey });
    },
  });
}

/** Records a donor's donation: starts their cooldown and adds to stock. */
export function useRecordDonation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ donor, units }: { donor: Donor; units?: number }) =>
      recordDonation(donor, units),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donorsKey });
      queryClient.invalidateQueries({ queryKey: stockKey });
      queryClient.invalidateQueries({ queryKey: stockTransactionsKey });
    },
  });
}
