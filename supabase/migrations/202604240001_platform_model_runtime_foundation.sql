-- Neuroartan platform model/runtime foundation
-- Supabase is the transitional canonical backend. Static JSON and localStorage
-- remain projections or continuity helpers only.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  username text unique,
  username_lower text unique,
  username_normalized text,
  username_status text not null default 'missing',
  username_route_ready boolean not null default false,
  username_reserved_at timestamptz,
  public_username text,
  display_name text,
  email text,
  avatar_url text,
  photo_url text,
  bio text,
  visibility_state text not null default 'private',
  profile_status text not null default 'active',
  public_profile_enabled boolean not null default false,
  public_profile_discoverable boolean not null default false,
  public_profile_visibility text not null default 'private',
  public_route_path text,
  public_route_url text,
  public_route_canonical_url text,
  public_route_status text not null default 'pending',
  profile_exists boolean not null default true,
  profile_complete boolean not null default false,
  profile_completion_status text not null default 'incomplete',
  profile_completion_percent integer not null default 0,
  missing_required_fields jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists auth_user_id uuid,
  add column if not exists username text,
  add column if not exists username_lower text,
  add column if not exists username_normalized text,
  add column if not exists username_status text not null default 'missing',
  add column if not exists username_route_ready boolean not null default false,
  add column if not exists username_reserved_at timestamptz,
  add column if not exists public_username text,
  add column if not exists display_name text,
  add column if not exists email text,
  add column if not exists avatar_url text,
  add column if not exists photo_url text,
  add column if not exists bio text,
  add column if not exists visibility_state text not null default 'private',
  add column if not exists profile_status text not null default 'active',
  add column if not exists public_profile_enabled boolean not null default false,
  add column if not exists public_profile_discoverable boolean not null default false,
  add column if not exists public_profile_visibility text not null default 'private',
  add column if not exists public_route_path text,
  add column if not exists public_route_url text,
  add column if not exists public_route_canonical_url text,
  add column if not exists public_route_status text not null default 'pending',
  add column if not exists public_display_name text,
  add column if not exists public_identity_label text,
  add column if not exists public_avatar_url text,
  add column if not exists public_summary text,
  add column if not exists public_primary_link text,
  add column if not exists public_bio text,
  add column if not exists public_tagline text,
  add column if not exists public_links jsonb not null default '[]'::jsonb,
  add column if not exists public_modules jsonb not null default '[]'::jsonb,
  add column if not exists public_feature_flags jsonb not null default '[]'::jsonb,
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists date_of_birth date,
  add column if not exists birth_date date,
  add column if not exists gender text,
  add column if not exists profile_exists boolean not null default true,
  add column if not exists profile_complete boolean not null default false,
  add column if not exists profile_completion_status text not null default 'incomplete',
  add column if not exists profile_completion_percent integer not null default 0,
  add column if not exists missing_required_fields jsonb not null default '[]'::jsonb,
  add column if not exists profile_visibility_status text,
  add column if not exists eligibility_status text,
  add column if not exists eligibility_age_years integer,
  add column if not exists minimum_eligible_age_years integer,
  add column if not exists eligibility_policy_status text,
  add column if not exists eligibility_checked_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.username_reservations (
  id uuid primary key default gen_random_uuid(),
  username text not null,
  username_lower text not null unique,
  auth_user_id uuid not null,
  profile_id uuid,
  public_profile_path text,
  public_profile_url text,
  reservation_status text not null default 'active',
  claimed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.models (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  owner_auth_user_id uuid not null,
  model_slug text not null unique,
  model_name text not null,
  description text,
  model_image_url text,
  creator_display_name text,
  creator_username text,
  model_visibility text not null default 'private',
  lifecycle_state text not null default 'draft',
  readiness_state text not null default 'uninitialized',
  publication_state text not null default 'unpublished',
  verification_state text not null default 'unverified',
  training_state text not null default 'uninitialized',
  interaction_state text not null default 'private',
  routing_class text not null default 'profile_continuity',
  default_runtime_policy jsonb not null default '{"provider":"unassigned","route":"site_knowledge","voice_enabled":false}'::jsonb,
  deployment_origin text not null default 'neuroartan_supabase',
  external_source_ref jsonb not null default '{}'::jsonb,
  source_count integer not null default 0,
  release_version text not null default '0.1.0',
  workspace_state text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.model_source_connectors (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.models(id) on delete cascade,
  profile_id uuid not null,
  owner_auth_user_id uuid not null,
  source_platform text not null,
  connector_type text not null default 'manual',
  authorization_status text not null default 'pending',
  granted_scope jsonb not null default '[]'::jsonb,
  connector_owner_identity_reference text,
  token_reference text,
  provenance_state text not null default 'unreviewed',
  granted_at timestamptz,
  last_validated_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.model_source_objects (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.models(id) on delete cascade,
  connector_id uuid references public.model_source_connectors(id) on delete set null,
  owner_auth_user_id uuid not null,
  source_kind text not null default 'upload',
  source_title text,
  storage_bucket text,
  storage_path text,
  source_status text not null default 'received',
  provenance_state text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.model_ingestion_jobs (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.models(id) on delete cascade,
  connector_id uuid references public.model_source_connectors(id) on delete set null,
  source_object_id uuid references public.model_source_objects(id) on delete set null,
  owner_auth_user_id uuid not null,
  ingestion_status text not null default 'queued',
  failure_state text,
  provenance_reference text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.model_training_records (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.models(id) on delete cascade,
  ingestion_job_id uuid references public.model_ingestion_jobs(id) on delete set null,
  owner_auth_user_id uuid not null,
  training_state text not null default 'uninitialized',
  training_origin text not null default 'self_supplied',
  provenance_summary jsonb not null default '{}'::jsonb,
  readiness_effect text not null default 'none',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.model_retrieval_records (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.models(id) on delete cascade,
  owner_auth_user_id uuid not null,
  retrieval_state text not null default 'uninitialized',
  embedding_provider text,
  index_reference text,
  readiness_state text not null default 'uninitialized',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.model_runtime_routes (
  id uuid primary key default gen_random_uuid(),
  model_id uuid not null references public.models(id) on delete cascade,
  owner_auth_user_id uuid not null,
  route_name text not null,
  provider_key text not null default 'unassigned',
  routing_state text not null default 'draft',
  runtime_policy jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(model_id, route_name)
);

create table if not exists public.active_model_preferences (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique,
  profile_id uuid,
  model_id uuid references public.models(id) on delete set null,
  source text not null default 'manual',
  updated_at timestamptz not null default now()
);

create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null,
  owner_auth_user_id uuid not null,
  author_username text,
  author_display_name text,
  author_avatar_url text,
  post_body text not null,
  post_state text not null default 'published',
  visibility_state text not null default 'public',
  source_surface text not null default 'feed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_auth_user_id_idx on public.profiles(auth_user_id);
create index if not exists profiles_username_lower_idx on public.profiles(username_lower);
create index if not exists models_owner_auth_user_id_idx on public.models(owner_auth_user_id);
create index if not exists models_profile_id_idx on public.models(profile_id);
create index if not exists models_public_lookup_idx on public.models(publication_state, model_visibility, readiness_state);
create index if not exists model_source_connectors_model_id_idx on public.model_source_connectors(model_id);
create index if not exists model_ingestion_jobs_model_id_idx on public.model_ingestion_jobs(model_id);
create index if not exists model_training_records_model_id_idx on public.model_training_records(model_id);
create index if not exists model_retrieval_records_model_id_idx on public.model_retrieval_records(model_id);
create index if not exists feed_posts_owner_auth_user_id_idx on public.feed_posts(owner_auth_user_id);
create index if not exists feed_posts_public_lookup_idx on public.feed_posts(visibility_state, post_state, created_at);

alter table public.profiles enable row level security;
alter table public.username_reservations enable row level security;
alter table public.models enable row level security;
alter table public.model_source_connectors enable row level security;
alter table public.model_source_objects enable row level security;
alter table public.model_ingestion_jobs enable row level security;
alter table public.model_training_records enable row level security;
alter table public.model_retrieval_records enable row level security;
alter table public.model_runtime_routes enable row level security;
alter table public.active_model_preferences enable row level security;
alter table public.feed_posts enable row level security;

drop policy if exists profiles_owner_select on public.profiles;
create policy profiles_owner_select on public.profiles
  for select using (auth.uid()::text = auth_user_id::text or public_profile_enabled = true);

drop policy if exists profiles_owner_insert on public.profiles;
create policy profiles_owner_insert on public.profiles
  for insert with check (auth.uid()::text = auth_user_id::text);

drop policy if exists profiles_owner_update on public.profiles;
create policy profiles_owner_update on public.profiles
  for update using (auth.uid()::text = auth_user_id::text) with check (auth.uid()::text = auth_user_id::text);

drop policy if exists username_reservations_owner_access on public.username_reservations;
create policy username_reservations_owner_access on public.username_reservations
  for all using (auth.uid()::text = auth_user_id::text) with check (auth.uid()::text = auth_user_id::text);

drop policy if exists models_owner_select on public.models;
create policy models_owner_select on public.models
  for select using (
    auth.uid()::text = owner_auth_user_id::text
    or (model_visibility = 'public' and publication_state = 'published')
  );

drop policy if exists models_owner_insert on public.models;
create policy models_owner_insert on public.models
  for insert with check (auth.uid()::text = owner_auth_user_id::text);

drop policy if exists models_owner_update on public.models;
create policy models_owner_update on public.models
  for update using (auth.uid()::text = owner_auth_user_id::text) with check (auth.uid()::text = owner_auth_user_id::text);

drop policy if exists model_source_connectors_owner_all on public.model_source_connectors;
create policy model_source_connectors_owner_all on public.model_source_connectors
  for all using (auth.uid()::text = owner_auth_user_id::text) with check (auth.uid()::text = owner_auth_user_id::text);

drop policy if exists model_source_objects_owner_all on public.model_source_objects;
create policy model_source_objects_owner_all on public.model_source_objects
  for all using (auth.uid()::text = owner_auth_user_id::text) with check (auth.uid()::text = owner_auth_user_id::text);

drop policy if exists model_ingestion_jobs_owner_all on public.model_ingestion_jobs;
create policy model_ingestion_jobs_owner_all on public.model_ingestion_jobs
  for all using (auth.uid()::text = owner_auth_user_id::text) with check (auth.uid()::text = owner_auth_user_id::text);

drop policy if exists model_training_records_owner_all on public.model_training_records;
create policy model_training_records_owner_all on public.model_training_records
  for all using (auth.uid()::text = owner_auth_user_id::text) with check (auth.uid()::text = owner_auth_user_id::text);

drop policy if exists model_retrieval_records_owner_all on public.model_retrieval_records;
create policy model_retrieval_records_owner_all on public.model_retrieval_records
  for all using (auth.uid()::text = owner_auth_user_id::text) with check (auth.uid()::text = owner_auth_user_id::text);

drop policy if exists model_runtime_routes_owner_all on public.model_runtime_routes;
create policy model_runtime_routes_owner_all on public.model_runtime_routes
  for all using (auth.uid()::text = owner_auth_user_id::text) with check (auth.uid()::text = owner_auth_user_id::text);

drop policy if exists active_model_preferences_owner_all on public.active_model_preferences;
create policy active_model_preferences_owner_all on public.active_model_preferences
  for all using (auth.uid()::text = auth_user_id::text) with check (auth.uid()::text = auth_user_id::text);

drop policy if exists feed_posts_public_select on public.feed_posts;
create policy feed_posts_public_select on public.feed_posts
  for select using (
    visibility_state = 'public'
    or auth.uid()::text = owner_auth_user_id::text
  );

drop policy if exists feed_posts_owner_insert on public.feed_posts;
create policy feed_posts_owner_insert on public.feed_posts
  for insert with check (auth.uid()::text = owner_auth_user_id::text);

drop policy if exists feed_posts_owner_delete on public.feed_posts;
create policy feed_posts_owner_delete on public.feed_posts
  for delete using (auth.uid()::text = owner_auth_user_id::text);
