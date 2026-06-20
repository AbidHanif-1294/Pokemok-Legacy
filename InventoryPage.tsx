import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Coins, Star, Sparkles, Gift, Zap, Package, AlertCircle, CheckCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import allMonsters, { getMonsterById } from '../data/index';
import { FRAGMENT_VALUES } from '../types';

export default function InventoryPage() {
  const {
    gold, universalFragments, pokemonFragments, inventory, collection,
    useItem, addItem, addGold, spendGold,
    lastError, lastSuccess, setError, setSuccess, setPage
  } = useGameStore();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'currency' | 'items' | 'fragments'>('currency');

  // Calculate total Pokemon Fragments
  const totalPokeFrags = Object.values(pokemonFragments).reduce((sum, v) => sum + v, 0);

  // Get items by category
  const potions = [
    { type: 'item_potion_hp', name: 'HP Potion', desc: 'Restore 100 HP', icon: <Gift size={20} /> },
    { type: 'item_potion_big', name: 'Big HP Potion', desc: 'Restore 250 HP', icon: <Gift size={20} /> },
    { type: 'item_revive', name: 'Revive Scroll', desc: 'Auto-revive once', icon: <Sparkles size={20} /> },
    { type: 'item_raid_ticket', name: 'Raid Ticket', desc: 'Extra boss attempt', icon: <Zap size={20} /> },
    { type: 'boss_material', name: 'Boss Material', desc: 'Drop from boss', icon: <Star size={20} /> },
  ];

  // Exchange rates
  const handleExchangeFragToGold = async () => {
    if (universalFragments < 50) {
      setError('Need at least 50 Universal Fragments!');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_profiles')
        .update({ universal_fragments: universalFragments - 50, gold: gold + 200 })
        .eq('user_id', user.id);
    }
    const store = useGameStore.getState();
    store.addGold(200);
    store.spendUniversalFragments(50);
    setSuccess('Exchanged 50 UF for 200 Gold!');
  };

  const handleExchangeGoldToFrag = async () => {
    if (gold < 500) {
      setError('Need at least 500 Gold!');
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from('user_profiles')
        .update({ gold: gold - 500, universal_fragments: universalFragments + 30 })
        .eq('user_id', user.id);
    }
    spendGold(500);
    const store = useGameStore.getState();
    store.addUniversalFragments(30);
    setSuccess('Exchanged 500 Gold for 30 Universal Fragments!');
  };

  // Pokemon Fragments sorted by amount
  const pokeFragList = Object.entries(pokemonFragments)
    .map(([id, amount]) => ({
      monsterId: parseInt(id),
      amount,
      monster: getMonsterById(parseInt(id)),
    }))
    .filter(item => item.monster && item.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30">
        <button onClick={() => setPage('home')} className="flex items-center gap-1 text-slate-300 hover:text-white">
          <ChevronLeft size={20} /> Back
        </button>
        <h2 className="text-white font-black text-xl">Inventory</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/25">
            <Coins size={12} className="text-amber-400" />
            <span className="text-amber-300 font-bold text-xs">{gold.toLocaleString()}</span>
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

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Tab navigation */}
        <div className="flex gap-2">
          {[
            { key: 'currency', label: 'Currency', icon: <Coins size={16} /> },
            { key: 'items', label: 'Items', icon: <Package size={16} /> },
            { key: 'fragments', label: 'Fragments', icon: <Star size={16} /> },
          ].map(tab => (
            <motion.button
              key={tab.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm ${
                activeTab === tab.key
                  ? 'bg-slate-600 text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Currency tab */}
        {activeTab === 'currency' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 text-center">
                <Coins size={24} className="text-amber-400 mx-auto mb-2" />
                <p className="text-2xl font-black text-amber-300">{gold.toLocaleString()}</p>
                <p className="text-slate-500 text-xs">Gold</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/25 rounded-xl p-4 text-center">
                <Star size={24} className="text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-black text-purple-300">{universalFragments.toLocaleString()}</p>
                <p className="text-slate-500 text-xs">Universal Frags</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/25 rounded-xl p-4 text-center">
                <Sparkles size={24} className="text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-black text-blue-300">{totalPokeFrags.toLocaleString()}</p>
                <p className="text-slate-500 text-xs">Pokemon Frags</p>
              </div>
            </div>

            {/* Exchange options */}
            <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4 space-y-3">
              <h3 className="text-slate-300 font-bold text-sm">Exchange</h3>
              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: gold >= 500 ? 1.02 : 1 }}
                  whileTap={{ scale: gold >= 500 ? 0.98 : 1 }}
                  onClick={handleExchangeGoldToFrag}
                  disabled={gold < 500}
                  className={`p-3 rounded-xl text-left ${
                    gold >= 500 ? 'bg-purple-600/20 border border-purple-500/30' : 'bg-slate-800/50 border border-slate-700/30 opacity-50'
                  }`}
                >
                  <p className="text-white font-bold text-sm">500 Gold → 30 UF</p>
                  <p className="text-slate-400 text-xs">Convert gold to fragments</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: universalFragments >= 50 ? 1.02 : 1 }}
                  whileTap={{ scale: universalFragments >= 50 ? 0.98 : 1 }}
                  onClick={handleExchangeFragToGold}
                  disabled={universalFragments < 50}
                  className={`p-3 rounded-xl text-left ${
                    universalFragments >= 50 ? 'bg-amber-600/20 border border-amber-500/30' : 'bg-slate-800/50 border border-slate-700/30 opacity-50'
                  }`}
                >
                  <p className="text-white font-bold text-sm">50 UF → 200 Gold</p>
                  <p className="text-slate-400 text-xs">Convert fragments to gold</p>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Items tab */}
        {activeTab === 'items' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {potions.map(item => {
              const quantity = inventory[item.type] ?? 0;
              return (
                <motion.div
                  key={item.type}
                  className="bg-slate-900/50 border border-white/10 rounded-xl p-4 flex items-center gap-4"
                >
                  <div className="p-3 rounded-xl bg-emerald-500/15 text-emerald-400">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold">{item.name}</h3>
                    <p className="text-slate-400 text-sm">{item.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">{quantity}</p>
                    <p className="text-slate-500 text-xs">owned</p>
                  </div>
                </motion.div>
              );
            })}
            {potions.every(item => (inventory[item.type] ?? 0) === 0) && (
              <div className="text-center py-8 text-slate-500">
                <Package size={32} className="mx-auto mb-2 opacity-50" />
                <p>No items yet. Visit the Shop to purchase!</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Fragments tab */}
        {activeTab === 'fragments' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Universal Fragments */}
            <div className="bg-purple-500/10 border border-purple-500/25 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className="text-purple-400" size={20} />
                  <span className="text-white font-bold">Universal Fragments</span>
                </div>
                <span className="text-purple-300 font-black text-xl">{universalFragments}</span>
              </div>
              <p className="text-slate-400 text-xs">Used for monster level upgrades</p>
            </div>

            {/* Pokemon Fragments */}
            <div className="space-y-2">
              <h3 className="text-slate-300 font-bold text-sm flex items-center gap-2">
                <Sparkles size={16} className="text-blue-400" />
                Pokemon Fragments (for skill upgrades)
              </h3>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {pokeFragList.map(({ monsterId, amount, monster }) => (
                  <div
                    key={monsterId}
                    className="bg-slate-900/50 border border-white/10 rounded-xl p-3 flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs">
                      {monster?.name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">{monster?.name}</p>
                      <p className="text-slate-500 text-xs">{monster?.rarity} - {monster?.element}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-blue-300 font-black">{amount}</p>
                      <p className="text-slate-500 text-xs">PF</p>
                    </div>
                  </div>
                ))}
                {pokeFragList.length === 0 && (
                  <div className="text-center py-6 text-slate-500">
                    <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No Pokemon Fragments yet!</p>
                    <p className="text-xs">Get them from Boss rewards or Shop</p>
                  </div>
                )}
              </div>
            </div>

            {/* Fragment conversion info */}
            <div className="bg-slate-800/50 border border-white/10 rounded-xl p-3">
              <p className="text-slate-400 text-xs text-center">
                Duplicate cards convert to Universal Fragments: Common +15, Rare +40, Legendary +120, Mythic +300
              </p>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="bg-slate-900/50 border border-white/10 rounded-xl p-4">
          <h3 className="text-slate-300 font-bold text-sm mb-3">Collection Stats</h3>
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <p className="text-white font-bold">{collection.length}</p>
              <p className="text-slate-500 text-xs">Cards</p>
            </div>
            <div>
              <p className="text-white font-bold">{new Set(collection.map(o => o.monsterId)).size}</p>
              <p className="text-slate-500 text-xs">Unique</p>
            </div>
            <div>
              <p className="text-white font-bold">{allMonsters.length}</p>
              <p className="text-slate-500 text-xs">Total</p>
            </div>
            <div>
              <p className="text-white font-bold">{Math.floor((new Set(collection.map(o => o.monsterId)).size / allMonsters.length) * 100)}%</p>
              <p className="text-slate-500 text-xs">Complete</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
