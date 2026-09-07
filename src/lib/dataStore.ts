import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { getCompatibleDonorTypes } from "@/lib/bloodCompatibility";
import { getDistanceKm } from "@/lib/locations";
import type {
  BloodRequest,
  BloodType,
  Donor,
  MatchedDonor,
  RequestStatus,
  StockChangeType,
  StockEntry,
  StockTransaction,
} from "@/types";

/**
 * Data layer for BloodBridge.
 *
 * Until Lovable Cloud (Supabase) is enabled, every function here reads/writes
 * localStorage instead, seeded with sample data so the app is fully usable
 * during development. Once VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are
 * set, the same functions talk to Postgres — pages never need to know which
 * backend is active.
 */

const LS_DONORS = "bloodbridge_donors";
const LS_REQUESTS = "bloodbridge_requests";
const LS_STOCK = "bloodbridge_stock";
const LS_STOCK_TX = "bloodbridge_stock_transactions";

function uid(): string {
  return crypto.randomUUID();
}

function readLS<T>(key: string, seed: T): T {
  if (typeof localStorage === "undefined") return seed;
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return seed;
  }
}

function writeLS<T>(key: string, value: T): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function seedDonors(): Donor[] {
  const now = new Date().toISOString();
  return [
    {
      id: uid(),
      full_name: "Alice Uwase",
      blood_type: "O-",
      phone: "0788000001",
      location: "Kigali - Kicukiro",
      last_donation_date: null,
      is_available: true,
      created_at: now,
    },
    {
      id: uid(),
      full_name: "Eric Niyonsenga",
      blood_type: "A+",
      phone: "0788000002",
      location: "Kigali - Gasabo",
      last_donation_date: null,
      is_available: true,
      created_at: now,
    },
    {
      id: uid(),
      full_name: "Grace Mukamana",
      blood_type: "B+",
      phone: "0788000003",
      location: "Kigali - Nyarugenge",
      last_donation_date: null,
      is_available: false,
      created_at: now,
    },
  ];
}

function seedStock(): StockEntry[] {
  const now = new Date().toISOString();
  return (["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"] as BloodType[]).map((bt) => ({
    id: uid(),
    blood_bank_name: "Kigali Central Blood Bank",
    blood_type: bt,
    units_available: bt === "O-" || bt === "AB-" ? 3 : 12,
    low_stock_threshold: 5,
    updated_at: now,
  }));
}

// ---------- Donors ----------

export async function listDonors(): Promise<Donor[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("donors")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as Donor[];
  }
  return readLS(LS_DONORS, seedDonors());
}

export async function addDonor(input: Omit<Donor, "id" | "created_at">): Promise<Donor> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from("donors").insert(input).select().single();
    if (error) throw error;
    return data as Donor;
  }
  const donors = readLS(LS_DONORS, seedDonors());
  const donor: Donor = { ...input, id: uid(), created_at: new Date().toISOString() };
  const updated = [donor, ...donors];
  writeLS(LS_DONORS, updated);
  return donor;
}

export async function setDonorAvailability(id: string, is_available: boolean): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("donors").update({ is_available }).eq("id", id);
    if (error) throw error;
    return;
  }
  const donors = readLS(LS_DONORS, seedDonors());
  writeLS(
    LS_DONORS,
    donors.map((d) => (d.id === id ? { ...d, is_available } : d)),
  );
}

export async function deleteDonor(id: string): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("donors").delete().eq("id", id);
    if (error) throw error;
    return;
  }
  const donors = readLS(LS_DONORS, seedDonors());
  writeLS(
    LS_DONORS,
    donors.filter((d) => d.id !== id),
  );
}

// ---------- Requests ----------

export async function listRequests(): Promise<BloodRequest[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("blood_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data as BloodRequest[];
  }
  return readLS(LS_REQUESTS, [] as BloodRequest[]);
}

export async function addRequest(
  input: Omit<BloodRequest, "id" | "created_at" | "status">,
): Promise<BloodRequest> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("blood_requests")
      .insert({ ...input, status: "open" })
      .select()
      .single();
    if (error) throw error;
    return data as BloodRequest;
  }
  const requests = readLS(LS_REQUESTS, [] as BloodRequest[]);
  const request: BloodRequest = {
    ...input,
    id: uid(),
    status: "open",
    created_at: new Date().toISOString(),
  };
  writeLS(LS_REQUESTS, [request, ...requests]);
  return request;
}

export async function setRequestStatus(id: string, status: RequestStatus): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from("blood_requests").update({ status }).eq("id", id);
    if (error) throw error;
    return;
  }
  const requests = readLS(LS_REQUESTS, [] as BloodRequest[]);
  writeLS(
    LS_REQUESTS,
    requests.map((r) => (r.id === id ? { ...r, status } : r)),
  );
}

/** Compatible, available donors for a given request, closest known distance first. */
export async function findMatchingDonors(request: BloodRequest): Promise<MatchedDonor[]> {
  const donors = await listDonors();
  const compatibleTypes = getCompatibleDonorTypes(request.blood_type_needed);
  return donors
    .filter((d) => d.is_available && compatibleTypes.includes(d.blood_type))
    .map((d) => ({ ...d, distanceKm: getDistanceKm(d.location, request.location) }))
    .sort((a, b) => {
      // Known distances sort first (closest wins); unknown distances fall back to
      // an exact location-string match, then keep insertion order.
      if (a.distanceKm !== null && b.distanceKm !== null) return a.distanceKm - b.distanceKm;
      if (a.distanceKm !== null) return -1;
      if (b.distanceKm !== null) return 1;
      const aSameLocation = a.location === request.location ? 0 : 1;
      const bSameLocation = b.location === request.location ? 0 : 1;
      return aSameLocation - bSameLocation;
    });
}

// ---------- Stock ----------

export async function listStock(): Promise<StockEntry[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("blood_stock")
      .select("*")
      .order("blood_type", { ascending: true });
    if (error) throw error;
    return data as StockEntry[];
  }
  return readLS(LS_STOCK, seedStock());
}

/**
 * Adjust units for a blood type (positive = units added, negative = units removed)
 * and log the movement to stock_transactions. `changeType` categorizes why:
 * 'donation_in' (a donor gave blood), 'usage_out' (dispensed to a patient), or
 * 'adjustment' (manual correction).
 */
export async function adjustStock(
  bloodType: BloodType,
  unitsDelta: number,
  changeType: StockChangeType = "adjustment",
  note?: string,
): Promise<StockEntry> {
  if (isSupabaseConfigured && supabase) {
    const { data: existing, error: fetchError } = await supabase
      .from("blood_stock")
      .select("*")
      .eq("blood_type", bloodType)
      .single();
    if (fetchError) throw fetchError;
    const newUnits = Math.max(0, existing.units_available + unitsDelta);
    const { data, error } = await supabase
      .from("blood_stock")
      .update({ units_available: newUnits, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();
    if (error) throw error;
    await supabase.from("stock_transactions").insert({
      stock_id: existing.id,
      change_type: changeType,
      units: unitsDelta,
      note: note ?? null,
    });
    return data as StockEntry;
  }
  const stock = readLS(LS_STOCK, seedStock());
  let updatedEntry: StockEntry | undefined;
  const updated = stock.map((s) => {
    if (s.blood_type === bloodType) {
      updatedEntry = {
        ...s,
        units_available: Math.max(0, s.units_available + unitsDelta),
        updated_at: new Date().toISOString(),
      };
      return updatedEntry;
    }
    return s;
  });
  writeLS(LS_STOCK, updated);

  const transactions = readLS(LS_STOCK_TX, [] as StockTransaction[]);
  const tx: StockTransaction = {
    id: uid(),
    blood_type: bloodType,
    change_type: changeType,
    units: unitsDelta,
    note: note ?? null,
    created_at: new Date().toISOString(),
  };
  writeLS(LS_STOCK_TX, [tx, ...transactions]);

  return updatedEntry as StockEntry;
}

/** Most recent stock movements first, for the Stock page's activity log. */
export async function listStockTransactions(limit = 20): Promise<StockTransaction[]> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from("stock_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as StockTransaction[];
  }
  const transactions = readLS(LS_STOCK_TX, [] as StockTransaction[]);
  return transactions.slice(0, limit);
}

/**
 * Record a donor's donation: starts their cooldown (last_donation_date = today)
 * and adds the donated units to that blood type's stock as a 'donation_in' movement.
 */
export async function recordDonation(donor: Donor, units = 1): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from("donors")
      .update({ last_donation_date: today })
      .eq("id", donor.id);
    if (error) throw error;
  } else {
    const donors = readLS(LS_DONORS, seedDonors());
    writeLS(
      LS_DONORS,
      donors.map((d) => (d.id === donor.id ? { ...d, last_donation_date: today } : d)),
    );
  }

  await adjustStock(donor.blood_type, units, "donation_in", `Donation by ${donor.full_name}`);
}
