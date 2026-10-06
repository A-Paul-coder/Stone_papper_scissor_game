#!/usr/bin/env python3
"""
ai_engine.py - Core AI Models for Rock, Paper, Scissors Game.
Implements:
1. Markov Chain Predictor (Order-1 & Order-2 with Laplace smoothing)
2. Win-Stay / Lose-Shift (WSLS) Psychological Game-Theory Heuristic
3. Multi-Feature Online Adaptive Classifier (Gradient Descent)
4. Model Trainer on simulated or recorded game data
"""

import sys
import json
import random
import math
from typing import Dict, List, Tuple, Any, Optional

MOVES = ["rock", "paper", "scissors"]
WIN_MAP = {
    "rock": "scissors",      # rock beats scissors
    "paper": "rock",         # paper beats rock
    "scissors": "paper"      # scissors beats paper
}
COUNTER_MAP = {
    "rock": "paper",         # paper counters rock
    "paper": "scissors",     # scissors counters paper
    "scissors": "rock"       # rock counters scissors
}

def determine_winner(user_move: str, computer_move: str) -> str:
    """Returns 'user', 'computer', or 'draw'."""
    if user_move == computer_move:
        return "draw"
    if WIN_MAP.get(user_move) == computer_move:
        return "user"
    return "computer"

class MarkovPredictor:
    """
    Predicts next user move using Order-1 and Order-2 Markov transitions,
    conditioned on prior move and prior game outcome.
    """
    def __init__(self):
        # Order 1: prev_move -> {next_move: count}
        self.order1: Dict[str, Dict[str, float]] = {
            m: {next_m: 1.0 for next_m in MOVES} for m in MOVES
        }
        # Order 2: (prev2, prev1) -> {next_move: count}
        self.order2: Dict[str, Dict[str, float]] = {}
        # Outcome conditioned: (prev_move, outcome) -> {next_move: count}
        self.outcome_conditioned: Dict[str, Dict[str, float]] = {}
        # Overall frequency counts
        self.frequencies: Dict[str, int] = {m: 1 for m in MOVES}
        self.total_rounds: int = 0

    def record_move(self, user_move: str, prev_user_move: Optional[str] = None,
                    prev_2_user_move: Optional[str] = None, prev_outcome: Optional[str] = None):
        self.frequencies[user_move] = self.frequencies.get(user_move, 0) + 1
        self.total_rounds += 1

        if prev_user_move:
            self.order1[prev_user_move][user_move] = self.order1[prev_user_move].get(user_move, 0.0) + 1.0

            if prev_outcome:
                cond_key = f"{prev_user_move}_{prev_outcome}"
                if cond_key not in self.outcome_conditioned:
                    self.outcome_conditioned[cond_key] = {m: 1.0 for m in MOVES}
                self.outcome_conditioned[cond_key][user_move] += 1.5

            if prev_2_user_move:
                key2 = f"{prev_2_user_move}_{prev_user_move}"
                if key2 not in self.order2:
                    self.order2[key2] = {m: 1.0 for m in MOVES}
                self.order2[key2][user_move] += 2.0

    def predict_probabilities(self, history: List[Dict[str, Any]]) -> Dict[str, float]:
        if not history:
            return {"rock": 0.3333, "paper": 0.3333, "scissors": 0.3334}

        last_round = history[-1]
        prev_user_move = last_round.get("userMove")
        prev_outcome = last_round.get("winner")  # 'user', 'computer', 'draw'

        prev_2_user_move = history[-2].get("userMove") if len(history) >= 2 else None

        scores = {m: 0.0 for m in MOVES}

        # Weight 1: Overall frequency prior (weight: 1.0)
        total_freq = sum(self.frequencies.values())
        for m in MOVES:
            scores[m] += 1.0 * (self.frequencies.get(m, 1) / total_freq)

        # Weight 2: Order-1 Markov transition (weight: 2.5)
        if prev_user_move and prev_user_move in self.order1:
            row = self.order1[prev_user_move]
            total_row = sum(row.values())
            for m in MOVES:
                scores[m] += 2.5 * (row.get(m, 1.0) / total_row)

        # Weight 3: Outcome-conditioned Win-Stay / Lose-Shift (weight: 3.5)
        if prev_user_move and prev_outcome:
            cond_key = f"{prev_user_move}_{prev_outcome}"
            if cond_key in self.outcome_conditioned:
                row_cond = self.outcome_conditioned[cond_key]
                total_cond = sum(row_cond.values())
                for m in MOVES:
                    scores[m] += 3.5 * (row_cond.get(m, 1.0) / total_cond)
            else:
                # Default game theory heuristic prior:
                # If user won, high chance of repeating same move
                if prev_outcome == "user":
                    scores[prev_user_move] += 2.0
                # If user lost, high chance of shifting to beat what beat them
                elif prev_outcome == "computer":
                    ai_winning_move = last_round.get("computerMove")
                    if ai_winning_move:
                        # Shift to counter the AI's previous move
                        shift_move = COUNTER_MAP.get(ai_winning_move, "rock")
                        scores[shift_move] += 2.0

        # Weight 4: Order-2 Markov transition (weight: 4.0 if present)
        if prev_2_user_move and prev_user_move:
            key2 = f"{prev_2_user_move}_{prev_user_move}"
            if key2 in self.order2:
                row2 = self.order2[key2]
                total_row2 = sum(row2.values())
                for m in MOVES:
                    scores[m] += 4.0 * (row2.get(m, 1.0) / total_row2)

        # Normalize to probability distribution
        total_score = sum(scores.values())
        if total_score <= 0:
            return {"rock": 0.3333, "paper": 0.3333, "scissors": 0.3334}

        return {m: round(scores[m] / total_score, 4) for m in MOVES}


class WSLSPredictor:
    """
    Win-Stay, Lose-Shift Heuristic Predictor based on Wang et al. (Nature 2014)
    Empirical research shows humans tend to repeat winning actions and cyclically
    rotate losing actions (Rock -> Paper -> Scissors -> Rock).
    """
    def predict_probabilities(self, history: List[Dict[str, Any]]) -> Dict[str, float]:
        if not history:
            return {"rock": 0.3333, "paper": 0.3333, "scissors": 0.3334}

        last = history[-1]
        user_move = last.get("userMove")
        winner = last.get("winner")

        if not user_move:
            return {"rock": 0.3333, "paper": 0.3333, "scissors": 0.3334}

        probs = {"rock": 0.15, "paper": 0.15, "scissors": 0.15}

        if winner == "user":
            # Win-Stay: Tendency to repeat winning move
            probs[user_move] = 0.70
        elif winner == "computer":
            # Lose-Shift: Tendency to switch to clockwise successor
            # (Rock -> Paper, Paper -> Scissors, Scissors -> Rock)
            next_clockwise = COUNTER_MAP.get(user_move, "paper")
            probs[next_clockwise] = 0.65
        else:
            # Draw: Tendency to shift away from tie
            other_moves = [m for m in MOVES if m != user_move]
            for m in other_moves:
                probs[m] = 0.425
            probs[user_move] = 0.15

        total = sum(probs.values())
        return {m: round(probs[m] / total, 4) for m in MOVES}


class OnlineLinearPredictor:
    """
    Online supervised learner using softmax-linear model with stochastic gradient updates.
    Features include:
    - One-hot of last user move (3)
    - One-hot of last AI move (3)
    - Outcome of last round (3: win, loss, tie)
    - Bias term (1)
    Total 10 features per class.
    """
    def __init__(self, learning_rate: float = 0.15):
        self.lr = learning_rate
        # weights: 3 classes (rock, paper, scissors) x 10 features
        self.weights = {
            m: [0.0] * 10 for m in MOVES
        }

    def _extract_features(self, history: List[Dict[str, Any]]) -> List[float]:
        # [u_rock, u_paper, u_scissors, c_rock, c_paper, c_scissors, out_win, out_loss, out_draw, bias]
        feats = [0.0] * 10
        feats[9] = 1.0  # bias

        if not history:
            return feats

        last = history[-1]
        u_move = last.get("userMove")
        c_move = last.get("computerMove")
        winner = last.get("winner")

        if u_move in MOVES:
            feats[MOVES.index(u_move)] = 1.0
        if c_move in MOVES:
            feats[3 + MOVES.index(c_move)] = 1.0
        if winner == "user":
            feats[6] = 1.0
        elif winner == "computer":
            feats[7] = 1.0
        elif winner == "draw":
            feats[8] = 1.0

        return feats

    def predict_probabilities(self, history: List[Dict[str, Any]]) -> Dict[str, float]:
        feats = self._extract_features(history)
        logits = {}
        for m in MOVES:
            w = self.weights[m]
            dot = sum(w[i] * feats[i] for i in range(10))
            logits[m] = dot

        max_logit = max(logits.values())
        exp_logits = {m: math.exp(logits[m] - max_logit) for m in MOVES}
        total_exp = sum(exp_logits.values())
        return {m: round(exp_logits[m] / total_exp, 4) for m in MOVES}

    def train_step(self, prev_history: List[Dict[str, Any]], actual_user_move: str):
        feats = self._extract_features(prev_history)
        probs = self.predict_probabilities(prev_history)

        for m in MOVES:
            target = 1.0 if m == actual_user_move else 0.0
            error = probs[m] - target
            for i in range(10):
                self.weights[m][i] -= self.lr * error * feats[i]


def choose_ai_move(model_type: str, history: List[Dict[str, Any]],
                   markov_model: Optional[MarkovPredictor] = None,
                   linear_model: Optional[OnlineLinearPredictor] = None) -> Tuple[str, str, float, Dict[str, float], str]:
    """
    Returns:
    (ai_move, predicted_user_move, confidence, probabilities, explanation)
    """
    if model_type == "random":
        probs = {"rock": 0.3333, "paper": 0.3333, "scissors": 0.3334}
        pred_move = random.choice(MOVES)
        ai_move = random.choice(MOVES)
        return ai_move, pred_move, 0.33, probs, "AI picked an unpredictable move."

    # Build fresh Markov model from history if not supplied
    if markov_model is None:
        markov_model = MarkovPredictor()
        for i, round_data in enumerate(history):
            prev_u = history[i-1]["userMove"] if i > 0 else None
            prev_2u = history[i-2]["userMove"] if i > 1 else None
            prev_out = history[i-1].get("winner") if i > 0 else None
            markov_model.record_move(round_data["userMove"], prev_u, prev_2u, prev_out)

    if model_type == "wsls":
        wsls = WSLSPredictor()
        probs = wsls.predict_probabilities(history)
    elif model_type == "linear":
        if linear_model is None:
            linear_model = OnlineLinearPredictor()
            for i in range(1, len(history)):
                linear_model.train_step(history[:i], history[i]["userMove"])
        probs = linear_model.predict_probabilities(history)
    else:  # default 'markov' (hybrid)
        probs = markov_model.predict_probabilities(history)

    # Find highest probability move
    sorted_probs = sorted(probs.items(), key=lambda item: item[1], reverse=True)
    predicted_user_move, confidence = sorted_probs[0]

    # Counter the predicted user move
    ai_move = COUNTER_MAP[predicted_user_move]

    explanation = f"AI predicted you would play {predicted_user_move.upper()} and countered with {ai_move.upper()}."

    return ai_move, predicted_user_move, confidence, probs, explanation


def simulate_training(persona: str, num_rounds: int = 50) -> Dict[str, Any]:
    """
    Simulates training against a specific human persona and calculates accuracy curve.
    Personas:
    - 'alternator': rotates Rock -> Paper -> Scissors
    - 'rock_lover': throws Rock ~60% of the time
    - 'wsls_human': strictly plays win-stay lose-shift
    - 'adaptive_counter': tries to outguess the bot
    """
    markov = MarkovPredictor()
    sim_history: List[Dict[str, Any]] = []
    correct_predictions = 0
    accuracy_milestones: List[Dict[str, Any]] = []

    last_user_move = random.choice(MOVES)
    last_outcome = "draw"

    for r in range(1, num_rounds + 1):
        # Determine simulated user move based on persona
        if persona == "alternator":
            cycle = {"rock": "paper", "paper": "scissors", "scissors": "rock"}
            user_move = cycle.get(last_user_move, "rock")
        elif persona == "rock_lover":
            user_move = random.choices(["rock", "paper", "scissors"], weights=[0.60, 0.20, 0.20])[0]
        elif persona == "wsls_human":
            if last_outcome == "user":
                user_move = last_user_move  # Stay
            else:
                user_move = COUNTER_MAP.get(last_user_move, "paper")  # Shift
        else:  # balanced random with slight bias
            user_move = random.choices(["rock", "paper", "scissors"], weights=[0.38, 0.31, 0.31])[0]

        # AI predicts
        probs = markov.predict_probabilities(sim_history)
        predicted_move = max(probs.items(), key=lambda x: x[1])[0]
        ai_move = COUNTER_MAP[predicted_move]

        if predicted_move == user_move:
            correct_predictions += 1

        winner = determine_winner(user_move, ai_move)
        last_outcome = winner
        last_user_move = user_move

        # Record into Markov model
        prev_u = sim_history[-1]["userMove"] if sim_history else None
        prev_2u = sim_history[-2]["userMove"] if len(sim_history) >= 2 else None
        prev_out = sim_history[-1]["winner"] if sim_history else None
        markov.record_move(user_move, prev_u, prev_2u, prev_out)

        sim_history.append({
            "round": r,
            "userMove": user_move,
            "computerMove": ai_move,
            "winner": winner
        })

        if r % max(1, num_rounds // 10) == 0 or r == num_rounds:
            accuracy_milestones.append({
                "round": r,
                "accuracy": round((correct_predictions / r) * 100, 1),
                "aiWinRate": round((sum(1 for g in sim_history if g['winner'] == 'computer') / r) * 100, 1)
            })

    final_acc = round((correct_predictions / num_rounds) * 100, 1)
    ai_wins = sum(1 for g in sim_history if g["winner"] == "computer")
    user_wins = sum(1 for g in sim_history if g["winner"] == "user")
    draws = sum(1 for g in sim_history if g["winner"] == "draw")

    return {
        "persona": persona,
        "rounds": num_rounds,
        "predictionAccuracy": final_acc,
        "score": {
            "aiWins": ai_wins,
            "userWins": user_wins,
            "draws": draws,
            "aiWinRate": round((ai_wins / num_rounds) * 100, 1)
        },
        "transitionMatrix": markov.order1,
        "milestones": accuracy_milestones
    }


def main():
    """Command line JSON processor or test runner."""
    if len(sys.argv) > 1 and sys.argv[1] == "--predict":
        try:
            payload = json.loads(sys.stdin.read())
            history = payload.get("history", [])
            model_type = payload.get("modelType", "markov")
            ai_move, pred_user, conf, probs, expl = choose_ai_move(model_type, history)

            res = {
                "computerMove": ai_move,
                "predictedUserMove": pred_user,
                "confidence": round(conf, 4),
                "probabilities": probs,
                "explanation": expl,
                "engine": "Python 3.10 AI Engine (Markov/N-Gram/WSLS)"
            }
            print(json.dumps(res))
            return
        except Exception as e:
            print(json.dumps({"error": str(e)}), file=sys.stderr)
            sys.exit(1)

    if len(sys.argv) > 1 and sys.argv[1] == "--train":
        try:
            payload = json.loads(sys.stdin.read())
            persona = payload.get("persona", "wsls_human")
            rounds = int(payload.get("rounds", 50))
            result = simulate_training(persona, rounds)
            print(json.dumps(result))
            return
        except Exception as e:
            print(json.dumps({"error": str(e)}), file=sys.stderr)
            sys.exit(1)

    print("AI Engine ready. Use --predict or --train with JSON on stdin.")

if __name__ == "__main__":
    main()
