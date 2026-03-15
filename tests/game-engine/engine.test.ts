import { describe, expect, it } from "vitest";

import { createGameState, hardDrop } from "@/game-engine/engine";

describe("oyun motoru", () => {
  it("başlangıçta aktif parça ve kuyruk üretir", () => {
    const state = createGameState("klasik", 42);

    expect(state.activePiece).not.toBeNull();
    expect(state.nextQueue.length).toBeGreaterThanOrEqual(4);
  });

  it("sert bırakma sonrası parçayı kilitler", () => {
    const state = createGameState("klasik", 42);
    const nextState = hardDrop(state);

    expect(nextState.stats.piecesPlaced).toBeGreaterThan(0);
  });
});
