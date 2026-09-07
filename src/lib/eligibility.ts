import type { Donor } from "@/types";

/** Standard whole-blood donation interval: 56 days (8 weeks) between donations. */
export const DONATION_COOLDOWN_DAYS = 56;

function daysSince(dateStr: string): number {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

/** True if the donor's last donation (if any) was more than the cooldown period ago. */
export function isDonorEligible(donor: Pick<Donor, "last_donation_date">): boolean {
  if (!donor.last_donation_date) return true;
  return daysSince(donor.last_donation_date) >= DONATION_COOLDOWN_DAYS;
}

/** Days remaining until the donor is eligible again (0 if already eligible). */
export function daysUntilEligible(donor: Pick<Donor, "last_donation_date">): number {
  if (!donor.last_donation_date) return 0;
  const remaining = DONATION_COOLDOWN_DAYS - daysSince(donor.last_donation_date);
  return Math.max(0, remaining);
}
