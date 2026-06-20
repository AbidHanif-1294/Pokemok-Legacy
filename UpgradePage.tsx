import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowUp, Star, Zap, Flame, Droplets, Snowflake, Sparkles, Skull, AlertCircle, CheckCircle } from 'lucide-react';
import { useGameStore, getLevelCost, getSkillCost, MAX_MONSTER_LEVEL, MAX_SKILL_LEVEL } from '../store/gameStore';
import { useAuth } from '../context/AuthContext';
import allMonsters, { getMonsterById } from '../data/index';
import MonsterSprite from '../components/MonsterSprite';
import { MonsterDef, Element } from '../types';

const ELEMENT_COLORS: Record<Element, string> = {
  Fire: 'from-orange-600 to-red-700', Water: 'from-blue-600 to-cyan-700', Earth: 'from-amber-700 to-yellow-800',
  Wind: 'from-teal-600 to-emerald-700', Nature: 'from-green-600 to-emerald-700', Dark: 'from-purple-700 to-violet-900',
  Light: 'from-yellow-500 to-amber-600', Electric: 'from-yellow-500 to-blue-500', Ice: 'from-cyan-400 to-blue-600',
  Mystic: 'from-purple-600 to-pink-600', Steel: 'from-slate-500 to-zinc-700', Cosmic: 'from-indigo-600 to-purple-800',
};

const ELEMENT_ICONS: Record<Element, React.ReactNode> = {
  Fire: <Flame size={14} />, Water: <Droplets size={14} />, Earth: <Star size={14} />,
  Wind: <Zap size={14} />, Nature: <Sparkles size={14} />, Dark: <Skull size={14} />,
  Light: <Star size={14} />, Electric: <Zap size={14} />, Ice: <Snowflake size={14} />,
  Mystic: <Sparkles size={14} />, Steel: <Star size={14} />, Cosmic: <Star size={14} />,
};

export default function UpgradePage() {
  const {
    collection, gold, universalFragments, pokemonFragments, upgrades,
    setPage, upgradeMonsterLevel, upgradeSkillLevel,
    lastError, lastSuccess, setError, setSuccess
  } = useGameStore();
  const { user } = useAuth();
  const [selectedUid, setSelectedUid] = useState<string | null>(null);

  const ownedMonsters = collection.map(o => ({
    owned: o,
    def: getMonsterById(o.monsterId)!,
  })).filter(m => m.def);

  const selected = selectedUid ? ownedMonsters.find(m => m.owned.uid === selectedUid) : null;
  const upgrade = selectedUid ? (upgrades[selectedUid] || { level: 1, skill1Level: 1, skill2Level: 1 }) : null;

  const handleUpgradeLevel = () => {
    if (!selectedUid) return;
    const success = upgradeMonsterLevel(selectedUid);
    if (!success) {
      // Error already set in store
    }
  };

  const handleUpgradeSkill = (skillIdx: 1 | 2) => {
    if (!selectedUid) return;
    const success = upgradeSkillLevel(selectedUid, skillIdx);
    if (!success) {
      // Error already set in store
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30">
        <button onClick={() => setPage('home')} className="flex items-center gap-1 text-slate-300 hover:text-white">
          <ChevronLeft size={20} /> Back
        </button>
        <h2 className="text-white font-black text-xl">Upgrade</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-purple-500/15 px-2.5 py-1.5 rounded-lg border border-purple-500/25">
            <Star size={12} className="text-purple-400" />
            <span className="text-purple-300 font-bold text-xs">{universalFragments}</span>
          </div>
        </div>
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

      <div className="max-w-4xl mx-auto px-4 py-6">
        {ownedMonsters.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">No monsters to upgrade!</p>
            <button onClick={() => setPage('gacha')} className="mt-4 px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold">
              Pull Cards
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* monster list */}
            <div className="space-y-2">
              <h3 className="text-slate-400 text-xs font-bold mb-3">Your Monsters ({ownedMonsters.length})</h3>
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                {ownedMonsters.map(({ owned, def }) => {
                  const upg = upgrades[owned.uid] || { level: 1, skill1Level: 1, skill2Level: 1 };
                  const pfAmount = pokemonFragments[def.id] ?? 0;
                  return (
                    <motion.button
                      key={owned.uid}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedUid(owned.uid)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                        selectedUid === owned.uid
                          ? 'bg-indigo-900/50 border-indigo-500/60'
                          : 'bg-slate-900/50 border-white/10 hover:border-white/25'
                      }`}
                    >
                      <MonsterSprite row={def.spriteRow} col={def.spriteCol} sheet={def.spriteSheet} size={48} />
                      <div className="flex-1 text-left">
                        <p className="text-white font-bold text-sm">{def.name}</p>
                        <p className="text-slate-400 text-xs">Lv.{upg.level} {def.element}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-purple-400">{pfAmount} PF</span>
                          <span className="text-xs text-slate-500">|</span>
                          <span className="text-xs text-blue-400">S1:Lv.{upg.skill1Level}</span>
                          <span className="text-xs text-blue-400">S2:Lv.{upg.skill2Level}</span>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        def.rarity === 'mythical' ? 'bg-purple-600/30 text-purple-300' :
                        def.rarity === 'legendary' ? 'bg-amber-600/30 text-amber-300' :
                        def.rarity === 'rare' ? 'bg-blue-600/30 text-blue-300' : 'bg-slate-600/30 text-slate-300'
                      }`}>
                        {def.rarity.toUpperCase()}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* upgrade panel */}
            <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-4">
              {selected ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <MonsterSprite row={selected.def.spriteRow} col={selected.def.spriteCol} sheet={selected.def.spriteSheet} size={80} />
                    <div>
                      <h3 className="text-white font-black text-lg">{selected.def.name}</h3>
                      <p className="text-slate-400 text-sm">{selected.def.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                          Pokemon Fragments: {pokemonFragments[selected.def.id] ?? 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* monster level */}
                  <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-bold">Monster Level</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-black text-xl">Lv.{upgrade?.level ?? 1}</span>
                        {(upgrade?.level ?? 1) >= MAX_MONSTER_LEVEL && (
                          <span className="text-xs text-amber-400 font-bold">MAX</span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                        style={{ width: `${Math.min(100, ((upgrade?.level ?? 1) / MAX_MONSTER_LEVEL) * 100)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>HP Bonus: +{((upgrade?.level ?? 1) - 1) * 5}%</span>
                      <span>Max: Lv.{MAX_MONSTER_LEVEL}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleUpgradeLevel}
                      disabled={(upgrade?.level ?? 1) >= MAX_MONSTER_LEVEL}
                      className={`w-full py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm ${
                        (upgrade?.level ?? 1) >= MAX_MONSTER_LEVEL
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          : universalFragments >= getLevelCost(upgrade?.level ?? 1)
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUp size={16} />
                      {(upgrade?.level ?? 1) >= MAX_MONSTER_LEVEL ? 'Max Level Reached' :
                        `Upgrade (${getLevelCost(upgrade?.level ?? 1)} UF)`}
                    </motion.button>
                    <p className="text-xs text-slate-500 text-center">Uses Universal Fragments (UF)</p>
                  </div>

                  {/* skills */}
                  <div className="space-y-2">
                    <h4 className="text-slate-300 font-bold text-sm flex items-center gap-2">
                      Skills
                      <span className="text-slate-500 text-xs">Uses Pokemon Fragments (PF)</span>
                    </h4>
                    {selected.def.skills.map((skill, i) => {
                      const skillLevel = i === 0 ? (upgrade?.skill1Level ?? 1) : (upgrade?.skill2Level ?? 1);
                      const bonusDmg = Math.floor((skillLevel - 1) * 3);
                      const cost = getSkillCost(skillLevel);
                      const canAfford = (pokemonFragments[selected.def.id] ?? 0) >= cost;
                      const isMax = skillLevel >= MAX_SKILL_LEVEL;

                      return (
                        <div key={i} className="bg-slate-800/50 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {skill.isElectric && <Zap size={14} className="text-yellow-400" />}
                              <span className="text-white font-bold">{skill.name}</span>
                              {skill.coinToss && <span className="text-amber-400 text-xs">COIN</span>}
                            </div>
                            <span className="text-blue-400 font-bold text-sm">Lv.{skillLevel}</span>
                          </div>
                          <p className="text-slate-500 text-xs">{skill.description}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-red-400">Base: {skill.damage || 'Variable'}</span>
                            <span className="text-green-400">+{bonusDmg} Bonus</span>
                          </div>
                          <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                              style={{ width: `${(skillLevel / MAX_SKILL_LEVEL) * 100}%` }}
                            />
                          </div>
                          <motion.button
                            whileHover={{ scale: isMax ? 1 : 1.02 }}
                            whileTap={{ scale: isMax ? 1 : 0.97 }}
                            onClick={() => handleUpgradeSkill(i === 0 ? 1 : 2)}
                            disabled={isMax || !canAfford}
                            className={`w-full py-2 rounded-lg font-bold text-xs ${
                              isMax
                                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                : canAfford
                                  ? 'bg-blue-600 hover:bg-blue-500 text-white'
                                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            }`}
                          >
                            {isMax ? 'Max Level' : `Upgrade (${cost} PF)`}
                          </motion.button>
                        </div>
                      );
                    })}
                  </div>

                  {/* passive */}
                  {selected.def.passive && (
                    <div className="bg-purple-900/30 border border-purple-500/20 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={14} className="text-purple-400" />
                        <span className="text-purple-300 font-bold text-sm">Passive: {selected.def.passive.type.replace('_', ' ')}</span>
                      </div>
                      <p className="text-slate-400 text-xs">{selected.def.passive.description}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  Select a monster to upgrade
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
