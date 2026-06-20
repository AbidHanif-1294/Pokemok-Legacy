import { motion } from 'framer-motion';
import { MonsterDef } from '../types';
import MonsterSprite from './MonsterSprite';

interface Props {
  monster: MonsterDef;
  onClick?: () => void;
  selected?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const RARITY = {
  common:    { border: 'border-slate-500',  badge: 'bg-slate-600 text-white',  glow: '',                      bg: 'from-slate-900 to-slate-800' },
  rare:      { border: 'border-blue-500',   badge: 'bg-blue-600 text-white',   glow: 'shadow-blue-500/30',    bg: 'from-blue-950 to-slate-900' },
  legendary: { border: 'border-amber-400',  badge: 'bg-amber-500 text-black',  glow: 'shadow-amber-500/30',   bg: 'from-amber-950 to-slate-900' },
  mythical:  { border: 'border-purple-400', badge: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white', glow: 'shadow-purple-500/40', bg: 'from-purple-950 to-slate-900' },
};
const SPRITE_SIZE = { sm: 56, md: 72, lg: 96 };

export default function MonsterCard({ monster, onClick, selected, size = 'md' }: Props) {
  const s = RARITY[monster.rarity];
  const ss = SPRITE_SIZE[size];

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.04, y: -3 } : {}}
      whileTap={onClick ? { scale: 0.97 } : {}}
      onClick={onClick}
      className={`
        relative rounded-2xl border-2 ${s.border} bg-gradient-to-b ${s.bg}
        overflow-hidden select-none
        ${onClick ? 'cursor-pointer' : ''}
        ${selected ? `ring-2 ring-white ring-offset-2 ring-offset-slate-900 shadow-lg ${s.glow}` : `shadow-md ${s.glow}`}
      `}
    >
      {(monster.rarity === 'legendary' || monster.rarity === 'mythical') && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
      )}
      <div className="p-2 flex flex-col items-center gap-1">
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full tracking-widest ${s.badge}`}>
          {monster.rarity.toUpperCase()}
        </span>
        <div className="relative flex items-center justify-center my-1">
          <div className={`absolute inset-0 rounded-full blur-xl opacity-25 ${
            monster.rarity === 'mythical' ? 'bg-purple-400' :
            monster.rarity === 'legendary' ? 'bg-amber-400' :
            monster.rarity === 'rare' ? 'bg-blue-400' : 'bg-slate-400'
          }`} />
          <MonsterSprite row={monster.spriteRow} col={monster.spriteCol} sheet={monster.spriteSheet} size={ss} />
        </div>
        <p className="text-white font-bold text-xs text-center leading-tight truncate w-full text-center">{monster.name}</p>
        <div className="w-full bg-slate-800 rounded-full h-1">
          <div className="h-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 w-full" />
        </div>
        <p className="text-slate-400 text-[10px]">HP {monster.hp}</p>
      </div>
    </motion.div>
  );
}
