import { BOARD_HEIGHT, BOARD_WIDTH, INITIAL_QUEUE_SIZE } from "@/constants/game";
import type { PieceState, TetrominoType } from "@/game-engine/types";

export const pieceColors: Record<TetrominoType, string> = {
  I: "#80d8ff",
  O: "#ffd782",
  T: "#d8a8ff",
  S: "#8cffc2",
  Z: "#ff9db8",
  J: "#8eb6ff",
  L: "#ffbb8c",
};

export const pieceShapes: Record<
  TetrominoType,
  ReadonlyArray<ReadonlyArray<readonly [number, number]>>
> = {
  I: [
    [
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
    ],
    [
      [2, 0],
      [2, 1],
      [2, 2],
      [2, 3],
    ],
    [
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [1, 3],
    ],
  ],
  O: [
    [
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [2, 0],
      [1, 1],
      [2, 1],
    ],
  ],
  T: [
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [2, 1],
      [1, 2],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
      [1, 2],
    ],
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
  ],
  S: [
    [
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [2, 1],
      [2, 2],
    ],
    [
      [1, 1],
      [2, 1],
      [0, 2],
      [1, 2],
    ],
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
    ],
  ],
  Z: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [2, 1],
    ],
    [
      [2, 0],
      [1, 1],
      [2, 1],
      [1, 2],
    ],
    [
      [0, 1],
      [1, 1],
      [1, 2],
      [2, 2],
    ],
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [0, 2],
    ],
  ],
  J: [
    [
      [0, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [2, 0],
      [1, 1],
      [1, 2],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
      [2, 2],
    ],
    [
      [1, 0],
      [1, 1],
      [0, 2],
      [1, 2],
    ],
  ],
  L: [
    [
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ],
    [
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 2],
    ],
    [
      [0, 1],
      [1, 1],
      [2, 1],
      [0, 2],
    ],
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [1, 2],
    ],
  ],
};

const KICKS: Record<TetrominoType | "default", readonly [number, number][]> = {
  default: [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, -1],
    [2, 0],
    [-2, 0],
  ],
  I: [
    [0, 0],
    [-1, 0],
    [1, 0],
    [-2, 0],
    [2, 0],
    [0, -1],
  ],
  O: [[0, 0]],
  T: [],
  S: [],
  Z: [],
  J: [],
  L: [],
};

export function createEmptyBoard() {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null),
  );
}

export function createSeed(seed = Date.now()) {
  return seed % 2147483647;
}

export function nextSeed(seed: number) {
  return (seed * 48271) % 2147483647;
}

export function randomFromSeed(seed: number) {
  const next = nextSeed(seed);
  return {
    next,
    value: next / 2147483647,
  };
}

export function createBag(seed: number) {
  const bag: TetrominoType[] = ["I", "O", "T", "S", "Z", "J", "L"];
  let rng = seed;

  for (let index = bag.length - 1; index > 0; index -= 1) {
    const { next, value } = randomFromSeed(rng);
    rng = next;
    const swapIndex = Math.floor(value * (index + 1));
    [bag[index], bag[swapIndex]] = [bag[swapIndex], bag[index]];
  }

  return { bag, seed: rng };
}

export function ensureQueue(
  queue: TetrominoType[],
  bag: TetrominoType[],
  seed: number,
) {
  const nextQueue = [...queue];
  let nextBag = [...bag];
  let nextSeedValue = seed;

  while (nextQueue.length < INITIAL_QUEUE_SIZE) {
    if (!nextBag.length) {
      const shuffled = createBag(nextSeedValue);
      nextBag = shuffled.bag;
      nextSeedValue = shuffled.seed;
    }

    nextQueue.push(nextBag.shift() as TetrominoType);
  }

  return {
    queue: nextQueue,
    bag: nextBag,
    seed: nextSeedValue,
  };
}

export function getCells(piece: PieceState) {
  return pieceShapes[piece.type][piece.rotation].map(([x, y]) => ({
    x: x + piece.x,
    y: y + piece.y,
  }));
}

export function canPlace(
  board: (TetrominoType | "garbage" | null)[][],
  piece: PieceState,
) {
  return getCells(piece).every(({ x, y }) => {
    if (x < 0 || x >= BOARD_WIDTH || y >= BOARD_HEIGHT) {
      return false;
    }

    if (y < 0) {
      return true;
    }

    return board[y][x] === null;
  });
}

export function spawnPiece(type: TetrominoType): PieceState {
  return {
    type,
    rotation: 0,
    x: 3,
    y: -1,
  };
}

export function rotateWithKick(
  board: (TetrominoType | "garbage" | null)[][],
  piece: PieceState,
  direction: "cw" | "ccw",
) {
  const nextRotation =
    direction === "cw" ? (piece.rotation + 1) % 4 : (piece.rotation + 3) % 4;
  const candidate = { ...piece, rotation: nextRotation };
  const kicks = KICKS[piece.type].length ? KICKS[piece.type] : KICKS.default;

  for (const [offsetX, offsetY] of kicks) {
    const kicked = {
      ...candidate,
      x: candidate.x + offsetX,
      y: candidate.y + offsetY,
    };

    if (canPlace(board, kicked)) {
      return kicked;
    }
  }

  return piece;
}
