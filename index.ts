export type Rarity = 'common' | 'rare' | 'legendary' | 'mythical';
export type Element = 'Fire' | 'Water' | 'Earth' | 'Wind' | 'Nature' | 'Dark' | 'Light' | 'Electric' | 'Ice' | 'Mystic' | 'Steel' | 'Cosmic';
export type StatusEffect = 'burn' | 'poison' | 'freeze' | 'shock' | 'curse' | 'reflect' | 'silence' | 'tidal' | 'chain_lightning';

export interface SkillEffect {
  type: StatusEffect;
  chance?: number;
  duration?: number;
  value?: number;
}

export interface Skill {
  name: string;
  damage: number;
  description: string;
  coinToss?: { count: number; damagePerHead: number; allHeadsBonus: number; tailsDamage?: number };
  isElectric?: boolean;
  effect?: SkillEffect;
}

export type PassiveType =
  | 'dodge' | 'armor' | 'regen' | 'double_attack' | 'lifesteal'
  | 'damage_boost' | 'electric_boost' | 'counter_attack' | 'extra_turn'
  | 'ocean_blessing' | 'eclipse_aura' | 'storm_rage';

export interface Passive {
  description: string;
  type: PassiveType;
  value: number;
  triggerCondition?: 'low_hp' | 'every_2_turns' | 'every_turn';
}

export interface MonsterDef {
  id: number;
  name: string;
  rarity: Rarity;
  element: Element;
  hp: number;
  skills: [Skill, Skill];
  passive?: Passive;
  spriteSheet: 1 | 2;
  spriteRow: number;
  spriteCol: number;
  description: string;
  maxCopies: number;
  fragmentValue: number;
}

export interface OwnedMonster {
  monsterId: number;
  obtainedAt: number;
  uid: string;
}

export interface MonsterUpgrade {
  monsterUid: string;
  monsterId: number;
  level: number;
  skill1Level: number;
  skill2Level: number;
}

export type Page = 'home' | 'gacha' | 'collection' | 'battle' | 'upgrade' | 'shop' | 'boss' | 'inventory';

export interface BattleState {
  playerMonsterId: number;
  enemyMonsterId: number;
  playerHp: number;
  enemyHp: number;
  playerMaxHp: number;
  enemyMaxHp: number;
  turn: 'player' | 'enemy';
  log: string[];
  status: 'selecting' | 'fighting' | 'won' | 'lost';
  turnCount: number;
  playerRegenCounter: number;
  enemyRegenCounter: number;
  playerArmorHp: number;
  enemyArmorHp: number;
  playerEffects: ActiveEffect[];
  enemyEffects: ActiveEffect[];
  playerSilenced: boolean;
  enemyBlocked: boolean;
  isBoss: boolean;
  bossMaxHp?: number;
}

export interface ActiveEffect {
  type: StatusEffect;
  remainingTurns: number;
  value: number;
}

export interface PokemonFragments {
  [monsterId: number]: number;
}

export interface UserProfile {
  gold: number;
  universalFragments: number;
  pokemonFragments: PokemonFragments;
  last_daily_reward: string | null;
}

export interface FragmentPopup {
  monsterId: number;
  monsterName: string;
  rarity: Rarity;
  amount: number;
}

// Inventory system
export type ItemType = 'potion_hp' | 'potion_revive' | 'raid_ticket' | 'reward_ticket' | 'boss_material';

export interface InventoryItem {
  type: ItemType;
  quantity: number;
}

export interface UserInventory {
  [itemType: string]: number;
}

// Boss state
export interface BossState {
  bossMonsterId: number;
  bossHp: number;
  maxHp: number;
  date: string;
  cleared: boolean;
  attempts: number;
}

// Fragment values per rarity
export const FRAGMENT_VALUES: Record<Rarity, number> = {
  common: 15,
  rare: 40,
  legendary: 120,
  mythical: 300,
};

// Upgrade costs
export const getLevelCost = (level: number): number => Math.floor(50 * Math.pow(1.15, level - 1));
export const getSkillCost = (level: number): number => Math.floor(20 * Math.pow(1.2, level - 1));

// Level caps
export const MAX_MONSTER_LEVEL = 25;
export const MAX_SKILL_LEVEL = 20;
