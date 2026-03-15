import { describe, expect, it } from "vitest";

import { RoomManager } from "@/server/matchmaking/room-manager";

describe("oda yoneticisi", () => {
  it("ozel odaya iki oyuncu alir", () => {
    const manager = new RoomManager();
    manager.joinRoom("ABC123", {
      socketId: "1",
      userId: "u1",
      username: "oyuncu1",
    });
    const room = manager.joinRoom("ABC123", {
      socketId: "2",
      userId: "u2",
      username: "oyuncu2",
    });

    expect(room?.players.length).toBe(2);
  });

  it("best-of yapisinda raund galibiyeti sayilir ve sonraki raund planlanir", () => {
    const manager = new RoomManager({ roundBreakMs: 0 });
    manager.joinRoom("ABC123", {
      socketId: "1",
      userId: "u1",
      username: "oyuncu1",
    });
    manager.joinRoom("ABC123", {
      socketId: "2",
      userId: "u2",
      username: "oyuncu2",
    });
    manager.toggleReady("ABC123", "u1");
    manager.toggleReady("ABC123", "u2");

    const roundOne = manager.reportPlayerDefeat("ABC123", "u1", "top-out");
    expect(roundOne?.roundWinnerId).toBe("u2");
    expect(roundOne?.matchWinnerId).toBeNull();
    expect(
      roundOne?.snapshot?.players.find((player) => player.userId === "u2")?.roundWins,
    ).toBe(1);

    const started = manager.advanceScheduledRounds();
    expect(started[0]?.snapshot?.currentRound).toBe(2);
    expect(started[0]?.snapshot?.status).toBe("oyunda");
  });

  it("saldiri gonderimini satir farkina gore sinirlar", () => {
    const manager = new RoomManager();
    manager.joinRoom("ABC123", {
      socketId: "1",
      userId: "u1",
      username: "oyuncu1",
    });
    manager.joinRoom("ABC123", {
      socketId: "2",
      userId: "u2",
      username: "oyuncu2",
    });
    manager.toggleReady("ABC123", "u1");
    manager.toggleReady("ABC123", "u2");

    const noLines = manager.updatePlayerState("ABC123", "u1", {
      score: 100,
      lines: 0,
      level: 1,
      attacksSent: 8,
    });
    expect(noLines?.attackDelta).toBe(0);

    const withLines = manager.updatePlayerState("ABC123", "u1", {
      score: 400,
      lines: 2,
      level: 1,
      attacksSent: 8,
    });
    expect(withLines?.attackDelta).toBe(6);
  });

  it("kopan oyuncu suresi dolunca maci kapatir", () => {
    const manager = new RoomManager({ disconnectGraceMs: 1 });
    manager.joinRoom("ABC123", {
      socketId: "1",
      userId: "u1",
      username: "oyuncu1",
    });
    manager.joinRoom("ABC123", {
      socketId: "2",
      userId: "u2",
      username: "oyuncu2",
    });
    manager.toggleReady("ABC123", "u1");
    manager.toggleReady("ABC123", "u2");
    const room = manager.disconnect("1");
    if (room) {
      room.players[0].disconnectDeadline = Date.now() - 1000;
    }

    const expired = manager.resolveExpiredDisconnects();
    expect(expired[0]?.winnerId).toBe("u2");
    expect(expired[0]?.snapshot?.winnerId).toBe("u2");
  });
});
