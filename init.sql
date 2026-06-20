-- Supabase SQL Migration for Pokemok Legacy
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (already created by Supabase auth, but we need user_profiles)
-- user_profiles for game data
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gold INTEGER NOT NULL DEFAULT 1000,
  universal_fragments INTEGER NOT NULL DEFAULT 0,
  pokemon_fragments JSONB DEFAULT '{}'::jsonb,
  last_daily_reward TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User collection (owned monsters)
CREATE TABLE IF NOT EXISTS user_collection (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monster_id INTEGER NOT NULL,
  uid TEXT NOT NULL UNIQUE,
  obtained_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User upgrades (monster level and skill upgrades)
CREATE TABLE IF NOT EXISTS user_upgrades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  monster_uid TEXT NOT NULL UNIQUE,
  monster_id INTEGER NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  skill1_level INTEGER NOT NULL DEFAULT 1,
  skill2_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User inventory (items)
CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, item_type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_collection_user_id ON user_collection(user_id);
CREATE INDEX IF NOT EXISTS idx_user_upgrades_user_id ON user_upgrades(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collection ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can only see their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own profile"
  ON user_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_collection
CREATE POLICY "Users can only see their own collection"
  ON user_collection FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert into their own collection"
  ON user_collection FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete from their own collection"
  ON user_collection FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_upgrades
CREATE POLICY "Users can only see their own upgrades"
  ON user_upgrades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own upgrades"
  ON user_upgrades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own upgrades"
  ON user_upgrades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own upgrades"
  ON user_upgrades FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_inventory
CREATE POLICY "Users can only see their own inventory"
  ON user_inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert into their own inventory"
  ON user_inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own inventory"
  ON user_inventory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete from their own inventory"
  ON user_inventory FOR DELETE
  USING (auth.uid() = user_id);
