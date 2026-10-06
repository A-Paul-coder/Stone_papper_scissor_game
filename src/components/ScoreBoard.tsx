import React from 'react';
import { Trophy, Bot, User, Flame, TrendingUp } from 'lucide-react';

interface ScoreBoardProps {
  userScore: number;
  aiScore: number;
  draws: number;
  streak: { winner: 'user' | 'computer' | null; count: number };
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  userScore,
  aiScore,
  draws,
  streak,
}) => {
  const total = userScore + aiScore + draws;
  const userRate = total > 0 ? Math.round((userScore / total) * 100) : 0;
  const aiRate = total > 0 ? Math.round((aiScore / total) * 100) : 0;

  // Calculate momentum bar percentage between User and AI (ignoring ties for relative balance)
  const contestedTotal = userScore + aiScore;
  const userContestedPct = contestedTotal > 0 ? Math.round((userScore / contestedTotal) * 100) : 50;

  return (
    <div className="w-full glass-panel rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl">
      {/* 4 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Player Card */}
        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-emerald-500/10 via-emerald-950/20 to-transparent border border-emerald-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-400/90 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>You (Player)</span>
            </span>
            <span className="text-[11px] font-mono font-medium text-emerald-400/70 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              {userRate}% Win Rate
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-white drop-shadow">
              {userScore}
            </span>
            <span className="text-xs text-slate-400 font-medium">wins</span>
          </div>
        </div>

        {/* AI Computer Card */}
        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-indigo-500/10 via-indigo-950/20 to-transparent border border-indigo-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-400/90 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              <span>AI Opponent</span>
            </span>
            <span className="text-[11px] font-mono font-medium text-indigo-400/70 bg-indigo-500/10 px-1.5 py-0.5 rounded">
              {aiRate}% Win Rate
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-white drop-shadow">
              {aiScore}
            </span>
            <span className="text-xs text-slate-400 font-medium">wins</span>
          </div>
        </div>

        {/* Ties & Total Rounds */}
        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-amber-500/10 via-amber-950/20 to-transparent border border-amber-500/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-400/90 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              <span>Draws</span>
            </span>
            <span className="text-[11px] font-mono font-medium text-amber-400/70 bg-amber-500/10 px-1.5 py-0.5 rounded">
              {total} Total
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono tabular-nums text-white drop-shadow">
              {draws}
            </span>
            <span className="text-xs text-slate-400 font-medium">ties</span>
          </div>
        </div>

        {/* Current Streak */}
        <div className={`relative overflow-hidden rounded-xl p-4 border transition-all ${
          streak.count >= 2
            ? 'bg-gradient-to-br from-rose-500/15 via-rose-950/25 to-transparent border-rose-500/30 ring-1 ring-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
            : 'bg-gradient-to-br from-slate-800/20 to-transparent border-white/[0.08]'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-rose-400/90 flex items-center gap-1.5">
              <Flame className={`w-3.5 h-3.5 ${streak.count >= 2 ? 'text-rose-400 animate-bounce' : 'text-slate-400'}`} />
              <span>Streak</span>
            </span>
            {streak.count >= 2 && (
              <span className="text-[10px] font-bold font-mono tracking-wider text-rose-300 uppercase bg-rose-500/20 px-1.5 py-0.5 rounded">
                ON FIRE
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            {streak.count > 0 ? (
              <>
                <span className="text-3xl font-extrabold font-mono tabular-nums text-white drop-shadow">
                  {streak.count}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {streak.winner === 'user' ? 'Player Streak' : 'AI Streak'}
                </span>
              </>
            ) : (
              <span className="text-2xl font-bold font-mono text-slate-500">
                0
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Momentum Tug-of-War Bar */}
      {contestedTotal > 0 && (
        <div className="pt-2 border-t border-white/[0.06]">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span>Player Advantage</span>
              <span>{userContestedPct}%</span>
            </span>
            <span className="text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Momentum</span>
            </span>
            <span className="text-indigo-400 font-semibold flex items-center gap-1">
              <span>{100 - userContestedPct}%</span>
              <span>AI Advantage</span>
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden flex shadow-inner border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${userContestedPct}%` }}
              title={`Player: ${userContestedPct}%`}
            />
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
              style={{ width: `${100 - userContestedPct}%` }}
              title={`AI: ${100 - userContestedPct}%`}
            />
          </div>
        </div>
      )}
    </div>
  );
};
