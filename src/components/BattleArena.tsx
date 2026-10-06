import React from 'react';
import { Move, Winner, RoundRecord } from '../types';
import { User, Bot, CheckCircle2, XCircle, Equal, Sparkles } from 'lucide-react';

interface BattleArenaProps {
  isShaking: boolean;
  shakeStep: string;
  userMove: Move | null;
  aiMove: Move | null;
  lastRound: RoundRecord | null;
  winner: Winner | null;
  onPlayAgain?: () => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  isShaking,
  shakeStep,
  userMove,
  aiMove,
  lastRound,
  winner,
}) => {
  const renderMoveVisual = (move: Move | null, isAi = false) => {
    if (!move) {
      return (
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-2 border-dashed border-white/10 bg-slate-900/30 flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-2">
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-slate-500">
            ?
          </div>
          <span>Waiting</span>
        </div>
      );
    }

    const moveDetails = {
      rock: {
        title: 'Rock',
        emoji: '🪨',
        border: 'border-amber-400/40 shadow-amber-500/20',
        bg: 'bg-gradient-to-b from-amber-500/20 via-slate-900 to-amber-950/40',
        text: 'text-amber-300',
        glow: 'rgba(245, 158, 11, 0.25)',
      },
      paper: {
        title: 'Paper',
        emoji: '📄',
        border: 'border-sky-400/40 shadow-sky-500/20',
        bg: 'bg-gradient-to-b from-sky-500/20 via-slate-900 to-sky-950/40',
        text: 'text-sky-300',
        glow: 'rgba(56, 189, 248, 0.25)',
      },
      scissors: {
        title: 'Scissors',
        emoji: '✂️',
        border: 'border-emerald-400/40 shadow-emerald-500/20',
        bg: 'bg-gradient-to-b from-emerald-500/20 via-slate-900 to-emerald-950/40',
        text: 'text-emerald-300',
        glow: 'rgba(16, 185, 129, 0.25)',
      },
    }[move];

    return (
      <div
        className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl ${moveDetails.bg} border-2 ${moveDetails.border} p-4 flex flex-col items-center justify-center shadow-2xl transition-all transform animate-in fade-in zoom-in-90 duration-300 ${
          isAi ? 'scale-x-[-1]' : ''
        }`}
        style={{
          boxShadow: `0 10px 30px -5px ${moveDetails.glow}`,
        }}
      >
        <span className="text-4xl sm:text-5xl mb-1 select-none filter drop-shadow-md">
          {moveDetails.emoji}
        </span>
        <span
          className={`text-xs sm:text-sm font-black tracking-widest uppercase font-mono ${moveDetails.text}`}
        >
          {moveDetails.title}
        </span>
      </div>
    );
  };

  return (
    <div className="relative w-full rounded-3xl glass-panel p-6 sm:p-10 overflow-hidden min-h-[360px] flex flex-col items-center justify-center shadow-2xl">
      {/* Background Radial Glow Spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none animate-ambient-pulse" />
      
      {/* Clash Ring Effect during countdown/result */}
      {isShaking && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-indigo-500/30 animate-ping pointer-events-none" />
      )}

      {/* Arena Stage Grid */}
      <div className="w-full max-w-3xl flex items-center justify-between gap-4 z-10">
        {/* User Pedestal Side */}
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4 text-xs font-bold text-emerald-400 font-mono tracking-wider">
            <User className="w-3.5 h-3.5" />
            <span>PLAYER</span>
          </div>

          <div className="relative h-32 sm:h-40 flex items-center justify-center">
            {/* Glowing pedestal base */}
            <div className="absolute -bottom-2 w-32 sm:w-40 h-6 bg-emerald-500/10 rounded-full blur-md" />
            {isShaking ? (
              <div className="text-5xl sm:text-6xl animate-fist-user select-none filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                ✊
              </div>
            ) : (
              renderMoveVisual(userMove)
            )}
          </div>
        </div>

        {/* Center Clash & Decisive Result Banner */}
        <div className="flex flex-col items-center justify-center px-2 sm:px-6">
          {isShaking ? (
            <div className="flex flex-col items-center py-4">
              <span className="text-2xl sm:text-4xl font-black font-mono tracking-widest bg-gradient-to-r from-amber-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent animate-pulse uppercase">
                {shakeStep}
              </span>
              <span className="text-[11px] font-mono text-slate-400 mt-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
                <span>AI predicting...</span>
              </span>
            </div>
          ) : winner ? (
            <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-200 py-2">
              <div className="mb-2">
                {winner === 'user' && (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm sm:text-base font-extrabold uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>YOU WIN!</span>
                  </div>
                )}
                {winner === 'computer' && (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-sm sm:text-base font-extrabold uppercase tracking-wider shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                    <XCircle className="w-5 h-5 text-indigo-400" />
                    <span>AI WINS!</span>
                  </div>
                )}
                {winner === 'draw' && (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm sm:text-base font-extrabold uppercase tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                    <Equal className="w-5 h-5 text-amber-400" />
                    <span>DRAW TIE!</span>
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm font-medium text-slate-300 max-w-[190px] sm:max-w-xs leading-snug">
                {lastRound?.explanation || 'Round finished.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-4">
              <div className="w-12 h-12 rounded-full border border-white/10 bg-slate-900/50 flex items-center justify-center text-slate-400 font-mono font-bold text-sm shadow-inner">
                VS
              </div>
              <span className="text-[11px] font-medium text-slate-400 mt-2">Pick your hand</span>
            </div>
          )}
        </div>

        {/* AI Pedestal Side */}
        <div className="flex-1 flex flex-col items-center">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4 text-xs font-bold text-indigo-400 font-mono tracking-wider">
            <Bot className="w-3.5 h-3.5" />
            <span>AI OPPONENT</span>
          </div>

          <div className="relative h-32 sm:h-40 flex items-center justify-center">
            {/* Glowing pedestal base */}
            <div className="absolute -bottom-2 w-32 sm:w-40 h-6 bg-indigo-500/10 rounded-full blur-md" />
            {isShaking ? (
              <div className="text-5xl sm:text-6xl animate-fist-ai select-none filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
                ✊
              </div>
            ) : (
              renderMoveVisual(aiMove, true)
            )}
          </div>
        </div>
      </div>

      {/* Tidy bottom state bar */}
      <div className="mt-6 pt-3 border-t border-white/[0.08] w-full flex items-center justify-between text-xs text-slate-400 font-mono">
        <span className="flex items-center gap-1.5 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Real-time adaptive AI</span>
        </span>
        <span className="font-semibold text-slate-400">
          {lastRound ? `Round #${lastRound.round} Complete` : 'Ready to start'}
        </span>
      </div>
    </div>
  );
};
