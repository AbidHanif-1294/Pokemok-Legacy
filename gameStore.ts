import { create } from 'zustand';
import { OwnedMonster, Page, BattleState, PokemonFragments, UserInventory, MonsterUpgrade, Rarity, FRAGMENT_VALUES, getLevelCost, getSkillCost, MAX_MONSTER_LEVEL, MAX_SKILL_LEVEL } from '../types';
import { supabase } from '../lib/supabase';
import allMonsters, { getMonsterById } from '../data/index';

const DROP_RATES = { common: 0.65, rare: 0.25, legendary: 0.08, mythical: 0.02 } as const;

function rollRarity(): Rarity {
  const r = Math.random();
  if (r < DROP_RATES.mythical) return 'mythical';
  if (r < DROP_RATES.mythical + DROP_RATES.legendary) return 'legendary';
  if (r < DROP_RATES.mythical + DROP_RATES.legendary + DROP_RATES.rare) return 'rare';
  return 'common';
}

function pullMonster(): OwnedMonster {
  const rarity = rollRarity();
  const pool = allMonsters.filter(m => m.rarity === rarity);
  const picked = pool[Math.floor(Math.random() * pool.length)];
  const uid = `${picked.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { monsterId: picked.id, obtainedAt: Date.now(), uid };
}

const emptyBattle: BattleState = {
  playerMonsterId: -1, enemyMonsterId: -1,
  playerHp: 0, enemyHp: 0, playerMaxHp: 0, enemyMaxHp: 0,
  turn: 'player', log: [], status: 'selecting',
  turnCount: 0,
  playerRegenCounter: 0, enemyRegenCounter: 0,
  playerArmorHp: 0, enemyArmorHp: 0,
  playerEffects: [], enemyEffects: [],
  playerSilenced: false, enemyBlocked: false,
  isBoss: false,
};

interface GameStore {
  // Currency
  gold: number;
  universalFragments: number;
  pokemonFragments: PokemonFragments;

  // Collection
  collection: OwnedMonster[];
  upgrades: Record<string, MonsterUpgrade>;

  // Inventory
  inventory: UserInventory;

  // Navigation
  page: Page;
  lastDailyReward: string | null;
  selectedBattleMonster: number | null;
  battleState: BattleState | null;
  loadingProfile: boolean;

  // Notifications
  lastError: string | null;
  lastSuccess: string | null;

  // Actions
  loadProfile: (userId: string) => Promise<void>;
  setPage: (page: Page) => void;

  // Gacha
  gachaSingle: () => Promise<{ pulled: OwnedMonster | null; duplicate: boolean; fragmentGain: number }>;
  gachaTen: () => Promise<{ pulled: OwnedMonster[]; duplicates: number; fragmentGain: number }>;

  // Daily
  claimDailyReward: () => Promise<boolean>;

  // Battle
  selectBattleMonster: (id: number | null) => void;
  setBattleState: (bs: BattleState | null) => void;

  // Currency operations
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
  addUniversalFragments: (amount: number) => void;
  spendUniversalFragments: (amount: number) => boolean;
  addPokemonFragments: (monsterId: number, amount: number) => void;
  spendPokemonFragments: (monsterId: number, amount: number) => boolean;

  // Upgrades
  upgradeMonsterLevel: (uid: string) => boolean;
  upgradeSkillLevel: (uid: string, skillIndex: 1 | 2) => boolean;
  getMonsterUpgrade: (uid: string) => MonsterUpgrade;

  // Inventory
  addItem: (itemType: string, quantity: number) => void;
  useItem: (itemType: string) => boolean;
  getItemQuantity: (itemType: string) => number;

  // Notifications
  setSuccess: (msg: string | null) => void;
  setError: (msg: string | null) => void;

  // Reset
  reset: () => void;
  saveToSupabase: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gold: 0,
  universalFragments: 0,
  pokemonFragments: {},
  collection: [],
  upgrades: {},
  inventory: {},
  page: 'home',
  lastDailyReward: null,
  selectedBattleMonster: null,
  battleState: null,
  loadingProfile: false,
  lastError: null,
  lastSuccess: null,

  loadProfile: async (userId: string) => {
    set({ loadingProfile: true });
    try {
      // Ensure user profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!existingProfile) {
        await supabase.from('user_profiles').insert({
          user_id: userId,
          gold: 1000,
          universal_fragments: 0,
          pokemon_fragments: {},
          last_daily_reward: null,
        });
      }

      const [{ data: profile }, { data: collection }] = await Promise.all([
        supabase.from('user_profiles').select('*').eq('user_id', userId).maybeSingle(),
        supabase.from('user_collection').select('*').eq('user_id', userId),
      ]);

      const owned: OwnedMonster[] = (collection ?? []).map(r => ({
        monsterId: r.monster_id,
        uid: r.uid,
        obtainedAt: new Date(r.obtained_at).getTime(),
      }));

      // Load upgrades from supabase
      const { data: upgradesData } = await supabase
        .from('user_upgrades')
        .select('*')
        .eq('user_id', userId);
      
      const upgrades: Record<string, MonsterUpgrade> = {};
      (upgradesData ?? []).forEach(u => {
        upgrades[u.monster_uid] = {
          monsterUid: u.monster_uid,
          monsterId: u.monster_id,
          level: u.level,
          skill1Level: u.skill1_level,
          skill2Level: u.skill2_level,
        };
      });

      // Load inventory from supabase
      const { data: inventoryData } = await supabase
        .from('user_inventory')
        .select('*')
        .eq('user_id', userId);
      
      const inventory: UserInventory = {};
      (inventoryData ?? []).forEach(i => {
        inventory[i.item_type] = i.quantity;
      });

      set({
        gold: profile?.gold ?? 1000,
        universalFragments: profile?.universal_fragments ?? 0,
        pokemonFragments: profile?.pokemon_fragments ?? {},
        lastDailyReward: profile?.last_daily_reward ?? null,
        collection: owned,
        upgrades,
        inventory,
        loadingProfile: false,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      set({ loadingProfile: false, lastError: 'Failed to load profile' });
    }
  },

  setPage: (page: Page) => set({ page }),
  selectBattleMonster: (id: number | null) => set({ selectedBattleMonster: id }),
  setBattleState: (bs: BattleState | null) => set({ battleState: bs }),

  saveToSupabase: async () => {
    const state = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      // Save profile
      await supabase.from('user_profiles').update({
        gold: state.gold,
        universal_fragments: state.universalFragments,
        pokemon_fragments: state.pokemonFragments,
      }).eq('user_id', user.id);

      // Save upgrades
      for (const [uid, upgrade] of Object.entries(state.upgrades)) {
        const { data: existing } = await supabase
          .from('user_upgrades')
          .select('id')
          .eq('monster_uid', uid)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('user_upgrades')
            .update({
              level: upgrade.level,
              skill1_level: upgrade.skill1Level,
              skill2_level: upgrade.skill2Level,
            })
            .eq('id', existing.id);
        } else {
          await supabase.from('user_upgrades').insert({
            user_id: user.id,
            monster_uid: uid,
            monster_id: upgrade.monsterId,
            level: upgrade.level,
            skill1_level: upgrade.skill1Level,
            skill2_level: upgrade.skill2Level,
          });
        }
      }

      // Save inventory
      for (const [itemType, quantity] of Object.entries(state.inventory)) {
        const { data: existing } = await supabase
          .from('user_inventory')
          .select('id')
          .eq('item_type', itemType)
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing && quantity > 0) {
          await supabase
            .from('user_inventory')
            .update({ quantity })
            .eq('id', existing.id);
        } else if (existing && quantity === 0) {
          await supabase
            .from('user_inventory')
            .delete()
            .eq('id', existing.id);
        } else if (!existing && quantity > 0) {
          await supabase.from('user_inventory').insert({
            user_id: user.id,
            item_type: itemType,
            quantity,
          });
        }
      }
    } catch (error) {
      console.error('Failed to save to supabase:', error);
    }
  },

  // Gacha with duplicate conversion
  gachaSingle: async () => {
    const state = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ lastError: 'Not logged in!' });
      return { pulled: null, duplicate: false, fragmentGain: 0 };
    }

    if (state.gold < 100) {
      set({ lastError: 'Not enough gold! Need 100 gold.' });
      return { pulled: null, duplicate: false, fragmentGain: 0 };
    }

    const pulled = pullMonster();
    const monsterDef = getMonsterById(pulled.monsterId);
    if (!monsterDef) return { pulled: null, duplicate: false, fragmentGain: 0 };

    // Check for duplicates
    const existingCount = state.collection.filter(o => o.monsterId === pulled.monsterId).length;
    const isDuplicate = existingCount >= monsterDef.maxCopies;
    let fragmentGain = 0;

    if (isDuplicate) {
      // Convert to fragments
      fragmentGain = monsterDef.fragmentValue;
      const newUniversalFragments = state.universalFragments + fragmentGain;
      
      set(s => ({
        gold: s.gold - 100,
        universalFragments: newUniversalFragments,
        lastSuccess: `Duplicate! Converted to ${fragmentGain} Universal Fragments!`,
      }));

      // Save to DB
      await supabase.from('user_profiles').update({
        gold: state.gold - 100,
        universal_fragments: newUniversalFragments,
      }).eq('user_id', user.id);
    } else {
      // Add to collection
      const { error } = await supabase.from('user_collection').insert({
        user_id: user.id,
        monster_id: pulled.monsterId,
        uid: pulled.uid,
        obtained_at: new Date().toISOString(),
      });

      if (error) {
        set({ lastError: 'Failed to add monster to collection' });
        return { pulled: null, duplicate: false, fragmentGain: 0 };
      }

      // Initialize upgrade
      const newUpgrade: MonsterUpgrade = { monsterUid: pulled.uid, monsterId: pulled.monsterId, level: 1, skill1Level: 1, skill2Level: 1 };
      const newUpgrades = { ...state.upgrades, [pulled.uid]: newUpgrade };

      await supabase.from('user_upgrades').insert({
        user_id: user.id,
        monster_uid: pulled.uid,
        monster_id: pulled.monsterId,
        level: 1,
        skill1_level: 1,
        skill2_level: 1,
      });

      await supabase.from('user_profiles').update({
        gold: state.gold - 100,
      }).eq('user_id', user.id);

      set(s => ({
        gold: s.gold - 100,
        collection: [...s.collection, pulled],
        upgrades: newUpgrades,
        lastSuccess: `Obtained ${monsterDef.name}!`,
      }));
    }

    return { pulled: isDuplicate ? null : pulled, duplicate: isDuplicate, fragmentGain };
  },

  gachaTen: async () => {
    const state = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ lastError: 'Not logged in!' });
      return { pulled: [], duplicates: 0, fragmentGain: 0 };
    }

    if (state.gold < 900) {
      set({ lastError: 'Not enough gold! Need 900 gold.' });
      return { pulled: [], duplicates: 0, fragmentGain: 0 };
    }

    const pulled: OwnedMonster[] = [];
    let totalFragGain = 0;
    let dupeCount = 0;

    for (let i = 0; i < 10; i++) {
      const newPull = pullMonster();
      const monsterDef = getMonsterById(newPull.monsterId);
      if (!monsterDef) continue;

      const existingCount = state.collection.filter(o => o.monsterId === newPull.monsterId).length + pulled.filter(p => p.monsterId === newPull.monsterId).length;
      const isDuplicate = existingCount >= monsterDef.maxCopies;

      if (isDuplicate) {
        totalFragGain += monsterDef.fragmentValue;
        dupeCount++;
      } else {
        pulled.push(newPull);
      }
    }

    // Insert non-duplicates to Supabase
    if (pulled.length > 0) {
      const { error } = await supabase.from('user_collection').insert(
        pulled.map(p => ({ 
          user_id: user.id,
          monster_id: p.monsterId, 
          uid: p.uid,
          obtained_at: new Date().toISOString(),
        }))
      );

      if (error) {
        set({ lastError: 'Failed to add monsters to collection' });
        return { pulled: [], duplicates: 0, fragmentGain: 0 };
      }

      // Insert upgrades
      await supabase.from('user_upgrades').insert(
        pulled.map(p => ({
          user_id: user.id,
          monster_uid: p.uid,
          monster_id: p.monsterId,
          level: 1,
          skill1_level: 1,
          skill2_level: 1,
        }))
      );
    }

    // Update state
    const newUniversalFragments = state.universalFragments + totalFragGain;
    const newGold = state.gold - 900;

    const newUpgrades = { ...state.upgrades };
    pulled.forEach(p => {
      newUpgrades[p.uid] = { monsterUid: p.uid, monsterId: p.monsterId, level: 1, skill1Level: 1, skill2Level: 1 };
    });

    // Save to Supabase
    await supabase.from('user_profiles').update({
      gold: newGold,
      universal_fragments: newUniversalFragments,
    }).eq('user_id', user.id);

    const successMsg = `Pulled ${pulled.length} new monsters!${dupeCount > 0 ? ` ${dupeCount} duplicates converted to ${totalFragGain} fragments.` : ''}`;

    set(s => ({
      gold: newGold,
      universalFragments: newUniversalFragments,
      collection: [...s.collection, ...pulled],
      upgrades: newUpgrades,
      lastSuccess: successMsg,
    }));

    return { pulled, duplicates: dupeCount, fragmentGain: totalFragGain };
  },

  claimDailyReward: async () => {
    const state = get();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      set({ lastError: 'Not logged in!' });
      return false;
    }

    const now = new Date();
    if (state.lastDailyReward) {
      const diff = now.getTime() - new Date(state.lastDailyReward).getTime();
      if (diff < 24 * 60 * 60 * 1000) {
        set({ lastError: 'Daily reward already claimed! Come back tomorrow.' });
        return false;
      }
    }

    const newGold = state.gold + 200;
    const newFragments = state.universalFragments + 10;
    const ts = now.toISOString();

    const { error } = await supabase.from('user_profiles')
      .update({ gold: newGold, universal_fragments: newFragments, last_daily_reward: ts })
      .eq('user_id', user.id);

    if (error) {
      set({ lastError: 'Failed to claim daily reward' });
      return false;
    }

    set({
      gold: newGold,
      universalFragments: newFragments,
      lastDailyReward: ts,
      lastSuccess: 'Claimed 200 Gold + 10 Universal Fragments!',
    });
    return true;
  },

  // Currency operations
  addGold: (amount: number) => {
    const newGold = Math.max(0, get().gold + amount);
    set({ gold: newGold });
    get().saveToSupabase();
  },

  spendGold: (amount: number) => {
    const state = get();
    if (state.gold < amount) {
      set({ lastError: `Not enough gold! Need ${amount} gold.` });
      return false;
    }
    const newGold = state.gold - amount;
    set({ gold: newGold });
    get().saveToSupabase();
    return true;
  },

  addUniversalFragments: (amount: number) => {
    const newFragments = Math.max(0, get().universalFragments + amount);
    set({ universalFragments: newFragments });
    get().saveToSupabase();
  },

  spendUniversalFragments: (amount: number) => {
    const state = get();
    if (state.universalFragments < amount) {
      set({ lastError: `Not enough Universal Fragments! Need ${amount}.` });
      return false;
    }
    const newFragments = state.universalFragments - amount;
    set({ universalFragments: newFragments });
    get().saveToSupabase();
    return true;
  },

  addPokemonFragments: (monsterId: number, amount: number) => {
    const pf = { ...get().pokemonFragments };
    pf[monsterId] = (pf[monsterId] ?? 0) + amount;
    set({ pokemonFragments: pf });
    get().saveToSupabase();
  },

  spendPokemonFragments: (monsterId: number, amount: number) => {
    const state = get();
    const currentAmount = state.pokemonFragments[monsterId] ?? 0;
    if (currentAmount < amount) {
      set({ lastError: `Not enough Pokemon Fragments!` });
      return false;
    }
    const pf = { ...state.pokemonFragments };
    pf[monsterId] = currentAmount - amount;
    if (pf[monsterId] === 0) delete pf[monsterId];
    set({ pokemonFragments: pf });
    get().saveToSupabase();
    return true;
  },

  // Upgrades
  getMonsterUpgrade: (uid: string) => {
    const upgrades = get().upgrades;
    return upgrades[uid] || { monsterUid: uid, monsterId: 0, level: 1, skill1Level: 1, skill2Level: 1 };
  },

  upgradeMonsterLevel: (uid: string) => {
    const state = get();
    const upgrade = state.upgrades[uid];
    if (!upgrade) {
      set({ lastError: 'Monster not found!' });
      return false;
    }

    if (upgrade.level >= MAX_MONSTER_LEVEL) {
      set({ lastError: 'Already at max level (25)!' });
      return false;
    }

    const cost = getLevelCost(upgrade.level);
    if (state.universalFragments < cost) {
      set({ lastError: `Not enough Universal Fragments! Need ${cost}.` });
      return false;
    }

    const newUpgrades = { ...state.upgrades };
    newUpgrades[uid] = { ...upgrade, level: upgrade.level + 1 };
    const newFragments = state.universalFragments - cost;

    set({
      upgrades: newUpgrades,
      universalFragments: newFragments,
      lastSuccess: `Upgraded monster to Level ${upgrade.level + 1}!`,
    });
    get().saveToSupabase();
    return true;
  },

  upgradeSkillLevel: (uid: string, skillIndex: 1 | 2) => {
    const state = get();
    const upgrade = state.upgrades[uid];
    if (!upgrade) {
      set({ lastError: 'Monster not found!' });
      return false;
    }

    const currentSkillLevel = skillIndex === 1 ? upgrade.skill1Level : upgrade.skill2Level;

    if (currentSkillLevel >= MAX_SKILL_LEVEL) {
      set({ lastError: 'Skill already at max level (20)!' });
      return false;
    }

    const cost = getSkillCost(currentSkillLevel);

    // Check Pokemon Fragments for this specific monster
    const currentPf = state.pokemonFragments[upgrade.monsterId] ?? 0;
    if (currentPf < cost) {
      set({ lastError: `Not enough Pokemon Fragments! Need ${cost} for this monster.` });
      return false;
    }

    const newUpgrades = { ...state.upgrades };
    if (skillIndex === 1) {
      newUpgrades[uid] = { ...upgrade, skill1Level: currentSkillLevel + 1 };
    } else {
      newUpgrades[uid] = { ...upgrade, skill2Level: currentSkillLevel + 1 };
    }

    const newPf = { ...state.pokemonFragments };
    const newAmount = (newPf[upgrade.monsterId] ?? 0) - cost;
    if (newAmount <= 0) {
      delete newPf[upgrade.monsterId];
    } else {
      newPf[upgrade.monsterId] = newAmount;
    }

    set({
      upgrades: newUpgrades,
      pokemonFragments: newPf,
      lastSuccess: `Skill upgraded to Level ${currentSkillLevel + 1}!`,
    });
    get().saveToSupabase();
    return true;
  },

  // Inventory
  addItem: (itemType: string, quantity: number) => {
    const inv = { ...get().inventory };
    inv[itemType] = (inv[itemType] ?? 0) + quantity;
    set({ inventory: inv });
    get().saveToSupabase();
  },

  useItem: (itemType: string) => {
    const state = get();
    const quantity = state.inventory[itemType] ?? 0;
    if (quantity <= 0) {
      set({ lastError: `No ${itemType} available!` });
      return false;
    }

    const inv = { ...state.inventory };
    inv[itemType] = quantity - 1;
    if (inv[itemType] <= 0) delete inv[itemType];
    set({ inventory: inv });
    get().saveToSupabase();
    return true;
  },

  getItemQuantity: (itemType: string) => {
    return get().inventory[itemType] ?? 0;
  },

  // Notifications
  setSuccess: (msg: string | null) => set({ lastSuccess: msg }),
  setError: (msg: string | null) => set({ lastError: msg }),

  reset: () => {
    set({
      gold: 0,
      universalFragments: 0,
      pokemonFragments: {},
      collection: [],
      upgrades: {},
      inventory: {},
      page: 'home',
      lastDailyReward: null,
      selectedBattleMonster: null,
      battleState: null,
      loadingProfile: false,
      lastError: null,
      lastSuccess: null,
    });
  },
}));

// Helper — build initial battle state
export function makeBattleState(playerMonsterId: number): BattleState {
  const playerDef = allMonsters.find(m => m.id === playerMonsterId);
  if (!playerDef) throw new Error(`Monster with ID ${playerMonsterId} not found`);
  
  const enemies = allMonsters.filter(m => m.id !== playerMonsterId);
  if (enemies.length === 0) throw new Error('No enemy monsters available');
  
  const enemyDef = enemies[Math.floor(Math.random() * enemies.length)];
  return {
    ...emptyBattle,
    playerMonsterId,
    enemyMonsterId: enemyDef.id,
    playerHp: playerDef.hp,
    enemyHp: enemyDef.hp,
    playerMaxHp: playerDef.hp,
    enemyMaxHp: enemyDef.hp,
    status: 'fighting',
    log: [`Battle! ${playerDef.name} vs ${enemyDef.name}!`],
  };
}

export { getLevelCost, getSkillCost, FRAGMENT_VALUES, MAX_MONSTER_LEVEL, MAX_SKILL_LEVEL };
