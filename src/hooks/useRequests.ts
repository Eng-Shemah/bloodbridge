import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addRequest, listRequests, setRequestStatus } from "@/lib/dataStore";
import type { BloodRequest, RequestStatus } from "@/types";

export const requestsKey = ["requests"] as const;

export function useRequests() {
  return useQuery({ queryKey: requestsKey, queryFn: listRequests });
}

export function useAddRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<BloodRequest, "id" | "created_at" | "status">) => addRequest(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestsKey }),
  });
}

export function useSetRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      setRequestStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: requestsKey }),
  });
}
