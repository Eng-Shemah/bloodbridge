export type BloodType = "O+" | "O-" | "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-";

export const BLOOD_TYPES: BloodType[] = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];

export type Urgency = "low" | "medium" | "high" | "critical";

export const URGENCY_LEVELS: Urgency[] = ["low", "medium", "high", "critical"];

export type RequestStatus = "open" | "matched" | "fulfilled" | "cancelled";

export interface Donor {
  id: string;
  full_name: string;
  blood_type: BloodType;
  phone: string;
  location: string;
  last_donation_date: string | null;
  is_available: boolean;
  created_at: string;
}

export interface BloodRequest {
  id: string;
  requester_name: string;
  requester_type: "hospital" | "patient" | "individual";
  blood_type_needed: BloodType;
  units_needed: number;
  urgency: Urgency;
  location: string;
  status: RequestStatus;
  created_at: string;
}

export interface StockEntry {
  id: string;
  blood_bank_name: string;
  blood_type: BloodType;
  units_available: number;
  low_stock_threshold: number;
  updated_at: string;
}

export type StockChangeType = "donation_in" | "usage_out" | "adjustment";

export interface StockTransaction {
  id: string;
  blood_type: BloodType;
  change_type: StockChangeType;
  units: number;
  note: string | null;
  created_at: string;
}

/** A Donor plus derived matching info (distance, eligibility) for the Requests page. */
export interface MatchedDonor extends Donor {
  distanceKm: number | null;
}
