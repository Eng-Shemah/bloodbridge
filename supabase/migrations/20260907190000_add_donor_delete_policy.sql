-- Fixes a gap in the initial migration: donors had select/insert/update
-- policies but no delete policy, so the app's "Remove donor" button was
-- silently blocked by RLS (PostgREST returns 200 with 0 rows affected,
-- not an error, when a policy denies a delete).

create policy "public delete donors" on donors for delete using (true);
