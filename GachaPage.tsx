import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ChevronLeft, Sparkles, Star, AlertCircle, CheckCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import allMonsters, { getMonsterById } from '../data/index';
import MonsterCard from '../components/MonsterCard';
import { FragmentPopup } from '../types';

type Phase = 'idle' | 'spinning' | 'reveal';

export default function GachaPage() {
  const { gold, gachaSingle, gachaTen, lastError, lastSuccess, setError, setSuccess, setPage } = useGameStore();
  const [phase, setPhase] = useState<Phase>('idle');
  const [results, setResults] = useState<{ pulled: any[]; fragments: number; duplicates: number }>({ pulled: [], fragments: 0, duplicates: 0 });
  const [revealIndex, setRevealIndex] = useState(0);
  const [fragmentPopups, setFragmentPopups] = useState<FragmentPopup[]>([]);

  const handleSingle = async () => {
    if (phase !== 'idle' || gold < 100) {
      if (gold < 100) setError('Not enough gold! Need 100 gold.');
      return;
    }
    setPhase('spinning');
    setResults({ pulled: [], fragments: 0, duplicates: 0 });
    setRevealIndex(0);
    setFragmentPopups([]);

    await new Promise(r => setTimeout(r, 1400));

    const result = await gachaSingle();

    if (!result) {
      setPhase('idle');
      return;
    }

    if (result.duplicate) {
      // Show fragment popup for duplicate
      const monsterDef = allMonsters.find(m => m.fragmentValue === result.fragmentGain) || allMonsters[0];
      setFragmentPopups([{
        monsterId: monsterDef.id,
        monsterName: monsterDef.name,
        rarity: monsterDef.rarity,
        amount: result.fragmentGain,
      }]);
      setResults({ pulled: [], fragments: result.fragmentGain, duplicates: 1 });
    } else if (result.pulled) {
      const def = getMonsterById(result.pulled.monsterId);
      setResults({ pulled: [{ ...result.pulled, def }], fragments: 0, duplicates: 0 });
    }

    setPhase('reveal');
    await new Promise(r => setTimeout(r, 300));
    setRevealIndex(1);
  };

  const handleTen = async () => {
    if (phase !== 'idle' || gold < 900) {
      if (gold < 900) setError('Not enough gold! Need 900 gold.');
      return;
    }
    setPhase('spinning');
    setResults({ pulled: [], fragments: 0, duplicates: 0 });
    setRevealIndex(0);
    setFragmentPopups([]);

    await new Promise(r => setTimeout(r, 1600));

    const result = await gachaTen();

    if (!result) {
      setPhase('idle');
      return;
    }

    const pulledWithDefs = result.pulled.map(p => ({
      ...p,
      def: getMonsterById(p.monsterId),
    })).filter(p => p.def);

    setResults({
      pulled: pulledWithDefs,
      fragments: result.fragmentGain,
      duplicates: result.duplicates,
    });

    setPhase('reveal');

    for (let i = 1; i <= pulledWithDefs.length; i++) {
      await new Promise(r => setTimeout(r, 180));
      setRevealIndex(i);
    }
  };

  const closeFragmentPopup = () => {
    setFragmentPopups([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-violet-950 to-slate-950">
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10 bg-black/30 backdrop-blur">
        <button onClick={() => phase === 'idle' || phase === 'reveal' ? setPage('home') : undefined}
          className="flex items-center gap-1 text-slate-300 hover:text-white">
          <ChevronLeft size={20} /> Back
        </button>
        <h2 className="text-white font-black text-xl">GACHA PULL</h2>
        <div className="flex items-center gap-2 bg-amber-500/15 px-3 py-1.5 rounded-xl border border-amber-500/25">
          <Coins className="text-amber-400" size={14} />
          <span className="text-amber-300 font-bold text-sm">{gold.toLocaleString()}</span>
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

      {/* Fragment popup for duplicates */}
      <AnimatePresence>
        {fragmentPopups.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeFragmentPopup}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gradient-to-b from-purple-950 to-slate-900 border border-purple-500/30 rounded-2xl p-6 max-w-sm w-full text-center"
            >
              <Star size={48} className="text-purple-400 mx-auto mb-4" />
              <h3 className="text-purple-300 font-black text-xl mb-2">DUPLICATE CARD!</h3>
              <p className="text-slate-300 text-sm mb-4">
                You already own maximum copies of this monster.
              </p>
              <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-4 mb-4">
                <p className="text-purple-300 font-bold">Converted to Universal Fragments</p>
                <p className="text-3xl font-black text-purple-400 mt-2">+{fragmentPopups[0].amount}</p>
              </div>
              <button
                onClick={closeFragmentPopup}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* spinning overlay */}
      <AnimatePresence>
        {phase === 'spinning' && (
          <motion.div
            key="spin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur"
          >
            <motion.div
              animate={{ rotateY: [0, 360], scale: [1, 1.15, 1] }}
              transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
              className="w-28 h-28 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-800 border-4 border-purple-400 shadow-2xl shadow-purple-500/50 flex items-center justify-center"
            >
              <Sparkles className="text-white" size={44} />
            </motion.div>
            <motion.p
              className="mt-6 text-purple-300 font-bold text-lg"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              Drawing cards...
            </motion.p>
            {[1, 2, 3].map(i => (
              <motion.div key={i}
                className="absolute border-2 border-purple-500/20 rounded-full"
                animate={{ scale: [1, 2.8], opacity: [0.5, 0] }}
                transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.43 }}
                style={{ width: 80, height: 80 }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col items-center gap-8">
        {/* pull buttons */}
        {phase === 'idle' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <PullBtn
              label="Single Pull"
              cost={100}
              canAfford={gold >= 100}
              onClick={handleSingle}
              color="from-blue-700 to-cyan-800"
            />
            <PullBtn
              label="10 Pull"
              cost={900}
              originalCost={1000}
              badge="Save 100!"
              canAfford={gold >= 900}
              onClick={handleTen}
              color="from-violet-700 to-purple-800"
            />
          </motion.div>
        )}

        {/* drop rates */}
        {phase === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-4 w-full max-w-md">
            <p className="text-slate-500 text-[10px] text-center mb-3 uppercase tracking-widest font-bold">Drop Rates</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { r: 'Common', rate: '65%', c: 'text-slate-300', frag: '15 UF' },
                { r: 'Rare', rate: '25%', c: 'text-blue-400', frag: '40 UF' },
                { r: 'Legendary', rate: '8%', c: 'text-amber-400', frag: '120 UF' },
                { r: 'Mythical', rate: '2%', c: 'text-purple-400', frag: '300 UF' },
              ].map(x => (
                <div key={x.r} className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2">
                  <span className={`font-bold text-sm ${x.c}`}>{x.r}</span>
                  <div className="text-right">
                    <span className="text-white font-black text-sm">{x.rate}</span>
                    <p className="text-slate-500 text-[10px]">Dupe: {x.frag}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* collection stats */}
        {phase === 'idle' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-center text-slate-500 text-xs space-y-1">
            <p>Total Monsters: {allMonsters.length} unique cards</p>
            <p>Duplicates automatically convert to Universal Fragments!</p>
          </motion.div>
        )}

        {/* results */}
        {phase === 'reveal' && results.pulled.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
            <div className={`grid gap-3 ${results.pulled.length === 1 ? 'grid-cols-1 max-w-[160px] mx-auto' : 'grid-cols-2 sm:grid-cols-5'}`}>
              {results.pulled.map((owned, i) => (
                <AnimatePresence key={owned.uid}>
                  {i < revealIndex && (
                    <motion.div
                      initial={{ rotateY: 90, scale: 0.5, opacity: 0 }}
                      animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
                    >
                      <MonsterCard monster={owned.def} size={results.pulled.length === 1 ? 'lg' : 'sm'} />
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}
            </div>

            {revealIndex >= results.pulled.length && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3 items-center mt-6">
                {results.fragments > 0 && (
                  <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl px-4 py-2 text-center">
                    <p className="text-purple-300 text-sm">
                      {results.duplicates} duplicate(s) converted to <span className="font-bold">{results.fragments} Universal Fragments</span>
                    </p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={() => setPhase('idle')}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold border border-white/15 transition-colors">
                    Pull Again
                  </button>
                  <button onClick={() => setPage('collection')}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors">
                    View Collection
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* results for all duplicates */}
        {phase === 'reveal' && results.pulled.length === 0 && results.fragments > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full text-center">
            <div className="bg-purple-500/20 border border-purple-500/30 rounded-xl p-6 max-w-md mx-auto">
              <Star size={48} className="text-purple-400 mx-auto mb-3" />
              <h3 className="text-purple-300 font-bold text-lg mb-2">All Duplicates!</h3>
              <p className="text-slate-300 text-sm mb-4">
                All cards were duplicates and converted to fragments.
              </p>
              <p className="text-3xl font-black text-purple-400">+{results.fragments} Universal Fragments</p>
            </div>
            <div className="flex gap-3 justify-center mt-6">
              <button onClick={() => setPhase('idle')}
                className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold border border-white/15">
                Pull Again
              </button>
              <button onClick={() => setPage('collection')}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold">
                View Collection
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function PullBtn({ label, cost, originalCost, badge, canAfford, onClick, color }: {
  label: string; cost: number; originalCost?: number; badge?: string;
  canAfford: boolean; onClick: () => void; color: string;
}) {
  return (
    <motion.button
      whileHover={canAfford ? { scale: 1.03, y: -2 } : {}}
      whileTap={canAfford ? { scale: 0.97 } : {}}
      onClick={canAfford ? onClick : undefined}
      className={`relative flex-1 flex flex-col items-center gap-1.5 py-5 px-6 rounded-2xl font-bold bg-gradient-to-b ${color} text-white shadow-lg border border-white/10 ${!canAfford ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {badge && (
        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{badge}</span>
      )}
      <Sparkles size={20} className="opacity-80" />
      <span className="text-base">{label}</span>
      <div className="flex items-center gap-1 text-amber-300 text-sm">
        <Coins size={12} />
        {originalCost && <span className="line-through text-slate-400 text-xs">{originalCost}</span>}
        <span className="font-black">{cost}g</span>
      </div>
    </motion.button>
  );
}
