import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Move, Winner, RoundRecord, PredictionResult, ModelType } from './types';
import { Header } from './components/Header';
import { ScoreBoard } from './components/ScoreBoard';
import { MoveCard } from './components/MoveCard';
import { BattleArena } from './components/BattleArena';
import { HistoryLog } from './components/HistoryLog';
import { sound } from './utils/sound';
import { evaluateWinner, predictLocally } from './utils/localEngine';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [history, setHistory] = useState<RoundRecord[]>([]);
  const [userScore, setUserScore] = useState<number>(0);
  const [aiScore, setAiScore] = useState<number>(0);
  const [draws, setDraws] = useState<number>(0);
  const [streak, setStreak] = useState<{ winner: 'user' | 'computer' | null; count: number }>({
    winner: null,
    count: 0,
  });

  const [modelType] = useState<ModelType>('markov');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active round animation state
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [shakeStep, setShakeStep] = useState<string>('');
  const [currentUserMove, setCurrentUserMove] = useState<Move | null>(null);
  const [currentAiMove, setCurrentAiMove] = useState<Move | null>(null);
  const [currentWinner, setCurrentWinner] = useState<Winner | null>(null);
  const [lastRound, setLastRound] = useState<RoundRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Live prediction radar state
  const [, setPrediction] = useState<PredictionResult | null>(null);
  const [engineConnected, setEngineConnected] = useState<boolean>(true);

  // Check Python backend connection on mount
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) setEngineConnected(true);
      })
      .catch(() => setEngineConnected(false));
  }, []);

  // Fetch or calculate next prediction whenever history or modelType changes
  const updateNextPrediction = useCallback(
    async (currentHist: RoundRecord[]) => {
      try {
        const res = await fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ history: currentHist, modelType }),
        });
        const data = await res.json();
        if (data.ok && data.data) {
          setPrediction(data.data);
          setEngineConnected(true);
          return data.data as PredictionResult;
        }
      } catch (err) {
        // Fall back to client mirror
        setEngineConnected(false);
      }
      const local = predictLocally(currentHist, modelType);
      setPrediction(local);
      return local;
    },
    [modelType]
  );

  // Initial prediction
  useEffect(() => {
    updateNextPrediction(history);
  }, [modelType, updateNextPrediction]);

  // Main game execution handler
  const playMove = async (selectedMove: Move) => {
    if (isProcessing || isShaking) return;
    setIsProcessing(true);
    setCurrentUserMove(selectedMove);
    setCurrentAiMove(null);
    setCurrentWinner(null);
    setIsShaking(true);

    sound.playClick();

    // Kick off prediction in background
    const predictionPromise = updateNextPrediction(history);

    // Sequence of countdown animation with rhythmic audio
    setShakeStep('ROCK...');
    sound.playStep(280);

    await new Promise((r) => setTimeout(r, 220));
    setShakeStep('PAPER...');
    sound.playStep(350);

    await new Promise((r) => setTimeout(r, 220));
    setShakeStep('SCISSORS...');
    sound.playStep(440);

    await new Promise((r) => setTimeout(r, 220));
    setShakeStep('SHOOT!');
    sound.playStep(580);

    await new Promise((r) => setTimeout(r, 180));

    // Await AI engine response
    const currentPred = await predictionPromise;
    const aiMove = currentPred.computerMove;
    const winner = evaluateWinner(selectedMove, aiMove);

    setIsShaking(false);
    setCurrentAiMove(aiMove);
    setCurrentWinner(winner);

    // Update match scores
    if (winner === 'user') {
      setUserScore((s) => s + 1);
      setStreak((prev) => ({
        winner: 'user',
        count: prev.winner === 'user' ? prev.count + 1 : 1,
      }));
      sound.playWin();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10B981', '#6366F1', '#F59E0B'],
      });
    } else if (winner === 'computer') {
      setAiScore((s) => s + 1);
      setStreak((prev) => ({
        winner: 'computer',
        count: prev.winner === 'computer' ? prev.count + 1 : 1,
      }));
      sound.playLose();
    } else {
      setDraws((d) => d + 1);
      sound.playDraw();
    }

    const roundNum = history.length + 1;
    const roundRecord: RoundRecord = {
      round: roundNum,
      userMove: selectedMove,
      computerMove: aiMove,
      winner,
      predictedUserMove: currentPred.predictedUserMove,
      confidence: currentPred.confidence,
      explanation: currentPred.explanation,
      probabilities: currentPred.probabilities,
      timestamp: Date.now(),
    };

    const newHistory = [...history, roundRecord];
    setHistory(newHistory);
    setLastRound(roundRecord);

    // Prime next prediction immediately
    updateNextPrediction(newHistory);
    setIsProcessing(false);
  };

  // Keyboard shortcut listener (R, P, S or 1, 2, 3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      const key = e.key.toLowerCase();
      if (key === 'r' || key === '1') {
        playMove('rock');
      } else if (key === 'p' || key === '2') {
        playMove('paper');
      } else if (key === 's' || key === '3') {
        playMove('scissors');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, isProcessing, isShaking, modelType]);

  const handleReset = () => {
    sound.playClick();
    setHistory([]);
    setUserScore(0);
    setAiScore(0);
    setDraws(0);
    setStreak({ winner: null, count: 0 });
    setCurrentUserMove(null);
    setCurrentAiMove(null);
    setCurrentWinner(null);
    setLastRound(null);
    updateNextPrediction([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 bg-arena-grid relative overflow-x-hidden text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-indigo-500/15 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-amber-500/8 rounded-full blur-[100px] pointer-events-none" />

      {/* 3-Zone Top Bar */}
      <Header
        onReset={handleReset}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        engineConnected={engineConnected}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 relative z-10">
        {/* Sub-header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2.5 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-200">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Battle Arena</span>
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-slate-400">Predictive Next-Move AI</span>
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span className="text-slate-500 hidden sm:inline">Controls:</span>
            <span className="flex items-center gap-1">
              <kbd className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[11px] font-semibold text-slate-300 shadow-sm">
                R
              </kbd>
              <kbd className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[11px] font-semibold text-slate-300 shadow-sm">
                P
              </kbd>
              <kbd className="px-2 py-0.5 rounded bg-white/[0.06] border border-white/10 text-[11px] font-semibold text-slate-300 shadow-sm">
                S
              </kbd>
            </span>
          </div>
        </div>

        {/* Enhanced Scoreboard */}
        <ScoreBoard
          userScore={userScore}
          aiScore={aiScore}
          draws={draws}
          streak={streak}
        />

        {/* Active Game Arena */}
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Visual Battle Arena */}
          <BattleArena
            isShaking={isShaking}
            shakeStep={shakeStep}
            userMove={currentUserMove}
            aiMove={currentAiMove}
            lastRound={lastRound}
            winner={currentWinner}
          />

          {/* Hand Selection Move Cards */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Choose Your Move:
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Click a card or press shortcut
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MoveCard
                move="rock"
                label="Rock 🪨"
                keyHint="R"
                onClick={() => playMove('rock')}
                disabled={isProcessing}
                selected={currentUserMove === 'rock'}
              />
              <MoveCard
                move="paper"
                label="Paper 📄"
                keyHint="P"
                onClick={() => playMove('paper')}
                disabled={isProcessing}
                selected={currentUserMove === 'paper'}
              />
              <MoveCard
                move="scissors"
                label="Scissors ✂️"
                keyHint="S"
                onClick={() => playMove('scissors')}
                disabled={isProcessing}
                selected={currentUserMove === 'scissors'}
              />
            </div>
          </div>

          {/* Match History Table */}
          <HistoryLog history={history} />
        </div>
      </main>

      {/* Clean quiet footer */}
      <footer className="border-t border-white/[0.08] bg-slate-950/80 backdrop-blur-md py-4 mt-auto relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">AcroMind RPS</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>AI Rock, Paper, Scissors Game</span>
          </div>
          <div>
            <span>User vs Computer Arena</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
