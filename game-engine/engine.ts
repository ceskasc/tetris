import {
  BACK_TO_BACK_BONUS,
  BOARD_HEIGHT,
  COMBO_POINTS,
  HARD_DROP_SCORE,
  LINE_CLEAR_POINTS,
  LOCK_DELAY_MS,
  PERFECT_CLEAR_BONUS,
  SOFT_DROP_SCORE,
} from "@/constants/game";
import { createSeed } from "@/game-engine/pieces";
import {
  canPlace,
  createEmptyBoard,
  ensureQueue,
  getCells,
  rotateWithKick,
  spawnPiece,
} from "@/game-engine/pieces";
import type {
  CellValue,
  GameState,
  PieceState,
  RotationDirection,
  TickResult,
} from "@/game-engine/types";
import type { GameModeId } from "@/types";

function getGravityDelay(mode: GameModeId, level: number) {
  if (mode === "zen") {
    return Math.max(280, 900 - level * 28);
  }

  if (mode === "rahat") {
    return Math.max(180, 760 - level * 36);
  }

  if (mode === "sprint") {
    return Math.max(70, 540 - level * 42);
  }

  return Math.max(55, 700 - level * 48);
}

function cloneBoard(board: CellValue[][]) {
  return board.map((row) => [...row]);
}

function lockPiece(board: CellValue[][], piece: PieceState) {
  const nextBoard = cloneBoard(board);

  for (const cell of getCells(piece)) {
    if (cell.y >= 0) {
      nextBoard[cell.y][cell.x] = piece.type;
    }
  }

  return nextBoard;
}

function clearLines(board: CellValue[][]) {
  const keptRows = board.filter((row) => row.some((cell) => cell === null));
  const cleared = BOARD_HEIGHT - keptRows.length;
  const emptyRows = Array.from({ length: cleared }, () => board[0].map(() => null));
  const nextBoard = [...emptyRows, ...keptRows];
  const perfectClear = nextBoard.every((row) => row.every((cell) => cell === null));

  return {
    board: nextBoard,
    cleared,
    perfectClear,
  };
}

function calculateLineScore(cleared: number, level: number, combo: number, backToBack: boolean, perfectClear: boolean) {
  let base = 0;

  if (cleared === 1) {
    base = LINE_CLEAR_POINTS.tek;
  }
  if (cleared === 2) {
    base = LINE_CLEAR_POINTS.cift;
  }
  if (cleared === 3) {
    base = LINE_CLEAR_POINTS.uc;
  }
  if (cleared >= 4) {
    base = LINE_CLEAR_POINTS.dort;
  }

  let score = base * level;

  if (backToBack && cleared >= 4) {
    score = Math.round(score * BACK_TO_BACK_BONUS);
  }

  if (combo > 0) {
    score += combo * COMBO_POINTS;
  }

  if (perfectClear) {
    score += PERFECT_CLEAR_BONUS;
  }

  return score;
}

function spawnFromQueue(state: GameState) {
  const ensured = ensureQueue(state.nextQueue, state.bag, state.rngState);
  const nextType = ensured.queue[0];
  const activePiece = spawnPiece(nextType);

  return {
    ...state,
    activePiece,
    nextQueue: ensured.queue.slice(1),
    bag: ensured.bag,
    rngState: ensured.seed,
  };
}

function maybeTopOut(state: GameState) {
  if (!state.activePiece || canPlace(state.board, state.activePiece)) {
    return state;
  }

  return {
    ...state,
    status: "over" as const,
    gameOverReason: "top-out" as const,
  };
}

export function createGameState(mode: GameModeId, seed = Date.now()) {
  const initial = ensureQueue([], [], createSeed(seed));
  const state: GameState = {
    mode,
    board: createEmptyBoard(),
    activePiece: null,
    nextQueue: initial.queue,
    holdPiece: null,
    canHold: true,
    score: 0,
    lines: 0,
    level: 1,
    clearedLastTurn: 0,
    status: "running",
    elapsedMs: 0,
    gravityTimerMs: 0,
    lockTimerMs: 0,
    rngState: initial.seed,
    bag: initial.bag,
    stats: {
      combo: -1,
      comboMax: 0,
      backToBackCount: 0,
      perfectClears: 0,
      hardDrops: 0,
      softDrops: 0,
      piecesPlaced: 0,
      attacksSent: 0,
      mistakes: 0,
    },
    garbageQueue: [],
    pendingGarbage: 0,
  };

  return maybeTopOut(spawnFromQueue(state));
}

export function getGhostPiece(state: GameState) {
  if (!state.activePiece) {
    return null;
  }

  let ghost = { ...state.activePiece };
  while (canPlace(state.board, { ...ghost, y: ghost.y + 1 })) {
    ghost = { ...ghost, y: ghost.y + 1 };
  }

  return ghost;
}

export function movePiece(state: GameState, deltaX: number, deltaY: number) {
  if (!state.activePiece || state.status !== "running") {
    return state;
  }

  const candidate = {
    ...state.activePiece,
    x: state.activePiece.x + deltaX,
    y: state.activePiece.y + deltaY,
  };

  if (!canPlace(state.board, candidate)) {
    return state;
  }

  return {
    ...state,
    activePiece: candidate,
    score:
      state.score + (deltaY > 0 && deltaX === 0 ? SOFT_DROP_SCORE * deltaY : 0),
    stats:
      deltaY > 0
        ? {
            ...state.stats,
            softDrops: state.stats.softDrops + deltaY,
          }
        : state.stats,
    lockTimerMs: 0,
  };
}

export function rotatePiece(state: GameState, direction: RotationDirection) {
  if (!state.activePiece || state.status !== "running") {
    return state;
  }

  const rotated = rotateWithKick(state.board, state.activePiece, direction);

  return {
    ...state,
    activePiece: rotated,
  };
}

export function holdCurrentPiece(state: GameState) {
  if (!state.activePiece || !state.canHold || state.status !== "running") {
    return state;
  }

  const nextHold = state.activePiece.type;
  if (!state.holdPiece) {
    return maybeTopOut({
      ...spawnFromQueue({
        ...state,
        holdPiece: nextHold,
        activePiece: null,
        canHold: false,
      }),
      holdPiece: nextHold,
      canHold: false,
    });
  }

  const swappedPiece = spawnPiece(state.holdPiece);
  return maybeTopOut({
    ...state,
    activePiece: swappedPiece,
    holdPiece: nextHold,
    canHold: false,
    lockTimerMs: 0,
  });
}

function finalizePiece(state: GameState): GameState {
  if (!state.activePiece) {
    return state;
  }

  const locked = lockPiece(state.board, state.activePiece);
  const cleared = clearLines(locked);
  const combo = cleared.cleared > 0 ? state.stats.combo + 1 : -1;
  const backToBack = cleared.cleared >= 4;
  const scoreGain = calculateLineScore(
    cleared.cleared,
    state.level,
    combo,
    state.stats.backToBackCount > 0,
    cleared.perfectClear,
  );
  const nextLevel = Math.max(1, Math.floor(cleared.cleared + state.lines / 10) + 1);
  const attacks =
    cleared.cleared >= 2
      ? cleared.cleared - 1 + Math.max(0, combo)
      : 0;

  const baseState: GameState = {
    ...state,
    board: cleared.board,
    score: state.score + scoreGain,
    lines: state.lines + cleared.cleared,
    level: Math.max(state.level, nextLevel),
    clearedLastTurn: cleared.cleared,
    canHold: true,
    activePiece: null,
    gravityTimerMs: 0,
    lockTimerMs: 0,
    stats: {
      ...state.stats,
      combo,
      comboMax: Math.max(state.stats.comboMax, Math.max(combo, 0)),
      backToBackCount: backToBack
        ? state.stats.backToBackCount + 1
        : 0,
      perfectClears: state.stats.perfectClears + (cleared.perfectClear ? 1 : 0),
      piecesPlaced: state.stats.piecesPlaced + 1,
      attacksSent: state.stats.attacksSent + attacks,
    },
    pendingGarbage: 0,
  };

  if (baseState.mode === "sprint" && baseState.lines >= 40) {
    return {
      ...baseState,
      status: "over" as const,
      gameOverReason: "sprint-finished" as const,
    };
  }

  return maybeTopOut(spawnFromQueue(baseState));
}

export function hardDrop(state: GameState): GameState {
  if (!state.activePiece || state.status !== "running") {
    return state;
  }

  let dropped = { ...state.activePiece };
  let distance = 0;
  while (canPlace(state.board, { ...dropped, y: dropped.y + 1 })) {
    dropped = { ...dropped, y: dropped.y + 1 };
    distance += 1;
  }

  const landed = {
    ...state,
    activePiece: dropped,
    score: state.score + distance * HARD_DROP_SCORE,
    stats: {
      ...state.stats,
      hardDrops: state.stats.hardDrops + 1,
    },
  };

  return finalizePiece(landed);
}

export function togglePause(state: GameState): GameState {
  if (state.status === "over") {
    return state;
  }

  return {
    ...state,
    status: state.status === "paused" ? "running" : "paused",
  };
}

export function enqueueGarbage(state: GameState, lines: number) {
  if (!lines) {
    return state;
  }

  return {
    ...state,
    garbageQueue: [...state.garbageQueue, lines],
  };
}

function applyPendingGarbage(state: GameState): GameState {
  if (!state.garbageQueue.length) {
    return state;
  }

  const [amount, ...rest] = state.garbageQueue;
  const board = cloneBoard(state.board).slice(amount);

  for (let index = 0; index < amount; index += 1) {
    const hole = Math.floor(Math.random() * 10);
    const row = Array.from({ length: 10 }, (_, column) =>
      column === hole ? null : "garbage",
    ) as CellValue[];
    board.push(row);
  }

  return {
    ...state,
    board,
    garbageQueue: rest,
    pendingGarbage: amount,
  };
}

export function tick(state: GameState, deltaMs: number): TickResult {
  if (state.status !== "running" || !state.activePiece) {
    return { state, events: [] };
  }

  let nextState: GameState = {
    ...state,
    elapsedMs: state.elapsedMs + deltaMs,
    gravityTimerMs: state.gravityTimerMs + deltaMs,
  };

  const gravityDelay = getGravityDelay(state.mode, state.level);
  const events: string[] = [];

  if (nextState.gravityTimerMs >= gravityDelay) {
    const candidate = movePiece(nextState, 0, 1);

    if (candidate !== nextState) {
      nextState = {
        ...candidate,
        gravityTimerMs: 0,
      };
    } else {
      nextState = {
        ...nextState,
        lockTimerMs: nextState.lockTimerMs + deltaMs,
      };
    }
  }

  if (nextState.lockTimerMs >= LOCK_DELAY_MS) {
    nextState = finalizePiece(nextState);
    events.push("kilitlendi");
  }

  if (nextState.stats.attacksSent > state.stats.attacksSent) {
    events.push("garbage-gonder");
  }

  if (nextState.activePiece && nextState.garbageQueue.length && nextState.clearedLastTurn === 0) {
    nextState = applyPendingGarbage(nextState);
    events.push("garbage-al");
  }

  return {
    state: nextState,
    events,
  };
}

export function getBoardWithActivePiece(state: GameState) {
  const board = cloneBoard(state.board);

  const ghost = getGhostPiece(state);
  if (ghost) {
    for (const cell of getCells(ghost)) {
      if (cell.y >= 0 && board[cell.y][cell.x] === null) {
        board[cell.y][cell.x] = "garbage";
      }
    }
  }

  if (state.activePiece) {
    for (const cell of getCells(state.activePiece)) {
      if (cell.y >= 0) {
        board[cell.y][cell.x] = state.activePiece.type;
      }
    }
  }

  return board;
}
