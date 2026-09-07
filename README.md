# BloodBridge

Blood donation matching & stock system — connects donors with hospitals and
patients by blood-type compatibility and proximity, tracks live blood bank
stock, and logs every donation and adjustment. Built for the Web Technology
course project (2026/2027).

## Data: local mock mode vs. Lovable Cloud

The app works fully without Lovable Cloud enabled. [src/lib/dataStore.ts](src/lib/dataStore.ts)
checks whether `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are set:

- **Not set (default):** reads/writes `localStorage`, seeded with a few sample
  donors and starting stock so the UI isn't empty.
- **Set (Cloud enabled):** every function in `dataStore.ts` talks to Postgres
  via Supabase instead — no page code changes needed.

Once Lovable Cloud is turned on, run
[supabase/migrations/20260907120000_init_bloodbridge_schema.sql](supabase/migrations/20260907120000_init_bloodbridge_schema.sql)
in its SQL Editor to create the tables (donors, blood_requests, blood_stock,
stock_transactions, donor_matches).

## Blood type matching logic

[src/lib/bloodCompatibility.ts](src/lib/bloodCompatibility.ts) encodes the
standard donor → recipient compatibility rules (e.g. O- is a universal donor,
AB+ a universal recipient), used by `findMatchingDonors` in `dataStore.ts` to
filter available donors against an open request, sorted by distance
([src/lib/locations.ts](src/lib/locations.ts)).

## Pages

- **Dashboard** (`/`) — donor/request/stock summary, critical requests, low-stock alerts.
- **Donors** (`/donors`) — register a donor, search/filter, toggle availability, remove.
- **Requests** (`/requests`) — post a request, find compatible matching donors, confirm a
  donation (starts the donor's 56-day cooldown and adds stock), mark fulfilled/cancel, filter by status.
- **Stock** (`/stock`) — per-blood-type unit counts with low-stock flags, +1/-1 adjust, activity log.

---

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/a781e2b0-aff4-4177-82f1-26ce36293b42).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
