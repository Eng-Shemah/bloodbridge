import { createFileRoute } from "@tanstack/react-router";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { Users } from "lucide-react";
import { useAddDonor, useDeleteDonor, useDonors, useSetDonorAvailability } from "@/hooks/useDonors";
import { daysUntilEligible, isDonorEligible } from "@/lib/eligibility";
import { BLOOD_TYPES, type BloodType, type Donor } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const Route = createFileRoute("/donors")({
  component: Donors,
});

const emptyForm = {
  full_name: "",
  blood_type: "O+" as BloodType,
  phone: "",
  location: "",
};

function Donors() {
  const { data: donors = [], isLoading: loading } = useDonors();
  const addDonorMutation = useAddDonor();
  const setAvailabilityMutation = useSetDonorAvailability();
  const deleteDonorMutation = useDeleteDonor();

  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<BloodType | "all">("all");
  const [pendingDelete, setPendingDelete] = useState<Donor | null>(null);

  const filteredDonors = useMemo(() => {
    const q = search.trim().toLowerCase();
    return donors.filter((d) => {
      const matchesType = typeFilter === "all" || d.blood_type === typeFilter;
      const matchesSearch =
        !q ||
        d.full_name.toLowerCase().includes(q) ||
        d.phone.includes(q) ||
        d.location.toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [donors, search, typeFilter]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.full_name || !form.phone || !form.location) return;
    try {
      await addDonorMutation.mutateAsync({
        full_name: form.full_name,
        blood_type: form.blood_type,
        phone: form.phone,
        location: form.location,
        last_donation_date: null,
        is_available: true,
      });
      toast.success(`${form.full_name} registered as a donor`);
      setForm(emptyForm);
    } catch {
      toast.error("Couldn't register donor — try again");
    }
  }

  function toggleAvailability(donor: Donor) {
    setAvailabilityMutation.mutate({ id: donor.id, isAvailable: !donor.is_available });
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    const name = pendingDelete.full_name;
    await deleteDonorMutation.mutateAsync(pendingDelete.id);
    setPendingDelete(null);
    toast(`${name} removed`);
  }

  const submitting = addDonorMutation.isPending;

  return (
    <div className="space-y-6">
      <h1 className="stagger-in font-heading text-xl font-bold">Donors</h1>

      <Card
        className="stagger-in hover-lift"
        style={{ "--stagger-delay": "60ms" } as React.CSSProperties}
      >
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
            <div className="font-semibold sm:col-span-2">Register as a donor</div>
            <Input
              placeholder="Full name"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
            />
            <Select
              value={form.blood_type}
              onValueChange={(v) => setForm({ ...form, blood_type: v as BloodType })}
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
              placeholder="Phone number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <Input
              placeholder="Location (e.g. Kigali - Kicukiro)"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              required
            />
            <Button
              type="submit"
              disabled={submitting}
              className="transition-transform sm:col-span-2 active:scale-[0.98]"
            >
              {submitting ? "Registering…" : "Register donor"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div
        className="stagger-in flex flex-wrap items-center gap-2"
        style={{ "--stagger-delay": "110ms" } as React.CSSProperties}
      >
        <Input
          className="min-w-[180px] flex-1"
          placeholder="Search by name, phone, or location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as BloodType | "all")}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All blood types</SelectItem>
            {BLOOD_TYPES.map((bt) => (
              <SelectItem key={bt} value={bt}>
                {bt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="stagger-in" style={{ "--stagger-delay": "160ms" } as React.CSSProperties}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Eligibility</TableHead>
              <TableHead>Available</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full max-w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <>
                {filteredDonors.map((d) => {
                  const eligible = isDonorEligible(d);
                  const waitDays = daysUntilEligible(d);
                  return (
                    <TableRow key={d.id} className="transition-colors">
                      <TableCell className="font-medium">{d.full_name}</TableCell>
                      <TableCell className="font-semibold text-primary">{d.blood_type}</TableCell>
                      <TableCell>{d.phone}</TableCell>
                      <TableCell>{d.location}</TableCell>
                      <TableCell>
                        {eligible ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/40 dark:text-green-400">
                            Eligible
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-400">
                            Wait {waitDays}d
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <button onClick={() => toggleAvailability(d)}>
                          <Badge
                            variant={d.is_available ? "default" : "secondary"}
                            className="cursor-pointer transition-transform active:scale-95"
                          >
                            {d.is_available ? "Available" : "Unavailable"}
                          </Badge>
                        </button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setPendingDelete(d)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredDonors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-6 w-6 opacity-40" />
                        {donors.length === 0
                          ? "No donors registered yet."
                          : "No donors match your search."}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </Card>

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Remove donor?"
        description={
          pendingDelete
            ? `${pendingDelete.full_name} will be removed from the donor list. This can't be undone.`
            : ""
        }
        confirmLabel="Remove"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}
