import { Move, Winner, RoundRecord, PredictionResult, ModelType } from '../types';

export const MOVES: Move[] = ['rock', 'paper', 'scissors'];

export const COUNTER_MAP: Record<Move, Move> = {
  rock: 'paper',
  paper: 'scissors',
  scissors: 'rock',
};

export const BEATS_MAP: Record<Move, Move> = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper',
};

export function evaluateWinner(userMove: Move, computerMove: Move): Winner {
  if (userMove === computerMove) return 'draw';
  if (BEATS_MAP[userMove] === computerMove) return 'user';
  return 'computer';
}

/**
 * Client-side mirror of the Python Markov & WSLS prediction logic
 */
export function predictLocally(history: RoundRecord[], modelType: ModelType): PredictionResult {
  if (modelType === 'random' || history.length === 0) {
    const aiMove = MOVES[Math.floor(Math.random() * MOVES.length)];
    const predMove = MOVES[Math.floor(Math.random() * MOVES.length)];
    return {
      computerMove: aiMove,
      predictedUserMove: predMove,
      confidence: 0.3333,
      probabilities: { rock: 0.3333, paper: 0.3333, scissors: 0.3334 },
      explanation: 'Random baseline selector chose unbiased random move.',
      engine: 'Client Fast Fallback',
    };
  }

  const lastRound = history[history.length - 1];
  const prevMove = lastRound.userMove;
  const prevOutcome = lastRound.winner;
  const prev2Move = history.length >= 2 ? history[history.length - 2].userMove : null;

  const probs: Record<Move, number> = { rock: 0.1, paper: 0.1, scissors: 0.1 };

  if (modelType === 'wsls') {
    if (prevOutcome === 'user') {
      probs[prevMove] += 0.7; // Win-Stay
    } else if (prevOutcome === 'computer') {
      const shift = COUNTER_MAP[prevMove]; // Lose-Shift
      probs[shift] += 0.65;
    } else {
      const others = MOVES.filter((m) => m !== prevMove);
      others.forEach((m) => (probs[m] += 0.4));
    }
  } else {
    // Markov Order 1 & 2
    // Count user transitions in history
    const order1Counts: Record<Move, Record<Move, number>> = {
      rock: { rock: 1, paper: 1, scissors: 1 },
      paper: { rock: 1, paper: 1, scissors: 1 },
      scissors: { rock: 1, paper: 1, scissors: 1 },
    };

    for (let i = 1; i < history.length; i++) {
      const p = history[i - 1].userMove;
      const c = history[i].userMove;
      order1Counts[p][c] = (order1Counts[p][c] || 0) + 1;
    }

    const row = order1Counts[prevMove];
    const totalRow = row.rock + row.paper + row.scissors;
    probs.rock += (row.rock / totalRow) * 2.5;
    probs.paper += (row.paper / totalRow) * 2.5;
    probs.scissors += (row.scissors / totalRow) * 2.5;

    // Outcome bias
    if (prevOutcome === 'user') probs[prevMove] += 1.8;
    else if (prevOutcome === 'computer') probs[COUNTER_MAP[lastRound.computerMove]] += 1.8;

    // Order 2 if history >= 2
    if (prev2Move) {
      let matchCount = 0;
      const nextCounts: Record<Move, number> = { rock: 0, paper: 0, scissors: 0 };
      for (let i = 2; i < history.length; i++) {
        if (history[i - 2].userMove === prev2Move && history[i - 1].userMove === prevMove) {
          nextCounts[history[i].userMove]++;
          matchCount++;
        }
      }
      if (matchCount > 0) {
        probs.rock += (nextCounts.rock / matchCount) * 3.0;
        probs.paper += (nextCounts.paper / matchCount) * 3.0;
        probs.scissors += (nextCounts.scissors / matchCount) * 3.0;
      }
    }
  }

  const sumProbs = probs.rock + probs.paper + probs.scissors;
  const normalizedProbs = {
    rock: Number((probs.rock / sumProbs).toFixed(4)),
    paper: Number((probs.paper / sumProbs).toFixed(4)),
    scissors: Number((probs.scissors / sumProbs).toFixed(4)),
  };

  const sorted = (Object.keys(normalizedProbs) as Move[]).sort(
    (a, b) => normalizedProbs[b] - normalizedProbs[a]
  );
  const predictedUserMove = sorted[0];
  const confidence = normalizedProbs[predictedUserMove];
  const computerMove = COUNTER_MAP[predictedUserMove];

  return {
    computerMove,
    predictedUserMove,
    confidence,
    probabilities: normalizedProbs,
    explanation: `AI predicted you would play ${predictedUserMove.toUpperCase()} and countered with ${computerMove.toUpperCase()}.`,
    engine: 'Python Algorithm Mirror',
  };
}
