import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  addRequest,
  findMatchingDonors,
  listRequests,
  recordDonation,
  setRequestStatus,
} from "@/lib/dataStore";
import { isDonorEligible } from "@/lib/eligibility";
import {
  BLOOD_TYPES,
  URGENCY_LEVELS,
  type BloodRequest,
  type BloodType,
  type MatchedDonor,
  type RequestStatus,
  type Urgency,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/requests")({
  component: Requests,
});

const emptyForm = {
  requester_name: "",
  requester_type: "hospital" as BloodRequest["requester_type"],
  blood_type_needed: "O+" as BloodType,
  units_needed: 1,
  urgency: "medium" as Urgency,
  location: "",
};

const urgencyClass: Record<Urgency, string> = {
  low: "bg-muted text-muted-foreground hover:bg-muted",
  medium: "bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-400",
  high: "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400",
  critical: "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-400",
};

const STATUS_FILTERS: (RequestStatus | "all")[] = ["all", "open", "fulfilled", "cancelled"];

function Requests() {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [matches, setMatches] = useState<Record<string, MatchedDonor[]>>({});
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | "all">("all");

  function refresh() {
    return listRequests().then(setRequests);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const filteredRequests = useMemo(
    () => (statusFilter === "all" ? requests : requests.filter((r) => r.status === statusFilter)),
    [requests, statusFilter],
  );

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.requester_name || !form.location) return;
    setSubmitting(true);
    try {
      await addRequest(form);
      setForm(emptyForm);
      await refresh();
      toast.success("Request posted");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFindMatches(request: BloodRequest) {
    const found = await findMatchingDonors(request);
    setMatches((prev) => ({ ...prev, [request.id]: found }));
  }

  async function handleMarkFulfilled(id: string) {
    await setRequestStatus(id, "fulfilled");
    await refresh();
    toast.success("Request marked fulfilled");
  }

  async function handleCancel(id: string) {
    if (!confirm("Cancel this request?")) return;
    await setRequestStatus(id, "cancelled");
    await refresh();
    toast("Request cancelled");
  }

  async function handleConfirmDonation(request: BloodRequest, donor: MatchedDonor) {
    setConfirmingId(donor.id);
    try {
      await recordDonation(donor, request.units_needed);
      await handleFindMatches(request); // refresh so the donor's new eligibility shows
      toast.success(`Recorded ${donor.full_name}'s donation — added to ${donor.blood_type} stock`);
    } finally {
      setConfirmingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Blood Requests</h1>

      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <div className="font-semibold sm:col-span-2">Post a request</div>
            <Input
              placeholder="Hospital / patient name"
              value={form.requester_name}
              onChange={(e) => setForm({ ...form, requester_name: e.target.value })}
              required
            />
            <Select
              value={form.requester_type}
              onValueChange={(v) =>
                setForm({ ...form, requester_type: v as BloodRequest["requester_type"] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hospital">Hospital</SelectItem>
                <SelectItem value="patient">Patient</SelectItem>
                <SelectItem value="individual">Individual (on behalf of someone)</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={form.blood_type_needed}
              onValueChange={(v) => setForm({ ...form, blood_type_needed: v as BloodType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BLOOD_TYPES.map((bt) => (
                  <SelectItem key={bt} value={bt}>
                    {bt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              placeholder="Units needed"
              value={form.units_needed}
              onChange={(e) => setForm({ ...form, units_needed: Number(e.target.value) })}
            />
            <Select
              value={form.urgency}
              onValueChange={(v) => setForm({ ...form, urgency: v as Urgency })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {URGENCY_LEVELS.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
            <Button type="submit" disabled={submitting} className="sm:col-span-2">
              {submitting ? "Posting…" : "Post request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as RequestStatus | "all")}>
        <TabsList>
          {STATUS_FILTERS.map((s) => (
            <TabsTrigger key={s} value={s} className="capitalize">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <p className="text-muted-foreground">Loading requests…</p>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-semibold text-primary">{r.blood_type_needed}</span>{" "}
                    <span>
                      · {r.units_needed} unit(s) for {r.requester_name} ({r.requester_type})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={urgencyClass[r.urgency]}>{r.urgency}</Badge>
                    <Badge variant="secondary">{r.status}</Badge>
                  </div>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{r.location}</div>

                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleFindMatches(r)}>
                    Find matching donors
                  </Button>
                  {r.status === "open" && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleMarkFulfilled(r.id)}>
                        Mark fulfilled
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleCancel(r.id)}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>

                {matches[r.id] && (
                  <div className="mt-3 space-y-2 border-t pt-3">
                    {matches[r.id]!.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No compatible available donors found yet.
                      </p>
                    ) : (
                      <ul className="space-y-2 text-sm">
                        {matches[r.id]!.map((d) => {
                          const eligible = isDonorEligible(d);
                          return (
                            <li
                              key={d.id}
                              className="flex flex-wrap items-center justify-between gap-2"
                            >
                              <span>
                                {d.full_name} — <span className="font-medium">{d.blood_type}</span>
                                <span className="text-muted-foreground">
                                  {" "}
                                  · {d.location} · {d.phone}
                                  {d.distanceKm !== null && ` · ~${d.distanceKm} km away`}
                                </span>
                              </span>
                              <Button
                                size="sm"
                                disabled={!eligible || confirmingId === d.id || r.status !== "open"}
                                title={
                                  !eligible
                                    ? "Donor is still in their post-donation cooldown"
                                    : undefined
                                }
                                onClick={() => handleConfirmDonation(r, d)}
                              >
                                {confirmingId === d.id ? "Recording…" : "Confirm donation"}
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {filteredRequests.length === 0 && (
            <p className="text-muted-foreground">
              {requests.length === 0 ? "No requests posted yet." : `No ${statusFilter} requests.`}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
