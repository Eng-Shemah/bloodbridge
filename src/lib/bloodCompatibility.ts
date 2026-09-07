import type { BloodType } from "@/types";

/**
 * Standard blood donation compatibility rules.
 * Key = donor type, value = recipient types that donor type can safely give to.
 */
const DONOR_CAN_GIVE_TO: Record<BloodType, BloodType[]> = {
  "O-": ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"], // universal donor
  "O+": ["O+", "A+", "B+", "AB+"],
  "A-": ["A-", "A+", "AB-", "AB+"],
  "A+": ["A+", "AB+"],
  "B-": ["B-", "B+", "AB-", "AB+"],
  "B+": ["B+", "AB+"],
  "AB-": ["AB-", "AB+"],
  "AB+": ["AB+"], // can only give to AB+
};

/** Given a recipient's blood type, return every donor blood type compatible with them. */
export function getCompatibleDonorTypes(recipientType: BloodType): BloodType[] {
  return (Object.keys(DONOR_CAN_GIVE_TO) as BloodType[]).filter((donorType) =>
    DONOR_CAN_GIVE_TO[donorType].includes(recipientType),
  );
}

/** True if a donor of `donorType` can safely donate to a recipient needing `recipientType`. */
export function isCompatible(donorType: BloodType, recipientType: BloodType): boolean {
  return DONOR_CAN_GIVE_TO[donorType].includes(recipientType);
}
