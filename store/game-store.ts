"use client";

import { create } from "zustand";

import {
  createGameState,
  enqueueGarbage,
  hardDrop,
  holdCurrentPiece,
  movePiece,
  rotatePiece,
  tick,
  togglePause,
} from "@/game-engine/engine";
import type { GameState } from "@/game-engine/types";
import type { GameModeId, GameSessionSummary } from "@/types";

type GameStore = {
  state: GameState | null;
  sessionSummary: GameSessionSummary | null;
  lastEvents: string[];
  start: (mode: GameModeId, seed?: number) => void;
  step: (deltaMs: number) => void;
  left: () => void;
  right: () => void;
  softDrop: () => void;
  hardDrop: () => void;
  rotateCw: () => void;
  rotateCcw: () => void;
  hold: () => void;
  pause: () => void;
  addGarbage: (lines: number) => void;
  reset: () => void;
};

function toSummary(state: GameState): GameSessionSummary {
  return {
    mod: state.mode,
    skor: state.score,
    satir: state.lines,
    sureMs: state.elapsedMs,
    comboEnYuksek: state.stats.comboMax,
    level: state.level,
    perfectClear: state.stats.perfectClears,
    backToBack: state.stats.backToBackCount,
    kazanilanXp: 0,
    hatalar: state.stats.mistakes,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: null,
  sessionSummary: null,
  lastEvents: [],
  start: (mode, seed) => {
    set({
      state: createGameState(mode, seed),
      sessionSummary: null,
      lastEvents: [],
    });
  },
  step: (deltaMs) => {
    const current = get().state;
    if (!current) {
      return;
    }

    const result = tick(current, deltaMs);
    set({
      state: result.state,
      lastEvents: result.events,
      sessionSummary:
        result.state.status === "over" ? toSummary(result.state) : null,
    });
  },
  left: () => {
    const current = get().state;
    if (!current) return;
    set({ state: movePiece(current, -1, 0) });
  },
  right: () => {
    const current = get().state;
    if (!current) return;
    set({ state: movePiece(current, 1, 0) });
  },
  softDrop: () => {
    const current = get().state;
    if (!current) return;
    set({ state: movePiece(current, 0, 1) });
  },
  hardDrop: () => {
    const current = get().state;
    if (!current) return;
    const nextState = hardDrop(current);
    set({
      state: nextState,
      sessionSummary: nextState.status === "over" ? toSummary(nextState) : null,
    });
  },
  rotateCw: () => {
    const current = get().state;
    if (!current) return;
    set({ state: rotatePiece(current, "cw") });
  },
  rotateCcw: () => {
    const current = get().state;
    if (!current) return;
    set({ state: rotatePiece(current, "ccw") });
  },
  hold: () => {
    const current = get().state;
    if (!current) return;
    set({ state: holdCurrentPiece(current) });
  },
  pause: () => {
    const current = get().state;
    if (!current) return;
    set({ state: togglePause(current) });
  },
  addGarbage: (lines) => {
    const current = get().state;
    if (!current) return;
    set({ state: enqueueGarbage(current, lines) });
  },
  reset: () => {
    set({
      state: null,
      sessionSummary: null,
      lastEvents: [],
    });
  },
}));
