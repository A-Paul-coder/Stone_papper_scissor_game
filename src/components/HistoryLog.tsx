import React from 'react';
import { RoundRecord, Move } from '../types';
import { History, Check, X, Minus } from 'lucide-react';

interface HistoryLogProps {
  history: RoundRecord[];
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="w-full glass-panel rounded-2xl p-8 text-center text-xs text-slate-400 font-mono">
        <div className="w-10 h-10 rounded-full border border-white/10 bg-slate-900/50 flex items-center justify-center text-slate-400 mx-auto mb-2">
          <History className="w-4 h-4" />
        </div>
        <div>No rounds played yet. Choose Rock, Paper, or Scissors above!</div>
      </div>
    );
  }

  const renderMoveBadge = (move: Move) => {
    switch (move) {
      case 'rock':
        return (
          <span className="text-amber-400 font-mono flex items-center gap-1.5 font-bold">
            <span>🪨</span>
            <span className="capitalize">Rock</span>
          </span>
        );
      case 'paper':
        return (
          <span className="text-sky-400 font-mono flex items-center gap-1.5 font-bold">
            <span>📄</span>
            <span className="capitalize">Paper</span>
          </span>
        );
      case 'scissors':
        return (
          <span className="text-emerald-400 font-mono flex items-center gap-1.5 font-bold">
            <span>✂️</span>
            <span className="capitalize">Scissors</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-5 sm:p-6 shadow-2xl">
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <History className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide">Match History</h3>
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Showing last {Math.min(10, history.length)} of {history.length} {history.length === 1 ? 'round' : 'rounds'}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono text-left">
          <thead>
            <tr className="border-b border-white/[0.06] text-slate-400">
              <th className="py-2.5 px-3">Round</th>
              <th className="py-2.5 px-3">Player Throw</th>
              <th className="py-2.5 px-3">AI Throw</th>
              <th className="py-2.5 px-3">Outcome</th>
              <th className="py-2.5 px-3">AI Forecast</th>
              <th className="py-2.5 px-3">AI Prediction</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-slate-200">
            {history
              .slice(-10)
              .reverse()
              .map((round) => {
                const predictedAccurate = round.predictedUserMove === round.userMove;

                return (
                  <tr key={round.round} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-400">#{round.round}</td>
                    <td className="py-3 px-3">{renderMoveBadge(round.userMove)}</td>
                    <td className="py-3 px-3">{renderMoveBadge(round.computerMove)}</td>
                    <td className="py-3 px-3">
                      {round.winner === 'user' && (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Player Won</span>
                        </span>
                      )}
                      {round.winner === 'computer' && (
                        <span className="text-indigo-400 font-bold flex items-center gap-1">
                          <X className="w-3.5 h-3.5 text-indigo-400" />
                          <span>AI Won</span>
                        </span>
                      )}
                      {round.winner === 'draw' && (
                        <span className="text-amber-400 font-bold">Draw</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {round.predictedUserMove ? (
                        renderMoveBadge(round.predictedUserMove)
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {round.predictedUserMove ? (
                        predictedAccurate ? (
                          <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>Correct</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                            <span>Missed</span>
                          </span>
                        )
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-slate-600" />
                      )}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
