/*
# Monster Clash Game — User Data Tables

## Summary
Creates per-user game state for the Monster Clash browser card battle game.
Each authenticated user gets their own gold balance, daily reward tracking,
and monster collection, fully isolated from other users.

## New Tables

### user_profiles
Stores the player's economy data:
- `user_id`         — FK to auth.users, primary key
- `gold`            — current gold balance (default 1000 starting gold)
- `last_daily_reward` — timestamp of the last daily reward claim (null = never)
- `created_at`      — account creation timestamp

### user_collection
Stores every card the player has pulled via Gacha:
- `id`           — UUID primary key
- `user_id`      — FK to auth.users (owner)
- `monster_id`   — integer index into the monsters data array (0-39)
- `uid`          — client-generated unique string for deduplication
- `obtained_at`  — server timestamp when the card was added

## Security
- RLS enabled on both tables.
- All 4 CRUD policies on each table are scoped to the owning `auth.uid()`.
- Only the authenticated user who owns a row can read, insert, update, or delete it.

## Notes
1. `user_profiles` is created via a trigger on `auth.users` sign-up so every new
   user automatically gets a profile row.
2. `user_collection.uid` has a unique constraint to prevent the client
   submitting the same pull twice (idempotent inserts).
*/

-- ── user_profiles ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gold             integer NOT NULL DEFAULT 1000,
  last_daily_reward timestamptz,
  created_at       timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile"  ON user_profiles;
DROP POLICY IF EXISTS "insert_own_profile"  ON user_profiles;
DROP POLICY IF EXISTS "update_own_profile"  ON user_profiles;
DROP POLICY IF EXISTS "delete_own_profile"  ON user_profiles;

CREATE POLICY "select_own_profile" ON user_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_profile" ON user_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_profile" ON user_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_profile" ON user_profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ── user_collection ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_collection (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  monster_id  integer NOT NULL,
  uid         text NOT NULL,
  obtained_at timestamptz DEFAULT now(),
  UNIQUE (user_id, uid)
);

CREATE INDEX IF NOT EXISTS idx_user_collection_user_id ON user_collection(user_id);

ALTER TABLE user_collection ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_collection"  ON user_collection;
DROP POLICY IF EXISTS "insert_own_collection"  ON user_collection;
DROP POLICY IF EXISTS "update_own_collection"  ON user_collection;
DROP POLICY IF EXISTS "delete_own_collection"  ON user_collection;

CREATE POLICY "select_own_collection" ON user_collection FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_collection" ON user_collection FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_collection" ON user_collection FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_collection" ON user_collection FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ── auto-create profile on sign-up ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
