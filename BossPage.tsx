import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Sword, Heart, Gift, Crown, Sparkles, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import allMonsters, { getMonsterById } from '../data/index';
import MonsterSprite from '../components/MonsterSprite';
import { MonsterDef, FRAGMENT_VALUES } from '../types';

interface BossState {
  bossMonsterId: number;
  bossHp: number;
  maxHp: number;
  date: string;
  cleared: boolean;
  attempts: number;
}

export default function BossPage() {
  const {
    collection, gold, addGold, addUniversalFragments, addPokemonFragments,
    addItem, upgrades, lastError, lastSuccess, setError, setSuccess, setPage
  } = useGameStore();
  const { user } = useAuth();
  const [boss, setBoss] = useState<BossState | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonster, setSelectedMonster] = useState<number | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [inBattle, setInBattle] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardData, setRewardData] = useState<{ gold: number; fragments: number; pokeFrags: number } | null>(null);

  useEffect(() => {
    loadBoss();
  }, [user]);

  const loadBoss = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: existingBoss, error } = await supabase
        .from('daily_boss')
        .select('*')
        .eq('date', today)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingBoss && !error) {
        setBoss({
          bossMonsterId: existingBoss.boss_monster_id,
          bossHp: existingBoss.boss_hp,
          maxHp: existingBoss.max_hp,
          date: existingBoss.date,
          cleared: existingBoss.cleared,
          attempts: existingBoss.attempts,
        });
      } else {
        // Generate new boss
        const mythicalMonsters = allMonsters.filter(m => m.rarity === 'mythical');
        const bossMonster = mythicalMonsters[Math.floor(Math.random() * mythicalMonsters.length)];
        const bossHp = bossMonster.hp * 5;

        const newBoss: BossState = {
          bossMonsterId: bossMonster.id,
          bossHp,
          maxHp: bossHp,
          date: today,
          cleared: false,
          attempts: 0,
        };

        const { error: insertError } = await supabase.from('daily_boss').insert({
          user_id: user.id,
          boss_monster_id: newBoss.bossMonsterId,
          boss_hp: newBoss.bossHp,
          max_hp: newBoss.maxHp,
          date: newBoss.date,
          cleared: newBoss.cleared,
          attempts: newBoss.attempts,
        });

        if (!insertError) {
          setBoss(newBoss);
        } else {
          console.error('Error creating boss:', insertError);
          setBoss(newBoss);
        }
      }
    } catch (err) {
      console.error('Error loading boss:', err);
      setError('Failed to load boss');
    }
    setLoading(false);
  };

  const startBattle = async () => {
    if (!boss || !selectedMonster || boss.cleared || inBattle) return;

    setInBattle(true);
    setBattleLog([`Battle started against ${getMonsterById(boss.bossMonsterId)?.name}!`]);

    const playerMonster = getMonsterById(selectedMonster);
    const bossMonster = getMonsterById(boss.bossMonsterId);
    if (!playerMonster || !bossMonster) {
      setInBattle(false);
      return;
    }

    // Get player upgrade level
    const owned = collection.find(o => o.monsterId === selectedMonster);
    const upgrade = owned ? upgrades[owned.uid] : null;
    const levelBonus = upgrade ? (upgrade.level - 1) * 0.05 : 0;

    let playerHp = Math.floor(playerMonster.hp * (1 + levelBonus) * 3);
    const playerMaxHp = playerHp;
    let bossHp = boss.bossHp;
    let turn = 0;
    const maxTurns = 50;

    while (playerHp > 0 && bossHp > 0 && turn < maxTurns) {
      turn++;

      // Player attacks
      const skillIndex = Math.random() < 0.5 ? 0 : 1;
      const baseDamage = playerMonster.skills[skillIndex].damage;
      const skillLevel = upgrade ? (skillIndex === 0 ? upgrade.skill1Level : upgrade.skill2Level) : 1;
      const skillBonus = (skillLevel - 1) * 3;
      const playerDamage = Math.floor((baseDamage + skillBonus) * (0.85 + Math.random() * 0.3) * (1 + levelBonus));
      bossHp = Math.max(0, bossHp - playerDamage);

      setBattleLog(log => [...log, `Turn ${turn}: ${playerMonster.name} deals ${playerDamage} damage! Boss HP: ${bossHp}/${boss.maxHp}`]);

      if (bossHp <= 0) break;

      await new Promise(r => setTimeout(r, 150));

      // Boss attacks
      const bossDamage = Math.floor(bossMonster.skills[1].damage * (0.7 + Math.random() * 0.6) * 1.5);
      playerHp = Math.max(0, playerHp - bossDamage);

      setBattleLog(log => [...log, `Turn ${turn}: Boss deals ${bossDamage} damage! Your HP: ${playerHp}/${playerMaxHp}`]);

      await new Promise(r => setTimeout(r, 150));
    }

    // Battle result
    const won = bossHp <= 0;
    const newAttempts = boss.attempts + 1;

    // Update boss state in Supabase
    await supabase.from('daily_boss')
      .update({
        boss_hp: bossHp,
        cleared: won,
        attempts: newAttempts,
      })
      .eq('user_id', user!.id)
      .eq('date', boss.date);

    setBoss(prev => prev ? { ...prev, bossHp, cleared: won, attempts: newAttempts } : null);

    if (won) {
      // Calculate rewards
      const goldReward = 500;
      const fragReward = 50;
      const pokeFragReward = 20;

      // Apply rewards
      addGold(goldReward);
      addUniversalFragments(fragReward);
      addPokemonFragments(boss.bossMonsterId, pokeFragReward);
      addItem('boss_material', 1);

      setRewardData({ gold: goldReward, fragments: fragReward, pokeFrags: pokeFragReward });
      setShowReward(true);
      setBattleLog(log => [...log, `VICTORY! Rewards: ${goldReward} Gold, ${fragReward} Universal Fragments, ${pokeFragReward} Pokemon Fragments!`]);
    } else {
      setBattleLog(log => [...log, `DEFEAT! The boss was too powerful. Try again!`]);
      setError('Defeated! Train your monsters and try again.');
    }

    setInBattle(false);
  };

  // Get usable monsters with proper upgrade stats
  const ownedIds = [...new Set(collection.map(o => o.monsterId))];
  const usableMonsters = ownedIds.map(id => {
    const def = getMonsterById(id);
    const owned = collection.find(o => o.monsterId === id);
    const upgrade = owned ? upgrades[owned.uid] : null;
    return { def, upgrade, uid: owned?.uid };
  }).filter(m => m.def) as { def: MonsterDef; upgrade?: { level: number; skill1Level: number; skill2Level: number }; uid?: string }[];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  const bossDef = boss ? getMonsterById(boss.bossMonsterId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-red-950 to-slate-950">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30">
        <button onClick={() => setPage('home')} className="flex items-center gap-1 text-slate-300 hover:text-white">
          <ChevronLeft size={20} /> Back
        </button>
        <h2 className="text-white font-black text-xl flex items-center gap-2">
          <Crown size={20} className="text-red-400" /> Daily Boss
        </h2>
        <div className="w-16" />
      </div>

      {/* Notification toasts */}
      <AnimatePresence>
        {lastError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-red-900/90 border border-red-500/50 rounded-xl text-red-200 text-sm flex items-center gap-2"
            onClick={() => setError(null)}
          >
            <AlertCircle size={16} /> {lastError}
          </motion.div>
        )}
        {lastSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-900/90 border border-emerald-500/50 rounded-xl text-emerald-200 text-sm flex items-center gap-2"
            onClick={() => setSuccess(null)}
          >
            <CheckCircle size={16} /> {lastSuccess}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward popup */}
      <AnimatePresence>
        {showReward && rewardData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowReward(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gradient-to-b from-amber-950 to-slate-900 border border-amber-500/30 rounded-2xl p-6 max-w-sm w-full text-center"
            >
              <Crown size={48} className="text-amber-400 mx-auto mb-4" />
              <h3 className="text-amber-400 font-black text-2xl mb-4">BOSS DEFEATED!</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-amber-500/10 rounded-lg p-3">
                  <span className="text-slate-300 flex items-center gap-2"><Gift size={16} /> Gold</span>
                  <span className="text-amber-400 font-bold">+{rewardData.gold}</span>
                </div>
                <div className="flex items-center justify-between bg-purple-500/10 rounded-lg p-3">
                  <span className="text-slate-300 flex items-center gap-2"><Star size={16} /> Universal Fragments</span>
                  <span className="text-purple-400 font-bold">+{rewardData.fragments}</span>
                </div>
                <div className="flex items-center justify-between bg-blue-500/10 rounded-lg p-3">
                  <span className="text-slate-300 flex items-center gap-2"><Sparkles size={16} /> Pokemon Fragments</span>
                  <span className="text-blue-400 font-bold">+{rewardData.pokeFrags}</span>
                </div>
              </div>
              <button
                onClick={() => setShowReward(false)}
                className="mt-4 px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl"
              >
                Claim Rewards
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* boss info */}
        {bossDef && boss && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-b from-red-950/50 to-slate-900/50 border border-red-500/30 rounded-2xl p-6 text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
                <MonsterSprite row={bossDef.spriteRow} col={bossDef.spriteCol} sheet={bossDef.spriteSheet} size={120} className="relative z-10" />
              </div>
            </div>
            <h3 className="text-red-400 font-black text-2xl mb-1">{bossDef.name}</h3>
            <p className="text-slate-400 text-sm mb-4">{bossDef.description}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-center gap-3">
                <Heart size={16} className="text-red-500" />
                <span className="text-white font-bold">
                  HP: {boss.bossHp.toLocaleString()} / {boss.maxHp.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden">
                <motion.div
                  animate={{ width: `${Math.max(0, (boss.bossHp / boss.maxHp) * 100)}%` }}
                  className="h-4 bg-gradient-to-r from-red-600 to-orange-500"
                />
              </div>
              <div className="flex items-center justify-center gap-4 text-sm text-slate-400">
                <span>Level: Mythical (5x HP)</span>
                <span>|</span>
                <span>Attempts: {boss.attempts}</span>
                <span>|</span>
                <span className={`font-bold ${boss.cleared ? 'text-green-400' : 'text-amber-400'}`}>
                  {boss.cleared ? 'CLEARED' : 'ACTIVE'}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* rewards preview */}
        {!boss?.cleared && (
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
            <h4 className="text-slate-300 font-bold text-sm mb-3 flex items-center gap-2">
              <Gift size={16} className="text-amber-400" /> Rewards for Defeating
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-center">
                <Gift size={20} className="text-amber-400 mx-auto mb-1" />
                <p className="text-amber-300 font-bold">+500</p>
                <p className="text-slate-500 text-xs">Gold</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                <Star size={20} className="text-purple-400 mx-auto mb-1" />
                <p className="text-purple-300 font-bold">+50</p>
                <p className="text-slate-500 text-xs">Universal</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                <Sparkles size={20} className="text-blue-400 mx-auto mb-1" />
                <p className="text-blue-300 font-bold">+20</p>
                <p className="text-slate-500 text-xs">Pokemon Frag</p>
              </div>
            </div>
          </div>
        )}

        {/* select monster */}
        {!inBattle && !boss?.cleared && (
          <div className="space-y-4">
            <h4 className="text-slate-300 font-bold text-sm">Select Your Fighter ({usableMonsters.length} available)</h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
              {usableMonsters.map(({ def, upgrade }) => (
                <motion.button
                  key={def.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMonster(def.id)}
                  className={`p-2 rounded-xl border transition-all ${
                    selectedMonster === def.id
                      ? 'bg-blue-900/50 border-blue-500'
                      : 'bg-slate-800/50 border-white/10 hover:border-white/30'
                  }`}
                >
                  <MonsterSprite row={def.spriteRow} col={def.spriteCol} sheet={def.spriteSheet} size={40} className="mx-auto" />
                  <p className="text-white text-xs font-bold mt-1 truncate">{def.name}</p>
                  <p className="text-slate-500 text-[10px]">Lv.{upgrade?.level ?? 1}</p>
                </motion.button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: selectedMonster ? 1.02 : 1 }}
              whileTap={{ scale: selectedMonster ? 0.98 : 1 }}
              onClick={startBattle}
              disabled={!selectedMonster || boss?.cleared || inBattle}
              className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 ${
                selectedMonster && !boss?.cleared && !inBattle
                  ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Sword size={20} />
              {inBattle ? 'Battle in Progress...' : 'Challenge Boss'}
            </motion.button>
          </div>
        )}

        {/* battle log */}
        {battleLog.length > 0 && (
          <div className="bg-slate-900/70 border border-white/10 rounded-xl p-4 max-h-60 overflow-y-auto space-y-1">
            {battleLog.map((log, i) => (
              <p key={i} className={`text-xs ${i === battleLog.length - 1 ? 'text-white font-bold' : 'text-slate-500'}`}>
                {log}
              </p>
            ))}
          </div>
        )}

        {/* cleared message */}
        {boss?.cleared && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-r from-emerald-900/50 to-teal-900/50 border border-emerald-500/30 rounded-2xl p-8 text-center"
          >
            <Crown size={48} className="text-yellow-400 mx-auto mb-4" />
            <h3 className="text-emerald-400 font-black text-2xl mb-2">BOSS DEFEATED!</h3>
            <p className="text-slate-400">Come back tomorrow for a new challenge.</p>
            <div className="mt-4 text-sm text-slate-500">
              <p>Attempts taken: {boss.attempts}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
