-- Enables Supabase Realtime (live postgres_changes events) for BloodBridge's
-- tables, so every open tab/device updates automatically when data changes
-- elsewhere - see src/hooks/useRealtimeSync.ts.

alter publication supabase_realtime add table donors;
alter publication supabase_realtime add table blood_requests;
alter publication supabase_realtime add table blood_stock;
alter publication supabase_realtime add table stock_transactions;
