-- Now that BloodBridge is about to go live, anonymous writes are too open:
-- the earlier migrations let anyone insert/update/delete every table. This
-- keeps reads public (donor counts, stock levels, etc. stay visible to
-- everyone, matching the public Home page's live stats) but requires a
-- signed-in user for every write.

drop policy if exists "public insert donors" on donors;
drop policy if exists "public update donors" on donors;
drop policy if exists "public delete donors" on donors;

create policy "authenticated insert donors" on donors
  for insert with check (auth.role() = 'authenticated');
create policy "authenticated update donors" on donors
  for update using (auth.role() = 'authenticated');
create policy "authenticated delete donors" on donors
  for delete using (auth.role() = 'authenticated');

drop policy if exists "public insert requests" on blood_requests;
drop policy if exists "public update requests" on blood_requests;

create policy "authenticated insert requests" on blood_requests
  for insert with check (auth.role() = 'authenticated');
create policy "authenticated update requests" on blood_requests
  for update using (auth.role() = 'authenticated');

drop policy if exists "public update stock" on blood_stock;

create policy "authenticated update stock" on blood_stock
  for update using (auth.role() = 'authenticated');

drop policy if exists "public insert stock_transactions" on stock_transactions;

create policy "authenticated insert stock_transactions" on stock_transactions
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "public insert donor_matches" on donor_matches;
drop policy if exists "public update donor_matches" on donor_matches;

create policy "authenticated insert donor_matches" on donor_matches
  for insert with check (auth.role() = 'authenticated');
create policy "authenticated update donor_matches" on donor_matches
  for update using (auth.role() = 'authenticated');
