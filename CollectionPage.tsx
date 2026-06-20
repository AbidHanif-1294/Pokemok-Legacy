import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Search, X, Sword, Zap, Flame, Droplets, Snowflake, Sparkles, Skull, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { Rarity, MonsterDef, Element } from '../types';
import allMonsters from '../data/index';
import MonsterCard from '../components/MonsterCard';
import MonsterSprite from '../components/MonsterSprite';

type Filter = 'all' | Rarity;

const FILTER_STYLES: Record<Filter, string> = {
  all: 'bg-slate-600 text-white',
  common: 'bg-slate-500 text-white',
  rare: 'bg-blue-600 text-white',
  legendary: 'bg-amber-500 text-black',
  mythical: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
};

const ELEMENT_COLORS: Record<Element, string> = {
  Fire: 'text-orange-400', Water: 'text-blue-400', Earth: 'text-amber-400',
  Wind: 'text-teal-400', Nature: 'text-green-400', Dark: 'text-purple-400',
  Light: 'text-yellow-400', Electric: 'text-yellow-300', Ice: 'text-cyan-400',
  Mystic: 'text-pink-400', Steel: 'text-slate-400', Cosmic: 'text-indigo-400',
};

export default function CollectionPage() {
  const { collection, upgrades, pokemonFragments, setPage, selectBattleMonster, lastError, lastSuccess, setError, setSuccess } = useGameStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<{ def: MonsterDef; uid: string } | null>(null);

  const ownedIds = new Set(collection.map(o => o.monsterId));
  const countMap = new Map<number, number>();
  collection.forEach(o => countMap.set(o.monsterId, (countMap.get(o.monsterId) ?? 0) + 1));

  // Get unique monsters with their upgrade data
  const uniqueMonsters = Array.from(ownedIds).map(id => {
    const def = allMonsters.find(m => m.id === id);
    const owned = collection.find(o => o.monsterId === id);
    const upgrade = owned ? upgrades[owned.uid] : null;
    return { def, upgrade, uid: owned?.uid };
  }).filter(m => m.def) as { def: MonsterDef; upgrade?: any; uid?: string }[];

  const filtered = uniqueMonsters.filter(m => {
    if (filter !== 'all' && m.def.rarity !== filter) return false;
    if (search && !m.def.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-teal-950 to-slate-950">
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-4 border-b border-white/10 bg-black/40 backdrop-blur">
        <button onClick={() => setPage('home')} className="flex items-center gap-1 text-slate-300 hover:text-white">
          <ChevronLeft size={20} /> Back
        </button>
        <h2 className="text-white font-black text-xl">COLLECTION</h2>
        <span className="text-slate-400 text-sm">{filtered.length}/{uniqueMonsters.length}</span>
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

      <div className="max-w-5xl mx-auto px-4 py-5 space-y-4">
        {/* search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search monsters..."
            className="w-full pl-9 pr-9 py-2.5 bg-white/8 border border-white/10 rounded-xl text-white placeholder-slate-500 outline-none focus:border-blue-500/50 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X size={14} />
            </button>
          )}
        </div>

        {/* filters */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'common', 'rare', 'legendary', 'mythical'] as Filter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                filter === f ? FILTER_STYLES[f] + ' shadow scale-105' : 'bg-white/8 text-slate-400 hover:bg-white/15'
              }`}>
              {f}
            </button>
          ))}
        </div>

        {/* empty */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <p className="text-slate-400 text-base font-semibold">
              {collection.length === 0 ? 'No cards yet!' : 'No cards match this filter.'}
            </p>
            {collection.length === 0 && (
              <button onClick={() => setPage('gacha')}
                className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold">
                Pull Some Cards!
              </button>
            )}
          </div>
        )}

        {/* grid */}
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <AnimatePresence>
            {filtered.map(({ def, upgrade, uid }) => (
              <motion.div key={def.id} layout initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }}>
                <div className="relative">
                  <MonsterCard
                    monster={def}
                    onClick={() => setDetail({ def, uid: uid || '' })}
                  />
                  {(countMap.get(def.id) ?? 0) > 1 && (
                    <span className="absolute top-1 right-1 bg-blue-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                      {countMap.get(def.id)}
                    </span>
                  )}
                  {upgrade && upgrade.level > 1 && (
                    <span className="absolute bottom-1 left-1 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      Lv.{upgrade.level}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Stats */}
        {uniqueMonsters.length > 0 && (
          <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-black text-white">{collection.length}</p>
                <p className="text-slate-500 text-xs">Total Cards</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400">{uniqueMonsters.length}</p>
                <p className="text-slate-500 text-xs">Unique Monsters</p>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-400">{Math.round((uniqueMonsters.length / allMonsters.length) * 100)}%</p>
                <p className="text-slate-500 text-xs">Completion</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* detail modal */}
      <AnimatePresence>
        {detail && (
          <motion.div key="bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDetail(null)}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div key="modal" initial={{ scale: 0.85, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0, y: 30 }}
              onClick={e => e.stopPropagation()}
              className="bg-slate-900 border border-white/10 rounded-3xl p-6 max-w-sm w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-widest">{detail.def.rarity} - {detail.def.element}</p>
                  <h3 className="text-white font-black text-xl">{detail.def.name}</h3>
                </div>
                <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-white p-1"><X size={18} /></button>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className={`absolute inset-0 blur-2xl opacity-25 rounded-full ${
                    detail.def.rarity === 'mythical' ? 'bg-purple-500' : detail.def.rarity === 'legendary' ? 'bg-amber-500' :
                    detail.def.rarity === 'rare' ? 'bg-blue-500' : 'bg-slate-400'}`} />
                  <MonsterSprite row={detail.def.spriteRow} col={detail.def.spriteCol} sheet={detail.def.spriteSheet} size={110} />
                </div>

                {/* Upgrade info */}
                {upgrades[detail.uid] && (
                  <div className="grid grid-cols-3 gap-2 w-full text-center">
                    <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-lg p-2">
                      <p className="text-indigo-300 font-bold">{upgrades[detail.uid].level}</p>
                      <p className="text-slate-500 text-xs">Level</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-2">
                      <p className="text-blue-300 font-bold">{upgrades[detail.uid].skill1Level}</p>
                      <p className="text-slate-500 text-xs">Skill 1</p>
                    </div>
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-2">
                      <p className="text-blue-300 font-bold">{upgrades[detail.uid].skill2Level}</p>
                      <p className="text-slate-500 text-xs">Skill 2</p>
                    </div>
                  </div>
                )}

                <p className="text-slate-400 text-sm text-center">{detail.def.description}</p>

                <div className="w-full space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max HP</span>
                    <span className="text-green-400 font-bold">{detail.def.hp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Element</span>
                    <span className={`font-bold ${ELEMENT_COLORS[detail.def.element]}`}>{detail.def.element}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pokemon Fragments</span>
                    <span className="text-blue-400 font-bold">{pokemonFragments[detail.def.id] ?? 0}</span>
                  </div>
                  {detail.def.passive && (
                    <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={12} className="text-amber-400" />
                        <p className="text-amber-400 font-bold text-xs uppercase tracking-wide">Passive: {detail.def.passive.type.replace('_', ' ')}</p>
                      </div>
                      <p className="text-slate-300 text-xs">{detail.def.passive.description}</p>
                    </div>
                  )}
                  {detail.def.skills.map((sk, i) => (
                    <div key={i} className="bg-blue-500/10 border border-blue-500/15 rounded-xl px-3 py-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1.5">
                          {sk.isElectric && <Zap size={10} className="text-yellow-400" />}
                          {sk.coinToss && <span className="text-amber-400 text-[10px]">COIN</span>}
                          <p className="text-blue-300 font-bold text-xs">{sk.name}</p>
                        </div>
                        {sk.damage > 0 && <span className="text-red-400 font-black text-xs">{sk.damage} DMG</span>}
                      </div>
                      <p className="text-slate-400 text-xs mt-0.5">{sk.description}</p>
                      {sk.effect && (
                        <p className="text-purple-300 text-[10px] mt-1">
                          Effect: {sk.effect.type} ({sk.effect.chance}% chance, {sk.effect.duration} turns)
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => { selectBattleMonster(detail.def.id); setPage('battle'); }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-sm transition-colors"
                  >
                    <Sword size={14} /> Battle
                  </button>
                  <button
                    onClick={() => { setDetail(null); setPage('upgrade'); }}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm transition-colors"
                  >
                    Upgrade
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
