import React from 'react';
import { Volume2, VolumeX, RotateCcw, Swords } from 'lucide-react';
import { sound } from '../utils/sound';

interface HeaderProps {
  onReset: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  engineConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  soundEnabled,
  setSoundEnabled,
  engineConnected,
}) => {
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setSoundEnabled(next);
    if (next) sound.playClick();
  };

  return (
    <header className="border-b border-white/[0.08] bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => e.preventDefault()}
            className="group flex items-center gap-2.5 text-lg font-bold tracking-tight text-white transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Swords className="w-4 h-4" />
            </div>
            <span className="font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              AcroMind RPS
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                engineConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse' : 'bg-amber-400'
              }`}
              title={engineConnected ? 'AI Engine Online' : 'Connecting to AI Engine'}
            />
          </a>
        </div>

        {/* Zone 2: Subtitle */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>AI-Powered Game Arena</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-indigo-400 font-mono">Player vs AI</span>
        </div>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/[0.06] rounded-lg transition-colors cursor-pointer border border-transparent hover:border-white/10"
            title={soundEnabled ? 'Sound FX On' : 'Sound FX Muted'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          <button
            onClick={onReset}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap active:scale-95 cursor-pointer shadow-sm"
            title="Reset match scores and history"
          >
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Reset Score</span>
          </button>
        </div>
      </div>
    </header>
  );
};
