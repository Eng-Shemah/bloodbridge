import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDonor, deleteDonor, listDonors, setDonorAvailability } from "@/lib/dataStore";
import type { Donor } from "@/types";

export const donorsKey = ["donors"] as const;

export function useDonors() {
  return useQuery({ queryKey: donorsKey, queryFn: listDonors });
}

export function useAddDonor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<Donor, "id" | "created_at">) => addDonor(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: donorsKey }),
  });
}

export function useSetDonorAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      setDonorAvailability(id, isAvailable),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: donorsKey }),
  });
}

export function useDeleteDonor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDonor(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: donorsKey }),
  });
}
