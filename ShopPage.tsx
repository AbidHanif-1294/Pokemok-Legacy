import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Coins, Package, Sparkles, Star, Gift, Zap, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

type Category = 'gacha' | 'fragments' | 'items' | 'exchange';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  costType: 'gold' | 'universal' | 'pokemon';
  category: Category;
  reward: { type: string; amount: number };
  icon: React.ReactNode;
}

const SHOP_ITEMS: ShopItem[] = [
  // Gacha
  { id: 'gacha_single', name: 'Single Pull', description: 'Pull 1 monster card', cost: 100, costType: 'gold', category: 'gacha', reward: { type: 'pull_single', amount: 1 }, icon: <Package size={20} /> },
  { id: 'gacha_ten', name: '10 Pull', description: 'Pull 10 monsters (+1 bonus)', cost: 900, costType: 'gold', category: 'gacha', reward: { type: 'pull_ten', amount: 10 }, icon: <Package size={20} /> },

  // Fragments
  { id: 'univ_frag_small', name: 'Universal Fragment x50', description: '50 Universal Fragments', cost: 200, costType: 'gold', category: 'fragments', reward: { type: 'universal', amount: 50 }, icon: <Star size={20} /> },
  { id: 'univ_frag_medium', name: 'Universal Fragment x150', description: '150 Universal Fragments', cost: 500, costType: 'gold', category: 'fragments', reward: { type: 'universal', amount: 150 }, icon: <Star size={20} /> },
  { id: 'poke_frag_common', name: 'Random Common PF x20', description: '20 Pokemon Fragments for a random common', cost: 30, costType: 'universal', category: 'fragments', reward: { type: 'pokemon_common', amount: 20 }, icon: <Star size={20} /> },
  { id: 'poke_frag_rare', name: 'Random Rare PF x10', description: '10 Pokemon Fragments for a random rare', cost: 50, costType: 'universal', category: 'fragments', reward: { type: 'pokemon_rare', amount: 10 }, icon: <Star size={20} /> },

  // Items
  { id: 'potion_hp', name: 'HP Potion', description: 'Restore 100 HP in battle', cost: 50, costType: 'gold', category: 'items', reward: { type: 'item_potion_hp', amount: 1 }, icon: <Gift size={20} /> },
  { id: 'potion_big', name: 'Big HP Potion', description: 'Restore 250 HP in battle', cost: 120, costType: 'gold', category: 'items', reward: { type: 'item_potion_big', amount: 1 }, icon: <Gift size={20} /> },
  { id: 'revive', name: 'Revive Scroll', description: 'Auto-revive once after losing', cost: 200, costType: 'gold', category: 'items', reward: { type: 'item_revive', amount: 1 }, icon: <Sparkles size={20} /> },
  { id: 'raid_ticket', name: 'Boss Raid Ticket', description: 'Extra boss attempt', cost: 150, costType: 'gold', category: 'items', reward: { type: 'item_raid_ticket', amount: 1 }, icon: <Zap size={20} /> },

  // Exchange
  { id: 'exchange_gold_frag', name: 'Gold → Fragments', description: 'Exchange 500 gold for 30 Universal Fragments', cost: 500, costType: 'gold', category: 'exchange', reward: { type: 'universal', amount: 30 }, icon: <Star size={20} /> },
  { id: 'exchange_frag_gold', name: 'Fragments → Gold', description: 'Exchange 50 Universal Fragments for 200 Gold', cost: 50, costType: 'universal', category: 'exchange', reward: { type: 'gold', amount: 200 }, icon: <Coins size={20} /> },
];

export default function ShopPage() {
  const { gold, universalFragments, addItem, addGold, addUniversalFragments, spendGold, spendUniversalFragments, lastError, lastSuccess, setError, setSuccess, setPage } = useGameStore();
  const { user } = useAuth();
  const [category, setCategory] = useState<Category>('gacha');
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const filteredItems = SHOP_ITEMS.filter(item => item.category === category);

  const handlePurchase = async (item: ShopItem) => {
    if (!user) return;
    setPurchasing(item.id);

    let success = false;

    // Check and deduct cost
    if (item.costType === 'gold') {
      if (gold < item.cost) {
        setError(`Not enough gold! Need ${item.cost} gold.`);
        setPurchasing(null);
        return;
      }
      success = spendGold(item.cost);
    } else if (item.costType === 'universal') {
      if (universalFragments < item.cost) {
        setError(`Not enough Universal Fragments! Need ${item.cost}.`);
        setPurchasing(null);
        return;
      }
      success = spendUniversalFragments(item.cost);
    }

    if (!success) {
      setPurchasing(null);
      return;
    }

    // Apply reward
    switch (item.reward.type) {
      case 'universal':
        addUniversalFragments(item.reward.amount);
        break;
      case 'gold':
        addGold(item.reward.amount);
        break;
      case 'pokemon_common':
        // Give PF for a random common monster
        const commonMonsters = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59];
        const randomCommon = commonMonsters[Math.floor(Math.random() * commonMonsters.length)];
        const { addPokemonFragments } = useGameStore.getState();
        addPokemonFragments(randomCommon, item.reward.amount);
        break;
      case 'pokemon_rare':
        // Give PF for a random rare monster
        const rareMonsters = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74];
        const randomRare = rareMonsters[Math.floor(Math.random() * rareMonsters.length)];
        useGameStore.getState().addPokemonFragments(randomRare, item.reward.amount);
        break;
      case 'item_potion_hp':
      case 'item_potion_big':
      case 'item_revive':
      case 'item_raid_ticket':
        addItem(item.reward.type, item.reward.amount);
        break;
      case 'pull_single':
      case 'pull_ten':
        // Redirect to gacha page
        setSuccess(`Purchased ${item.name}! Go to Gacha to pull.`);
        setPurchasing(null);
        return;
    }

    setSuccess(`Purchased ${item.name}!`);
    setPurchasing(null);
  };

  const canAfford = (item: ShopItem) => {
    if (item.costType === 'gold') return gold >= item.cost;
    if (item.costType === 'universal') return universalFragments >= item.cost;
    return false;
  };

  const categories: { key: Category; label: string; icon: React.ReactNode }[] = [
    { key: 'gacha', label: 'Gacha', icon: <Package size={16} /> },
    { key: 'fragments', label: 'Fragments', icon: <Star size={16} /> },
    { key: 'items', label: 'Items', icon: <Gift size={16} /> },
    { key: 'exchange', label: 'Exchange', icon: <Zap size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-emerald-950 to-slate-950">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/30">
        <button onClick={() => setPage('home')} className="flex items-center gap-1 text-slate-300 hover:text-white">
          <ChevronLeft size={20} /> Back
        </button>
        <h2 className="text-white font-black text-xl">Shop</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/25">
            <Coins size={12} className="text-amber-400" />
            <span className="text-amber-300 font-bold text-xs">{gold.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 bg-purple-500/15 px-2.5 py-1 rounded-lg border border-purple-500/25">
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

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <motion.button
              key={cat.key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                category === cat.key
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              }`}
            >
              {cat.icon}
              {cat.label}
            </motion.button>
          ))}
        </div>

        {/* items */}
        <div className="grid gap-3">
          <AnimatePresence mode="wait">
            {filteredItems.map(item => {
              const affordable = canAfford(item);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`bg-slate-900/50 border rounded-xl p-4 flex items-center gap-4 ${
                    affordable ? 'border-white/10' : 'border-red-900/30 opacity-60'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${
                    item.costType === 'gold' ? 'bg-amber-500/15 text-amber-400' : 'bg-purple-500/15 text-purple-400'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold">{item.name}</h3>
                    <p className="text-slate-400 text-sm">{item.description}</p>
                  </div>
                  <motion.button
                    whileHover={affordable ? { scale: 1.05 } : {}}
                    whileTap={affordable ? { scale: 0.95 } : {}}
                    onClick={() => handlePurchase(item)}
                    disabled={!affordable || purchasing === item.id}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm ${
                      affordable
                        ? item.costType === 'gold'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black'
                          : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                        : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {purchasing === item.id ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : affordable ? (
                      <>
                        {item.costType === 'gold' ? <Coins size={14} /> : <Star size={14} />}
                        {item.cost.toLocaleString()}
                      </>
                    ) : (
                      <Lock size={14} />
                    )}
                  </motion.button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
