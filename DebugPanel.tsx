import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, RefreshCw, Database, Trash2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../lib/supabase';

interface Props {
  onClose: () => void;
}

export default function DebugPanel({ onClose }: Props) {
  const {
    gold, universalFragments, pokemonFragments, collection, inventory, upgrades,
    addGold, addUniversalFragments, addPokemonFragments, addItem, reset
  } = useGameStore();
  const [addGoldAmount, setAddGoldAmount] = useState(1000);
  const [addFragAmount, setAddFragAmount] = useState(100);
  const [addPokeFragId, setAddPokeFragId] = useState(0);
  const [addPokeFragAmount, setAddPokeFragAmount] = useState(20);

  const totalPokeFrags = Object.values(pokemonFragments).reduce((sum, v) => sum + v, 0);
  const uniqueMonsters = new Set(collection.map(o => o.monsterId)).size;
  const totalItems = Object.values(inventory).reduce((sum, v) => sum + v, 0);

  const handleResetSave = async () => {
    if (!confirm('Are you sure you want to reset ALL progress? This cannot be undone!')) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Clear Supabase data
      await supabase.from('user_collection').delete().eq('user_id', user.id);
      await supabase.from('monster_upgrades').delete().eq('user_id', user.id);
      await supabase.from('daily_boss').delete().eq('user_id', user.id);
      await supabase.from('user_profiles').update({
        gold: 1000,
        universal_fragments: 0,
        pokemon_fragments: {},
        last_daily_reward: null,
      }).eq('user_id', user.id);
    }

    reset();
    alert('All progress has been reset!');
  };

  const handleSpawnBossReward = () => {
    addGold(500);
    addUniversalFragments(50);
    addPokemonFragments(30, 20);
    addItem('boss_material', 1);
    alert('Boss reward spawned: +500 Gold, +50 UF, +20 PF for monster #30, +1 Boss Material');
  };

  const handleAddPokeFrag = () => {
    addPokemonFragments(addPokeFragId, addPokeFragAmount);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed bottom-4 right-4 z-[100] w-80 bg-slate-900/95 border border-emerald-500/30 rounded-xl shadow-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-2 bg-emerald-600/20 border-b border-emerald-500/30">
        <div className="flex items-center gap-2">
          <Database size={16} className="text-emerald-400" />
          <span className="text-emerald-400 font-bold text-sm">Debug Panel</span>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-800/50 rounded-lg p-2">
            <p className="text-slate-500">Gold</p>
            <p className="text-amber-400 font-bold">{gold.toLocaleString()}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2">
            <p className="text-slate-500">Universal Fragments</p>
            <p className="text-purple-400 font-bold">{universalFragments}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2">
            <p className="text-slate-500">Pokemon Fragments</p>
            <p className="text-blue-400 font-bold">{totalPokeFrags}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2">
            <p className="text-slate-500">Cards</p>
            <p className="text-white font-bold">{collection.length} ({uniqueMonsters} unique)</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2">
            <p className="text-slate-500">Items</p>
            <p className="text-white font-bold">{totalItems}</p>
          </div>
          <div className="bg-slate-800/50 rounded-lg p-2">
            <p className="text-slate-500">Upgrades</p>
            <p className="text-white font-bold">{Object.keys(upgrades).length}</p>
          </div>
        </div>

        {/* Add Gold */}
        <div className="space-y-2">
          <label className="text-slate-400 text-xs">Add Gold</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={addGoldAmount}
              onChange={e => setAddGoldAmount(parseInt(e.target.value) || 0)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            />
            <button
              onClick={() => addGold(addGoldAmount)}
              className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Add Universal Fragments */}
        <div className="space-y-2">
          <label className="text-slate-400 text-xs">Add Universal Fragments</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={addFragAmount}
              onChange={e => setAddFragAmount(parseInt(e.target.value) || 0)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
            />
            <button
              onClick={() => addUniversalFragments(addFragAmount)}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-bold"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Add Pokemon Fragments */}
        <div className="space-y-2">
          <label className="text-slate-400 text-xs">Add Pokemon Fragments</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={addPokeFragId}
              onChange={e => setAddPokeFragId(parseInt(e.target.value) || 0)}
              placeholder="Monster ID"
              className="w-20 bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm"
            />
            <input
              type="number"
              value={addPokeFragAmount}
              onChange={e => setAddPokeFragAmount(parseInt(e.target.value) || 0)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-2 text-white text-sm"
            />
            <button
              onClick={handleAddPokeFrag}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Quick add items */}
        <div className="space-y-2">
          <label className="text-slate-400 text-xs">Quick Add Items</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => addItem('item_potion_hp', 5)}
              className="px-2 py-1 bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 rounded text-xs"
            >
              +5 HP Potions
            </button>
            <button
              onClick={() => addItem('item_revive', 3)}
              className="px-2 py-1 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 rounded text-xs"
            >
              +3 Revives
            </button>
            <button
              onClick={() => addItem('item_raid_ticket', 5)}
              className="px-2 py-1 bg-orange-600/30 hover:bg-orange-600/50 text-orange-300 rounded text-xs"
            >
              +5 Raid Tickets
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="space-y-2 pt-2 border-t border-red-500/30">
          <label className="text-red-400 text-xs font-bold">Danger Zone</label>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSpawnBossReward}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 rounded-lg text-xs font-bold border border-amber-500/30"
            >
              <RefreshCw size={14} />
              Spawn Boss Reward
            </button>
            <button
              onClick={handleResetSave}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg text-xs font-bold border border-red-500/30"
            >
              <Trash2 size={14} />
              Reset All Save Data
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 bg-slate-800/50 border-t border-slate-700/50 text-center">
        <p className="text-slate-500 text-[10px]">Press Ctrl+Shift+D to toggle</p>
      </div>
    </motion.div>
  );
}
