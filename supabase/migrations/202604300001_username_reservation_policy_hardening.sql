-- Neuroartan username reservation policy hardening
-- Supabase remains the transitional canonical backend. Username availability
-- checks must be able to see active reservations while writes remain owner-bound.

drop policy if exists username_reservations_public_availability_select on public.username_reservations;
create policy username_reservations_public_availability_select on public.username_reservations
  for select using (
    reservation_status = 'active'
    or auth.uid()::text = auth_user_id::text
  );
