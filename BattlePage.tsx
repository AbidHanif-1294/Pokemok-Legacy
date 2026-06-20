import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Shield, Zap, Coins, Flame, Droplets, Snowflake, Sparkles, Skull, RefreshCw, VolumeX } from 'lucide-react';
import { useGameStore, makeBattleState } from '../store/gameStore';
import { MonsterDef, BattleState, Skill, StatusEffect, ActiveEffect } from '../types';
import allMonsters, { getMonsterById } from '../data/index';
import MonsterSprite from '../components/MonsterSprite';
import MonsterCard from '../components/MonsterCard';

// ── popup helpers ─────────────────────────────────────────────
let pid = 0;
type PopupType = 'damage' | 'dodge' | 'heal';

interface Popup { id: number; type: PopupType; value?: number; side: 'player' | 'enemy' }

const POPUP_COLOR: Record<PopupType, string> = {
  damage: 'text-red-400',
  dodge:  'text-cyan-300',
  heal:   'text-green-400',
};

// ── damage engine ─────────────────────────────────────────────
function calcDamage(attacker: MonsterDef, skill: Skill, coins: boolean[] | null, bs: BattleState, isPlayer: boolean) {
  let dmg = skill.damage;

  if (skill.coinToss && coins) {
    const heads = coins.filter(Boolean).length;
    dmg = heads * skill.coinToss.damagePerHead;
    if (heads === skill.coinToss.count) dmg += skill.coinToss.allHeadsBonus;
    if (heads === 0 && skill.coinToss.tailsDamage !== undefined) dmg = skill.coinToss.tailsDamage;
  }
  if (skill.isElectric && attacker.passive?.type === 'electric_boost') dmg += attacker.passive.value;
  if (attacker.passive?.type === 'damage_boost') {
    const hp = isPlayer ? bs.playerHp : bs.enemyHp;
    if (hp < attacker.hp * 0.5) dmg = Math.round(dmg * 1.25);
  }

  const healed = attacker.passive?.type === 'lifesteal' ? Math.round(dmg * attacker.passive.value / 100) : 0;
  const doubleHit = attacker.passive?.type === 'double_attack' && Math.random() * 100 < attacker.passive.value;

  return { dmg, healed, doubleHit };
}

// ── main component ────────────────────────────────────────────
export default function BattlePage() {
  const { collection, setPage, selectedBattleMonster, selectBattleMonster, addGold } = useGameStore();
  const [bs, setBs] = useState<BattleState | null>(null);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [shake, setShake] = useState<'player' | 'enemy' | null>(null);
  const [pendingCoin, setPendingCoin] = useState<{ skillIndex: number; remaining: number } | null>(null);
  const [coinResults, setCoinResults] = useState<boolean[]>([]);
  const [coinFlipping, setCoinFlipping] = useState(false);
  const processing = useRef(false);

  const ownedIds = [...new Set(collection.map(o => o.monsterId))];

  function addPopup(side: 'player' | 'enemy', type: PopupType, value?: number) {
    const id = ++pid;
    setPopups(p => [...p, { id, type, value, side }]);
    setTimeout(() => setPopups(p => p.filter(x => x.id !== id)), 1300);
  }
  function doShake(side: 'player' | 'enemy') {
    setShake(side);
    setTimeout(() => setShake(null), 500);
  }
  function addLog(cur: BattleState, msg: string): BattleState {
    return { ...cur, log: [...cur.log.slice(-19), msg] };
  }
  function checkWin(b: BattleState): BattleState {
    if (b.playerHp <= 0) return { ...b, status: 'lost' };
    if (b.enemyHp <= 0) return { ...b, status: 'won' };
    return b;
  }

  // ── apply one attack ──────────────────────────────────────
  const applyAttack = useCallback((
    cur: BattleState,
    attacker: MonsterDef, defender: MonsterDef,
    skill: Skill, coins: boolean[] | null, isPlayer: boolean,
  ): BattleState => {
    let b = { ...cur };

    // dodge
    const dodgeChance = defender.passive?.type === 'dodge' ? defender.passive.value : 0;
    if (dodgeChance > 0 && Math.random() * 100 < dodgeChance) {
      addPopup(isPlayer ? 'enemy' : 'player', 'dodge');
      return addLog(b, `${defender.name} dodged!`);
    }

    const { dmg, healed, doubleHit } = calcDamage(attacker, skill, coins, cur, isPlayer);

    // armor absorption
    const armorKey = isPlayer ? 'enemyArmorHp' : 'playerArmorHp';
    let remaining = dmg;
    if (b[armorKey] > 0) {
      const absorbed = Math.min(b[armorKey], remaining);
      remaining -= absorbed;
      b[armorKey] -= absorbed;
    }

    if (isPlayer) b.enemyHp = Math.max(0, b.enemyHp - remaining);
    else {
      b.playerHp = Math.max(0, b.playerHp - remaining);
      if (defender.passive?.type === 'armor') {
        b.playerArmorHp += defender.passive.value;
        addPopup('player', 'heal', defender.passive.value);
      }
    }

    addPopup(isPlayer ? 'enemy' : 'player', 'damage', remaining);
    doShake(isPlayer ? 'enemy' : 'player');
    b = addLog(b, `${attacker.name} used ${skill.name} (${remaining} dmg)`);

    if (doubleHit) {
      const bonus = Math.round(remaining * 0.8);
      if (isPlayer) b.enemyHp = Math.max(0, b.enemyHp - bonus);
      else b.playerHp = Math.max(0, b.playerHp - bonus);
      addPopup(isPlayer ? 'enemy' : 'player', 'damage', bonus);
      b = addLog(b, `${attacker.name} strikes again (${bonus} dmg)!`);
    }

    if (healed > 0) {
      if (isPlayer) b.playerHp = Math.min(attacker.hp, b.playerHp + healed);
      else b.enemyHp = Math.min(attacker.hp, b.enemyHp + healed);
      addPopup(isPlayer ? 'player' : 'enemy', 'heal', healed);
      b = addLog(b, `${attacker.name} healed ${healed} HP`);
    }

    // regen
    const regenKey = isPlayer ? 'playerRegenCounter' : 'enemyRegenCounter';
    if (attacker.passive?.type === 'regen') {
      b[regenKey] = (b[regenKey] + 1) % 2;
      if (b[regenKey] === 0) {
        const heal = attacker.passive.value;
        if (isPlayer) b.playerHp = Math.min(attacker.hp, b.playerHp + heal);
        else b.enemyHp = Math.min(attacker.hp, b.enemyHp + heal);
        addPopup(isPlayer ? 'player' : 'enemy', 'heal', heal);
        b = addLog(b, `${attacker.name} regenerated ${heal} HP`);
      }
    }

    return b;
  }, []);

  // ── enemy turn ────────────────────────────────────────────
  const doEnemyTurn = useCallback((cur: BattleState) => {
    if (cur.status !== 'fighting') return;
    const enemy = getMonsterById(cur.enemyMonsterId);
    const player = getMonsterById(cur.playerMonsterId);
    if (!enemy || !player) return;
    const skillIdx = enemy.skills[1].coinToss ? 0 : (Math.random() < 0.5 ? 0 : 1);
    let next = applyAttack(cur, enemy, player, enemy.skills[skillIdx], null, false);
    next = checkWin({ ...next, turn: 'player' });
    setBs(next);
  }, [applyAttack]);

  // ── player uses skill ─────────────────────────────────────
  const useSkill = useCallback((skillIndex: number) => {
    if (!bs || bs.turn !== 'player' || bs.status !== 'fighting' || processing.current) return;
    const player = getMonsterById(bs.playerMonsterId);
    if (!player) return;
    const skill = player.skills[skillIndex];

    if (skill.coinToss) {
      setPendingCoin({ skillIndex, remaining: skill.coinToss.count });
      setCoinResults([]);
      return;
    }

    processing.current = true;
    const enemy = getMonsterById(bs.enemyMonsterId)!;
    let next = applyAttack(bs, player, enemy, skill, null, true);
    next = checkWin({ ...next, turn: 'enemy', turnCount: next.turnCount + 1 });
    setBs(next);
    processing.current = false;

    if (next.status === 'fighting') setTimeout(() => doEnemyTurn(next), 1100);
    else if (next.status === 'won') addGold(100);
  }, [bs, applyAttack, doEnemyTurn, addGold]);

  // ── coin toss ─────────────────────────────────────────────
  const tossCoin = useCallback(async () => {
    if (!pendingCoin || coinFlipping || !bs) return;
    setCoinFlipping(true);
    await new Promise(r => setTimeout(r, 750));
    const result = Math.random() < 0.5;
    const newResults = [...coinResults, result];
    setCoinResults(newResults);
    setCoinFlipping(false);

    if (newResults.length >= pendingCoin.remaining) {
      await new Promise(r => setTimeout(r, 350));
      const player = getMonsterById(bs.playerMonsterId)!;
      const enemy = getMonsterById(bs.enemyMonsterId)!;
      const skill = player.skills[pendingCoin.skillIndex];
      let next = applyAttack(bs, player, enemy, skill, newResults, true);
      next = checkWin({ ...next, turn: 'enemy', turnCount: next.turnCount + 1 });
      setBs(next);
      setPendingCoin(null);
      setCoinResults([]);
      if (next.status === 'fighting') setTimeout(() => doEnemyTurn(next), 1100);
      else if (next.status === 'won') addGold(100);
    }
  }, [pendingCoin, coinFlipping, coinResults, bs, applyAttack, doEnemyTurn, addGold]);

  // ── no battle → select monster ────────────────────────────
  if (!bs) {
    return (
      <SelectScreen
        ownedIds={ownedIds}
        preSelected={selectedBattleMonster}
        onBack={() => { selectBattleMonster(null); setPage('home'); }}
        onStart={(id) => {
          selectBattleMonster(id);
          setBs(makeBattleState(id));
          setPendingCoin(null);
          setCoinResults([]);
        }}
      />
    );
  }

  const playerDef = getMonsterById(bs.playerMonsterId)!;
  const enemyDef = getMonsterById(bs.enemyMonsterId)!;

  // ── end screen ────────────────────────────────────────────
  if (bs.status === 'won' || bs.status === 'lost') {
    return (
      <EndScreen
        won={bs.status === 'won'}
        playerDef={playerDef}
        enemyDef={enemyDef}
        onRematch={() => {
          setBs(makeBattleState(playerDef.id));
          setPendingCoin(null);
          setCoinResults([]);
        }}
        onHome={() => { selectBattleMonster(null); setPage('home'); setBs(null); }}
      />
    );
  }

  // ── battle UI ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30">
        <button onClick={() => { selectBattleMonster(null); setPage('home'); setBs(null); }}
          className="flex items-center gap-1 text-slate-300 hover:text-white text-sm">
          <ChevronLeft size={18} /> Quit
        </button>
        <span className="text-slate-400 text-xs">Turn {bs.turnCount + 1} — {bs.turn === 'player' ? 'Your Turn' : 'Enemy...'}</span>
        <div className="w-16" />
      </div>

      {/* arena */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* enemy */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 relative">
          <MonsterLabel def={enemyDef} hp={bs.enemyHp} armor={bs.enemyArmorHp} flip />
          <div className="relative">
            {popups.filter(p => p.side === 'enemy').map(p => <FloatPopup key={p.id} {...p} />)}
            <motion.div animate={shake === 'enemy' ? { x: [-5, 5, -4, 4, 0] } : {}} transition={{ duration: 0.35 }}>
              <MonsterSprite row={enemyDef.spriteRow} col={enemyDef.spriteCol} sheet={enemyDef.spriteSheet} size={96} className="drop-shadow-2xl" />
            </motion.div>
          </div>
        </div>

        <div className="hidden md:flex flex-col items-center justify-center px-2">
          <div className="w-px bg-white/8 flex-1" />
          <span className="text-white/15 font-black py-2">VS</span>
          <div className="w-px bg-white/8 flex-1" />
        </div>

        {/* player */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 relative">
          <div className="relative">
            {popups.filter(p => p.side === 'player').map(p => <FloatPopup key={p.id} {...p} />)}
            <motion.div animate={shake === 'player' ? { x: [-5, 5, -4, 4, 0] } : {}} transition={{ duration: 0.35 }}>
              <MonsterSprite row={playerDef.spriteRow} col={playerDef.spriteCol} sheet={playerDef.spriteSheet} size={96} className="drop-shadow-2xl" />
            </motion.div>
          </div>
          <MonsterLabel def={playerDef} hp={bs.playerHp} armor={bs.playerArmorHp} />
        </div>
      </div>

      {/* bottom panel */}
      <div className="bg-black/40 backdrop-blur border-t border-white/10 p-4 space-y-3">
        {/* coin toss */}
        <AnimatePresence>
          {pendingCoin && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-slate-800/80 border border-amber-500/25 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-amber-300 font-bold text-sm">
                  Coin Toss — {coinResults.length}/{pendingCoin.remaining} flipped
                </p>
                <div className="flex gap-2">
                  {Array.from({ length: pendingCoin.remaining }).map((_, i) => {
                    const res = coinResults[i];
                    return (
                      <motion.div key={i}
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border-2 ${
                          res === undefined ? 'border-slate-600 bg-slate-700 text-slate-500' :
                          res ? 'border-amber-400 bg-amber-500/25 text-amber-300' : 'border-slate-500 bg-slate-700 text-slate-400'
                        }`}
                        animate={res === undefined && i === coinResults.length ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        {res === undefined ? '?' : res ? 'H' : 'T'}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={tossCoin}
                disabled={coinFlipping || coinResults.length >= pendingCoin.remaining}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-black rounded-xl disabled:opacity-50"
              >
                {coinFlipping ? '...' : coinResults.length >= pendingCoin.remaining ? 'Resolving...' : 'Toss Coin!'}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* skill buttons */}
        {!pendingCoin && (
          <div className="grid grid-cols-2 gap-3">
            {playerDef.skills.map((sk, i) => (
              <motion.button key={i}
                whileHover={bs.turn === 'player' ? { scale: 1.02 } : {}}
                whileTap={bs.turn === 'player' ? { scale: 0.97 } : {}}
                onClick={() => useSkill(i)}
                disabled={bs.turn !== 'player'}
                className={`flex flex-col items-start gap-1 p-3 rounded-2xl border text-left transition-all
                  ${bs.turn === 'player'
                    ? 'bg-gradient-to-br from-blue-950/80 to-blue-900/60 border-blue-500/35 hover:border-blue-400/55 cursor-pointer'
                    : 'bg-slate-800/50 border-slate-700/30 opacity-40 cursor-not-allowed'}`}
              >
                <div className="flex items-center gap-2 w-full">
                  {sk.isElectric && <Zap size={11} className="text-yellow-400" />}
                  {sk.coinToss && <span className="text-amber-400 text-xs">🪙</span>}
                  <span className="text-white font-bold text-sm flex-1">{sk.name}</span>
                  {sk.damage > 0 && <span className="text-red-400 font-black text-sm">{sk.damage}</span>}
                </div>
                <p className="text-slate-400 text-xs leading-tight">{sk.description}</p>
              </motion.button>
            ))}
          </div>
        )}

        {/* log */}
        <div className="bg-slate-900/60 border border-white/8 rounded-xl p-3 max-h-20 overflow-y-auto space-y-0.5">
          {bs.log.slice().reverse().map((msg, i) => (
            <p key={i} className={`text-xs ${i === 0 ? 'text-white' : 'text-slate-500'}`}>{msg}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────

function MonsterLabel({ def, hp, armor, flip }: { def: MonsterDef; hp: number; armor: number; flip?: boolean }) {
  const pct = Math.max(0, Math.min(100, (hp / def.hp) * 100));
  const barColor = pct > 50 ? 'from-green-500 to-emerald-400' : pct > 25 ? 'from-yellow-500 to-amber-400' : 'from-red-600 to-red-400';
  return (
    <div className={`w-full max-w-[220px] space-y-1 ${flip ? 'text-right' : 'text-left'}`}>
      <div className="flex justify-between items-center">
        <span className="text-white font-bold text-sm">{def.name}</span>
        <span className="text-slate-400 text-xs">{hp}/{def.hp}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
        <motion.div animate={{ width: `${pct}%` }} transition={{ type: 'spring', stiffness: 100, damping: 18 }}
          className={`h-2.5 rounded-full bg-gradient-to-r ${barColor}`} />
      </div>
      {armor > 0 && (
        <div className="flex items-center gap-1">
          <Shield size={10} className="text-blue-400" />
          <span className="text-blue-400 text-xs font-bold">{armor}</span>
        </div>
      )}
    </div>
  );
}

function FloatPopup({ type, value }: Popup) {
  return (
    <motion.div
      initial={{ opacity: 1, y: 0, scale: 0.9 }}
      animate={{ opacity: 0, y: -48, scale: 1.2 }}
      transition={{ duration: 1.1 }}
      className={`absolute top-0 left-1/2 -translate-x-1/2 font-black text-lg pointer-events-none z-20 drop-shadow-lg ${POPUP_COLOR[type]}`}
    >
      {type === 'dodge' ? 'DODGE!' : type === 'heal' ? `+${value} HP` : `-${value}`}
    </motion.div>
  );
}

function SelectScreen({ ownedIds, preSelected, onBack, onStart }: {
  ownedIds: number[]; preSelected: number | null;
  onBack: () => void; onStart: (id: number) => void;
}) {
  const [chosen, setChosen] = useState<number | null>(preSelected);
  const ownedMonsters = allMonsters.filter(m => ownedIds.includes(m.id));

  if (ownedMonsters.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <p className="text-white text-lg font-bold">No monsters in collection!</p>
        <button onClick={onBack} className="px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold">Go Pull Cards</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950">
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-black/30">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-300 hover:text-white"><ChevronLeft size={20} /> Back</button>
        <h2 className="text-white font-black text-xl">Choose Fighter</h2>
        <div className="w-16" />
      </div>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
          {ownedMonsters.map(m => (
            <MonsterCard key={m.id} monster={m} onClick={() => setChosen(m.id)} selected={chosen === m.id} />
          ))}
        </div>
        <div className="flex justify-center">
          <motion.button
            whileHover={chosen !== null ? { scale: 1.03 } : {}}
            whileTap={chosen !== null ? { scale: 0.97 } : {}}
            onClick={() => chosen !== null && onStart(chosen)}
            disabled={chosen === null}
            className="px-10 py-3.5 bg-gradient-to-r from-red-600 to-rose-700 text-white font-black text-lg rounded-2xl shadow-xl disabled:opacity-40"
          >
            Battle!
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function EndScreen({ won, playerDef, enemyDef, onRematch, onHome }: {
  won: boolean; playerDef: MonsterDef; enemyDef: MonsterDef;
  onRematch: () => void; onHome: () => void;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className={`min-h-screen flex flex-col items-center justify-center gap-8 px-4 ${won ? 'bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950' : 'bg-gradient-to-br from-slate-950 via-red-950 to-slate-950'}`}>
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }} className="text-center">
        <h1 className={`text-7xl font-black ${won ? 'text-emerald-400' : 'text-red-400'}`}>{won ? 'VICTORY!' : 'DEFEAT'}</h1>
        {won && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 mt-3">
            <Coins className="text-amber-400" size={20} />
            <span className="text-amber-300 font-bold text-xl">+100 Gold Earned!</span>
          </motion.div>
        )}
      </motion.div>

      <div className="flex items-center gap-10">
        <motion.div initial={{ x: -40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center gap-2">
          <MonsterSprite row={playerDef.spriteRow} col={playerDef.spriteCol} sheet={playerDef.spriteSheet} size={96} />
          <span className="text-white font-bold">{playerDef.name}</span>
          {won && <span className="text-emerald-400 text-xs font-bold">WINNER</span>}
        </motion.div>
        <span className="text-white/20 font-black text-2xl">VS</span>
        <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-col items-center gap-2 opacity-50">
          <MonsterSprite row={enemyDef.spriteRow} col={enemyDef.spriteCol} sheet={enemyDef.spriteSheet} size={96} />
          <span className="text-white font-bold">{enemyDef.name}</span>
        </motion.div>
      </div>

      <div className="flex gap-4">
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={onRematch}
          className="px-8 py-3 bg-gradient-to-r from-red-600 to-rose-700 text-white font-black rounded-2xl shadow-lg">Rematch</motion.button>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} onClick={onHome}
          className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/15">Home</motion.button>
      </div>
    </motion.div>
  );
}
