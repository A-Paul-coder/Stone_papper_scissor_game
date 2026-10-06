#!/usr/bin/env python3
"""
rps_game.py - Standalone AI Rock, Paper, Scissors Terminal Game.
Play directly in terminal or inspect the source code in the web dashboard!

Features:
- Predictive AI using Markov Chain & Psychological Game Theory (WSLS)
- Live probability distribution inspection
- Real-time score tracking & win rates
- ASCII art representations of moves
"""

import sys
import os
import random
from typing import List, Dict, Any
from ai_engine import MarkovPredictor, choose_ai_move, determine_winner, MOVES, WIN_MAP, COUNTER_MAP

ASCII_ART = {
    "rock": """
    _______
---'   ____)
      (_____)
      (_____)
      (____)
---.__(___)
    """,
    "paper": """
     _______
---'    ____)____
           ______)
          _______)
         _______)
---.__________)
    """,
    "scissors": """
    _______
---'   ____)____
          ______)
       __________)
      (____)
---.__(___)
    """
}

# ANSI colors for nice terminal rendering
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
MAGENTA = "\033[95m"
BOLD = "\033[1m"
RESET = "\033[0m"

def print_header():
    print(f"\n{CYAN}{BOLD}{'='*60}")
    print("   AI ROCK, PAPER, SCISSORS — POWERED BY PYTHON")
    print("   Markov Chain & Behavioral Pattern Recognition")
    print(f"{'='*60}{RESET}\n")

def display_hud(user_score: int, ai_score: int, draws: int, round_num: int):
    total = user_score + ai_score + draws
    user_pct = (user_score / total * 100) if total > 0 else 0
    ai_pct = (ai_score / total * 100) if total > 0 else 0
    print(f"{YELLOW}--- ROUND {round_num} SCOREBOARD ---{RESET}")
    print(f"You (Player):  {GREEN}{user_score}{RESET} wins ({user_pct:.1f}%)")
    print(f"AI Computer:   {RED}{ai_score}{RESET} wins ({ai_pct:.1f}%)")
    print(f"Ties/Draws:    {CYAN}{draws}{RESET}")
    print("-" * 35)

def main():
    print_header()
    history: List[Dict[str, Any]] = []
    user_score = 0
    ai_score = 0
    draws = 0
    round_num = 1
    markov_model = MarkovPredictor()

    print(f"{BOLD}Choose AI Intelligence Mode:{RESET}")
    print("1. Adaptive Markov Pattern Predictor (Learns your habits)")
    print("2. Win-Stay / Lose-Shift Behavioral Heuristic")
    print("3. Unbiased Random baseline")
    choice = input(f"{CYAN}Enter mode [1-3] (default 1): {RESET}").strip()

    model_type = "markov"
    if choice == "2":
        model_type = "wsls"
    elif choice == "3":
        model_type = "random"

    print(f"\n{GREEN}Mode selected: {model_type.upper()}. Let's play!{RESET}\n")

    while True:
        display_hud(user_score, ai_score, draws, round_num)

        # AI calculates prediction BEFORE user inputs move!
        ai_move, predicted_user, conf, probs, explanation = choose_ai_move(
            model_type, history, markov_model=markov_model
        )

        user_input = input(f"{BOLD}Enter your move ({GREEN}[r]ock{RESET}, {CYAN}[p]aper{RESET}, {MAGENTA}[s]cissors{RESET}, or [q]uit): {RESET}").strip().lower()

        if user_input in ["q", "quit", "exit"]:
            print(f"\n{YELLOW}Thanks for playing! Final tally: You {user_score} - AI {ai_score} - Ties {draws}{RESET}")
            break

        move_map = {
            "r": "rock", "rock": "rock", "1": "rock",
            "p": "paper", "paper": "paper", "2": "paper",
            "s": "scissors", "scissors": "scissors", "3": "scissors"
        }

        user_move = move_map.get(user_input)
        if not user_move:
            print(f"{RED}Invalid move! Please enter 'rock', 'paper', or 'scissors'.{RESET}\n")
            continue

        winner = determine_winner(user_move, ai_move)

        print(f"\n{BOLD}You played: {user_move.upper()}{RESET}")
        print(ASCII_ART.get(user_move, ""))
        print(f"{BOLD}AI played:  {ai_move.upper()}{RESET}")
        print(ASCII_ART.get(ai_move, ""))

        # Show AI thought process
        print(f"{MAGENTA}[AI Model Analysis]{RESET} Probabilities: Rock {probs['rock']*100:.1f}% | Paper {probs['paper']*100:.1f}% | Scissors {probs['scissors']*100:.1f}%")
        print(f"Predicted your move: {predicted_user.upper()} (Confidence: {conf*100:.1f}%)")

        if winner == "user":
            user_score += 1
            print(f"\n{GREEN}{BOLD}🎉 You WON Round {round_num}! {user_move.capitalize()} beats {ai_move}.{RESET}\n")
        elif winner == "computer":
            ai_score += 1
            print(f"\n{RED}{BOLD}🤖 AI WON Round {round_num}! {ai_move.capitalize()} beats {user_move}.{RESET}\n")
        else:
            draws += 1
            print(f"\n{CYAN}{BOLD}🤝 It's a DRAW! Both threw {user_move}.{RESET}\n")

        # Record into history & model
        prev_u = history[-1]["userMove"] if history else None
        prev_2u = history[-2]["userMove"] if len(history) >= 2 else None
        prev_out = history[-1]["winner"] if history else None
        markov_model.record_move(user_move, prev_u, prev_2u, prev_out)

        history.append({
            "round": round_num,
            "userMove": user_move,
            "computerMove": ai_move,
            "winner": winner
        })

        round_num += 1
        print("=" * 60)

if __name__ == "__main__":
    main()
