import React from 'react';
import { Move } from '../types';

interface MoveCardProps {
  move: Move;
  label: string;
  keyHint: string;
  onClick: () => void;
  disabled?: boolean;
  selected?: boolean;
}

export const MoveCard: React.FC<MoveCardProps> = ({
  move,
  label,
  keyHint,
  onClick,
  disabled = false,
  selected = false,
}) => {
  const getMoveData = () => {
    switch (move) {
      case 'rock':
        return {
          emoji: '🪨',
          counterText: 'Beats Scissors',
          accent: 'from-amber-500/20 via-slate-900 to-amber-950/20',
          border: 'border-amber-500/30 hover:border-amber-400/60',
          glow: 'hover:shadow-[0_0_25px_rgba(245,158,11,0.25)]',
          badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
        };
      case 'paper':
        return {
          emoji: '📄',
          counterText: 'Beats Rock',
          accent: 'from-sky-500/20 via-slate-900 to-sky-950/20',
          border: 'border-sky-500/30 hover:border-sky-400/60',
          glow: 'hover:shadow-[0_0_25px_rgba(56,189,248,0.25)]',
          badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
        };
      case 'scissors':
        return {
          emoji: '✂️',
          counterText: 'Beats Paper',
          accent: 'from-emerald-500/20 via-slate-900 to-emerald-950/20',
          border: 'border-emerald-500/30 hover:border-emerald-400/60',
          glow: 'hover:shadow-[0_0_25px_rgba(16,185,129,0.25)]',
          badgeBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
        };
    }
  };

  const data = getMoveData();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`Select ${label}`}
      className={`group relative flex flex-col items-center justify-between p-6 sm:p-7 rounded-2xl border-2 transition-all duration-200 select-none bg-gradient-to-b ${data.accent} ${data.border} ${data.glow} ${
        selected
          ? 'ring-2 ring-indigo-400 border-indigo-400 scale-[1.03] shadow-[0_0_30px_rgba(99,102,241,0.3)]'
          : 'glass-card-hover'
      } ${disabled ? 'opacity-40 cursor-not-allowed transform-none' : 'cursor-pointer active:scale-95'}`}
    >
      {/* Top Tag: Matchup advantage hint */}
      <span className="text-[11px] font-mono font-medium text-slate-400 tracking-wide mb-2">
        {data.counterText}
      </span>

      {/* Center Emoji / Icon */}
      <div className="my-2 text-5xl sm:text-6xl transition-transform duration-200 group-hover:scale-110 group-active:scale-95 filter drop-shadow">
        {data.emoji}
      </div>

      {/* Name Title */}
      <span className="text-base sm:text-lg font-black tracking-wider uppercase text-white group-hover:text-white mt-2">
        {label.split(' ')[0]}
      </span>

      {/* Keyboard Shortcut Key Hint */}
      <span
        className={`mt-2 text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded border uppercase transition-colors ${data.badgeBg}`}
      >
        Press [{keyHint}]
      </span>
    </button>
  );
};
