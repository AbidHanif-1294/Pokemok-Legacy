-- migrations/20260620_migrate_duplicates_to_fragments.sql

/*
Migration: Convert duplicate user_collection rows into pokemon fragments.
- For every (user_id, monster_id) group with count > 1:
  - Keep the earliest obtained_at uid
  - Remove other duplicate rows from user_collection
  - Add (duplicates * 10) to user_profiles.pokemon_fragments[monster_id]
  - Ensure a user_upgrades row exists for remaining UID

Run this on a non-production (staging) environment first and backup your DB.
*/

DO $$
DECLARE
  rec RECORD;
  uids text[];
  kept_uid text;
  duplicates int;
  add_frag int;
  current_json jsonb;
  existing integer;
BEGIN
  FOR rec IN
    SELECT user_id, monster_id, array_agg(uid ORDER BY obtained_at) AS uids, count(*) AS cnt
    FROM user_collection
    GROUP BY user_id, monster_id
    HAVING count(*) > 1
  LOOP
    uids := rec.uids;
    kept_uid := uids[1]; -- keep earliest obtained
    duplicates := rec.cnt - 1;
    add_frag := duplicates * 10;

    -- Lock and update user's pokemon_fragments JSONB safely
    SELECT COALESCE(pokemon_fragments, '{}'::jsonb) INTO current_json
      FROM user_profiles
      WHERE user_id = rec.user_id
      FOR UPDATE;

    existing := COALESCE((current_json ->> rec.monster_id::text)::int, 0);
    current_json := jsonb_set(current_json, ARRAY[rec.monster_id::text], to_jsonb(existing + add_frag), true);

    UPDATE user_profiles SET pokemon_fragments = current_json WHERE user_id = rec.user_id;

    -- Delete duplicates (keep the chosen uid)
    DELETE FROM user_collection
    WHERE user_id = rec.user_id AND monster_id = rec.monster_id AND uid <> kept_uid;
  END LOOP;

  -- Ensure upgrade records exist for all remaining owned UIDs
  INSERT INTO user_upgrades (user_id, monster_uid, monster_id, level, skill1_level, skill2_level, created_at)
  SELECT uc.user_id, uc.uid, uc.monster_id, 1, 1, 1, now()
  FROM user_collection uc
  LEFT JOIN user_upgrades uu ON uu.user_id = uc.user_id AND uu.monster_uid = uc.uid
  WHERE uu.id IS NULL;
END $$;
