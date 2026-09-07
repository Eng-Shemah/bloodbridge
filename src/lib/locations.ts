/**
 * Approximate coordinates for known locations, used to sort matching donors
 * by distance. Free-text locations not in this table simply get no distance
 * (falls back to same-location-string tie-breaking in dataStore.ts).
 */
const KNOWN_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  "kigali - kicukiro": { lat: -1.9706, lng: 30.1044 },
  "kigali - gasabo": { lat: -1.9358, lng: 30.1131 },
  "kigali - nyarugenge": { lat: -1.9536, lng: 30.0605 },
  "kigali central blood bank": { lat: -1.95, lng: 30.0588 },
  "kigali referral hospital": { lat: -1.9598, lng: 30.0925 },
};

function normalize(location: string): string {
  return location.trim().toLowerCase();
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/** Distance in km between two location strings, or null if either is unrecognized. */
export function getDistanceKm(locationA: string, locationB: string): number | null {
  const a = KNOWN_LOCATIONS[normalize(locationA)];
  const b = KNOWN_LOCATIONS[normalize(locationB)];
  if (!a || !b) return null;
  return Math.round(haversineKm(a.lat, a.lng, b.lat, b.lng) * 10) / 10;
}
