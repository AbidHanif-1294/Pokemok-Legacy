/*
# Monster Clash — Progression System Tables

## Summary
Adds the full progression system: fragments (universal + per-monster), monster
level upgrades, skill level upgrades, a per-user daily boss record, and a
user inventory for consumable items.

## New Columns on user_profiles
- `universal_fragments` — shared upgrade currency earned from duplicate cards
- `pokemon_fragments`   — JSONB map of monster_id → quantity for per-monster fragments

## New Tables

### monster_upgrades
Tracks every monster card's level and skill levels per user.
- `user_id`       — FK to auth.users
- `monster_uid`   — matches user_collection.uid (unique per card instance)
- `monster_id`    — integer monster definition index
- `level`         — monster level 1-25
- `skill1_level`  — first skill level 1-20
- `skill2_level`  — second skill level 1-20

### daily_boss
One row per (user, date). Tracks daily boss HP and attempts.
- `boss_monster_id` — which monster is the boss today
- `boss_hp`         — remaining HP
- `max_hp`          — starting HP for the boss
- `date`            — calendar date for the boss (resets daily)
- `attempts`        — number of attempts today
- `cleared`         — whether the user defeated the boss today
- `last_rewards`    — JSONB of last rewards claimed

### user_inventory
Generic item inventory (potions, tickets, etc.)
- `user_id`    — FK to auth.users
- `item_type`  — 'hp_potion' | 'mega_potion' | 'revive' | 'double_reward' | 'boss_ticket'
- `quantity`   — how many the user owns

## Security
- RLS enabled on all new tables.
- All policies are owner-scoped to `auth.uid()`.

## Notes
1. `monster_upgrades` uses UNIQUE(user_id, monster_uid) — one upgrade record per card.
2. `daily_boss.date` defaults to CURRENT_DATE; a new row is inserted automatically
   when the user first attacks on a new day.
3. `pokemon_fragments` stored as JSONB on user_profiles for fast access without joins.
*/

-- ── Extend user_profiles ─────────────────────────────────────────────────────
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS universal_fragments integer NOT NULL DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS pokemon_fragments jsonb NOT NULL DEFAULT '{}';

-- ── monster_upgrades ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS monster_upgrades (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  monster_uid  text NOT NULL,
  monster_id   integer NOT NULL,
  level        integer NOT NULL DEFAULT 1,
  skill1_level integer NOT NULL DEFAULT 1,
  skill2_level integer NOT NULL DEFAULT 1,
  created_at   timestamptz DEFAULT now(),
  UNIQUE(user_id, monster_uid)
);

CREATE INDEX IF NOT EXISTS idx_monster_upgrades_user ON monster_upgrades(user_id);

ALTER TABLE monster_upgrades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_upgrades" ON monster_upgrades;
DROP POLICY IF EXISTS "insert_own_upgrades" ON monster_upgrades;
DROP POLICY IF EXISTS "update_own_upgrades" ON monster_upgrades;
DROP POLICY IF EXISTS "delete_own_upgrades" ON monster_upgrades;

CREATE POLICY "select_own_upgrades" ON monster_upgrades FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_upgrades" ON monster_upgrades FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_upgrades" ON monster_upgrades FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_upgrades" ON monster_upgrades FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ── daily_boss ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_boss (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  boss_monster_id integer NOT NULL,
  boss_hp         integer NOT NULL,
  max_hp          integer NOT NULL,
  date            date NOT NULL DEFAULT CURRENT_DATE,
  attempts        integer NOT NULL DEFAULT 0,
  cleared         boolean NOT NULL DEFAULT false,
  last_rewards    jsonb,
  created_at      timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE daily_boss ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_boss"  ON daily_boss;
DROP POLICY IF EXISTS "insert_own_boss"  ON daily_boss;
DROP POLICY IF EXISTS "update_own_boss"  ON daily_boss;
DROP POLICY IF EXISTS "delete_own_boss"  ON daily_boss;

CREATE POLICY "select_own_boss" ON daily_boss FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_boss" ON daily_boss FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_boss" ON daily_boss FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_boss" ON daily_boss FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ── user_inventory ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_inventory (
  user_id    uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type  text NOT NULL,
  quantity   integer NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, item_type),
  CONSTRAINT positive_qty CHECK (quantity >= 0)
);

ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_inventory"  ON user_inventory;
DROP POLICY IF EXISTS "insert_own_inventory"  ON user_inventory;
DROP POLICY IF EXISTS "update_own_inventory"  ON user_inventory;
DROP POLICY IF EXISTS "delete_own_inventory"  ON user_inventory;

CREATE POLICY "select_own_inventory" ON user_inventory FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_inventory" ON user_inventory FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_inventory" ON user_inventory FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_inventory" ON user_inventory FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
