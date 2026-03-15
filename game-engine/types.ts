import type { GameModeId } from "@/types";

export type TetrominoType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

export type CellValue = TetrominoType | "garbage" | null;

export type RotationDirection = "cw" | "ccw";

export interface PieceState {
  type: TetrominoType;
  rotation: number;
  x: number;
  y: number;
}

export interface EngineStats {
  combo: number;
  comboMax: number;
  backToBackCount: number;
  perfectClears: number;
  hardDrops: number;
  softDrops: number;
  piecesPlaced: number;
  attacksSent: number;
  mistakes: number;
}

export interface GameState {
  mode: GameModeId;
  board: CellValue[][];
  activePiece: PieceState | null;
  nextQueue: TetrominoType[];
  holdPiece: TetrominoType | null;
  canHold: boolean;
  score: number;
  lines: number;
  level: number;
  clearedLastTurn: number;
  status: "running" | "paused" | "over";
  gameOverReason?: "top-out" | "sprint-finished";
  elapsedMs: number;
  gravityTimerMs: number;
  lockTimerMs: number;
  rngState: number;
  bag: TetrominoType[];
  stats: EngineStats;
  garbageQueue: number[];
  pendingGarbage: number;
}

export interface TickResult {
  state: GameState;
  events: string[];
}
