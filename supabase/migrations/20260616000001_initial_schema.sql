-- ============================================================
-- Migration 001: Initial Schema for Milk Tea Tracker
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- PROFILES TABLE
-- Extended user metadata. Mirrors auth.users 1:1.
-- ============================================================
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ENTRIES TABLE
-- Core data: one row per milk tea consumed.
-- ============================================================
CREATE TABLE entries (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  image_url  TEXT,
  date       DATE NOT NULL,
  rating     SMALLINT CHECK (rating >= 1 AND rating <= 5),
  comment    TEXT,
  is_pinned  BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_entries_user_date ON entries(user_id, date DESC);
CREATE INDEX idx_entries_user_pinned ON entries(user_id, date DESC) WHERE is_pinned = true;
CREATE INDEX idx_entries_name_trgm ON entries USING gin (name gin_trgm_ops);

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own entries"
  ON entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON entries FOR DELETE
  USING (auth.uid() = user_id);

-- Profiles: viewable by any authenticated user, updatable only by owner
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by all authenticated users"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================
-- STORAGE BUCKET
-- Run these via Supabase Dashboard > SQL Editor or API:
-- ============================================================
-- 1. Create bucket "entry-images" (public, 5MB limit, allowed image types)
-- 2. Create storage policies:

-- Allow authenticated users to upload to their own folder
-- CREATE POLICY "Users can upload images"
--   ON storage.objects FOR INSERT
--   WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'entry-images');

-- Allow public read access to entry-images
-- CREATE POLICY "Public can view images"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'entry-images');

-- Allow users to delete their own images
-- CREATE POLICY "Users can delete own images"
--   ON storage.objects FOR DELETE
--   USING (auth.role() = 'authenticated' AND bucket_id = 'entry-images');
