import { motion, AnimatePresence } from 'framer-motion';
import { Sword, BookOpen, Sparkles, Coins, Gift, LogOut, User, ArrowUp, ShoppingCart, Crown, Package, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../context/AuthContext';
import allMonsters from '../data/index';
import MonsterSprite from '../components/MonsterSprite';

export default function HomePage() {
  const {
    gold, universalFragments, pokemonFragments, collection, inventory,
    setPage, claimDailyReward, lastDailyReward,
    lastError, lastSuccess, setError, setSuccess
  } = useGameStore();
  const { user, signOut } = useAuth();

  const canClaim = !lastDailyReward || Date.now() - new Date(lastDailyReward).getTime() > 24 * 60 * 60 * 1000;

  const handleClaim = async () => {
    const ok = await claimDailyReward();
    if (!ok && !lastError) {
      // Error already set in store
    }
  };

  // Calculate stats
  const totalPokeFrags = Object.values(pokemonFragments).reduce((sum, v) => sum + v, 0);
  const totalItems = Object.values(inventory).reduce((sum, v) => sum + v, 0);
  const uniqueMonsters = new Set(collection.map(o => o.monsterId)).size;

  // Featured monsters (random legendary/mythical)
  const featured = allMonsters.filter(m => m.rarity === 'mythical' || m.rarity === 'legendary')
    .sort(() => Math.random() - 0.5).slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600/40 border border-blue-500/50 flex items-center justify-center">
            <User size={14} className="text-blue-300" />
          </div>
          <span className="text-slate-400 text-xs truncate max-w-[100px]">{user?.email?.split('@')[0]}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1 bg-amber-500/15 px-2 py-1 rounded-lg border border-amber-500/25">
            <Coins className="text-amber-400" size={12} />
            <span className="text-amber-300 font-black text-xs">{gold.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 bg-purple-500/15 px-2 py-1 rounded-lg border border-purple-500/25">
            <Sparkles className="text-purple-400" size={10} />
            <span className="text-purple-300 font-bold text-[10px]">{universalFragments}</span>
          </div>
          <button
            onClick={signOut}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
          >
            <LogOut size={12} />
          </button>
        </div>
      </div>

      {/* Notification toasts */}
      <AnimatePresence>
        {lastError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-red-900/90 border border-red-500/50 rounded-xl text-red-200 text-sm flex items-center gap-2 shadow-lg"
            onClick={() => setError(null)}
          >
            <AlertCircle size={16} /> {lastError}
            <button onClick={(e) => { e.stopPropagation(); setError(null); }} className="ml-2 text-red-300 hover:text-white">
              <X size={14} />
            </button>
          </motion.div>
        )}
        {lastSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-900/90 border border-emerald-500/50 rounded-xl text-emerald-200 text-sm flex items-center gap-2 shadow-lg"
            onClick={() => setSuccess(null)}
          >
            <CheckCircle size={16} /> {lastSuccess}
            <button onClick={(e) => { e.stopPropagation(); setSuccess(null); }} className="ml-2 text-emerald-300 hover:text-white">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-blue-400/20"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [-8, 8, -8], opacity: [0.1, 0.5, 0.1] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-4 flex flex-col items-center gap-4">
        {/* title */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <h1 className="text-4xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent">MONSTER</span>
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">CLASH</span>
          </h1>
          <p className="text-slate-400 mt-1 text-xs">Collect. Battle. Conquer.</p>
        </motion.div>

        {/* featured monsters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 flex-wrap justify-center"
        >
          {featured.map((m, i) => (
            <motion.div
              key={m.id}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
              className={`p-1.5 rounded-xl border-2 ${m.rarity === 'mythical' ? 'border-purple-500/50 bg-purple-950/50' : 'border-amber-500/50 bg-amber-950/50'}`}
            >
              <MonsterSprite row={m.spriteRow} col={m.spriteCol} sheet={m.spriteSheet} size={36} />
            </motion.div>
          ))}
        </motion.div>

        {/* main nav grid - 2 rows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-2 w-full"
        >
          <NavBtn icon={<Sword size={18} />} label="Battle" sub="1v1" color="from-red-700 to-rose-800"
            onClick={() => setPage('battle')} disabled={collection.length === 0} />
          <NavBtn icon={<Sparkles size={18} />} label="Gacha" sub="Pull" color="from-violet-700 to-purple-800"
            onClick={() => setPage('gacha')} />
          <NavBtn icon={<BookOpen size={18} />} label="Collection" sub={`${uniqueMonsters}/${allMonsters.length}`} color="from-emerald-700 to-teal-800"
            onClick={() => setPage('collection')} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-3 gap-2 w-full"
        >
          <NavBtn icon={<ArrowUp size={16} />} label="Upgrade" sub="Monster" color="from-indigo-700 to-blue-800"
            onClick={() => setPage('upgrade')} disabled={collection.length === 0} />
          <NavBtn icon={<ShoppingCart size={16} />} label="Shop" sub="Items" color="from-emerald-700 to-green-800"
            onClick={() => setPage('shop')} />
          <NavBtn icon={<Crown size={16} />} label="Boss" sub="Daily" color="from-orange-700 to-red-800"
            onClick={() => setPage('boss')} disabled={collection.length === 0} />
        </motion.div>

        {/* inventory button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setPage('inventory')}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-bold bg-slate-800/60 border border-white/10 text-white hover:bg-slate-700/60"
        >
          <Package size={18} />
          <span>Inventory</span>
          <span className="bg-blue-500/30 text-blue-300 text-xs px-2 py-0.5 rounded-full">{totalItems} items</span>
        </motion.button>

        {/* daily reward */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          whileHover={{ scale: canClaim ? 1.02 : 1 }}
          whileTap={{ scale: canClaim ? 0.97 : 1 }}
          onClick={handleClaim}
          disabled={!canClaim}
          className={`flex items-center gap-3 px-6 py-2.5 rounded-xl font-bold text-sm border transition-all w-full justify-center ${
            canClaim
              ? 'bg-amber-500 hover:bg-amber-400 text-black border-amber-400 shadow-lg shadow-amber-500/20'
              : 'bg-slate-800/40 text-slate-500 border-slate-700 cursor-not-allowed'
          }`}
        >
          <Gift size={16} />
          {canClaim ? 'Claim Daily Reward (+200 Gold + 10 UF)' : 'Daily Reward Claimed ✓'}
        </motion.button>

        {/* stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-4 gap-2 w-full"
        >
          {[
            { label: 'Cards', v: collection.length },
            { label: 'Unique', v: uniqueMonsters },
            { label: 'UF', v: universalFragments },
            { label: 'PF', v: totalPokeFrags },
          ].map(({ label, v }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-lg p-2 text-center">
              <p className="text-white font-bold text-sm">{typeof v === 'number' && v > 999 ? `${(v / 1000).toFixed(1)}k` : v}</p>
              <p className="text-slate-500 text-[10px]">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* collection progress */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="w-full bg-slate-800/50 rounded-xl p-3"
        >
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-400">Collection Progress</span>
            <span className="text-white font-bold">{Math.round((uniqueMonsters / allMonsters.length) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <motion.div
              animate={{ width: `${(uniqueMonsters / allMonsters.length) * 100}%` }}
              className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
            />
          </div>
          <p className="text-slate-500 text-xs mt-1 text-center">{uniqueMonsters} / {allMonsters.length} monsters collected</p>
        </motion.div>
      </div>
    </div>
  );
}

function NavBtn({ icon, label, sub, color, onClick, disabled }: {
  icon: React.ReactNode; label: string; sub: string; color: string;
  onClick: () => void; disabled?: boolean;
}) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.04, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`flex flex-col items-center gap-0.5 p-2.5 rounded-xl font-bold bg-gradient-to-b ${color} text-white shadow-lg border border-white/10 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {icon}
      <span className="text-xs">{label}</span>
      <span className="text-[10px] opacity-70">{sub}</span>
    </motion.button>
  );
}
