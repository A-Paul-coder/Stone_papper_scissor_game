export type Move = 'rock' | 'paper' | 'scissors';

export type Winner = 'user' | 'computer' | 'draw';

export type ModelType = 'markov' | 'wsls' | 'linear' | 'random';

export interface RoundRecord {
  round: number;
  userMove: Move;
  computerMove: Move;
  winner: Winner;
  predictedUserMove?: Move;
  confidence?: number;
  explanation?: string;
  probabilities?: {
    rock: number;
    paper: number;
    scissors: number;
  };
  timestamp?: number;
}

export interface PredictionResult {
  computerMove: Move;
  predictedUserMove: Move;
  confidence: number;
  probabilities: {
    rock: number;
    paper: number;
    scissors: number;
  };
  explanation: string;
  engine?: string;
}

export interface TrainingMilestone {
  round: number;
  accuracy: number;
  aiWinRate: number;
}

export interface TrainingResult {
  persona: string;
  rounds: number;
  predictionAccuracy: number;
  score: {
    aiWins: number;
    userWins: number;
    draws: number;
    aiWinRate: number;
  };
  transitionMatrix: Record<Move, Record<Move, number>>;
  milestones: TrainingMilestone[];
}

export interface PythonCodeFile {
  name: string;
  description: string;
  code: string;
}
