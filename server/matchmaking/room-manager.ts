import { nanoid } from "nanoid";

import type {
  MatchFinishReason,
  RoomRoundSnapshot,
  RoomSnapshot,
} from "@/multiplayer/protocol";

type ConnectedPlayer = {
  socketId: string;
  userId: string;
  username: string;
  ready: boolean;
  connected: boolean;
  seat: number;
  score: number;
  lines: number;
  level: number;
  attacksSent: number;
  roundWins: number;
  disconnectDeadline: number | null;
};

type RoomPlayerSeed = Pick<ConnectedPlayer, "socketId" | "userId" | "username">;

type RoomState = {
  roomCode: string;
  status: "bekleniyor" | "hazirlik" | "oyunda" | "tamamlandi";
  bestOf: number;
  currentRound: number;
  roundTarget: number;
  nextRoundAt: number | null;
  players: ConnectedPlayer[];
  roundHistory: RoomRoundSnapshot[];
  lastRoundWinnerId: string | null;
  lastRoundReason: MatchFinishReason | null;
  winnerId: string | null;
  finishReason: MatchFinishReason | null;
};

export type RoundResolution = {
  roomCode: string;
  roundWinnerId: string;
  matchWinnerId: string | null;
  reason: MatchFinishReason;
  snapshot: RoomSnapshot | null;
};

export type PlayerStateUpdateResult = {
  room: RoomState;
  attackDelta: number;
};

export class RoomManager {
  private rooms = new Map<string, RoomState>();

  private quickQueue: ConnectedPlayer[] = [];

  private readonly disconnectGraceMs: number;

  private readonly roundBreakMs: number;

  constructor(options?: {
    disconnectGraceMs?: number;
    roundBreakMs?: number;
  }) {
    this.disconnectGraceMs = options?.disconnectGraceMs ?? 60_000;
    this.roundBreakMs = options?.roundBreakMs ?? 4_000;
  }

  private createPlayer(seed: RoomPlayerSeed, seat: number): ConnectedPlayer {
    return {
      ...seed,
      ready: false,
      connected: true,
      seat,
      score: 0,
      lines: 0,
      level: 1,
      attacksSent: 0,
      roundWins: 0,
      disconnectDeadline: null,
    };
  }

  private startRound(room: RoomState, incrementRound: boolean) {
    room.currentRound = incrementRound ? room.currentRound + 1 : Math.max(1, room.currentRound);
    room.status = "oyunda";
    room.nextRoundAt = null;
    room.lastRoundWinnerId = null;
    room.lastRoundReason = null;
    room.finishReason = null;
    room.players.forEach((player) => {
      player.ready = true;
      player.score = 0;
      player.lines = 0;
      player.level = 1;
      player.attacksSent = 0;
      player.disconnectDeadline = null;
    });
  }

  queueForQuickMatch(player: RoomPlayerSeed) {
    const queued = this.createPlayer(player, 1);
    const rival = this.quickQueue.shift();

    if (!rival) {
      this.quickQueue.push(queued);
      return { waiting: true as const };
    }

    const roomCode = this.createRoom(3, [rival, this.createPlayer(player, 2)]);
    const snapshot = this.getSnapshot(roomCode);

    return {
      waiting: false as const,
      roomCode,
      socketIds: [rival.socketId, queued.socketId],
      snapshot,
    };
  }

  createRoom(bestOf: number, initialPlayers: ConnectedPlayer[] = []) {
    const roomCode = nanoid(6).toUpperCase();
    this.rooms.set(roomCode, {
      roomCode,
      status: initialPlayers.length === 2 ? "hazirlik" : "bekleniyor",
      bestOf,
      currentRound: 0,
      roundTarget: Math.max(1, Math.ceil(bestOf / 2)),
      nextRoundAt: null,
      winnerId: null,
      finishReason: null,
      roundHistory: [],
      lastRoundWinnerId: null,
      lastRoundReason: null,
      players: initialPlayers.map((player, index) => ({
        ...player,
        seat: index + 1,
        attacksSent: player.attacksSent ?? 0,
        roundWins: player.roundWins ?? 0,
      })),
    });
    return roomCode;
  }

  joinRoom(roomCode: string, player: RoomPlayerSeed) {
    const existingRoom = this.rooms.get(roomCode);
    if (!existingRoom) {
      this.rooms.set(roomCode, {
        roomCode,
        status: "bekleniyor",
        bestOf: 3,
        currentRound: 0,
        roundTarget: 2,
        nextRoundAt: null,
        winnerId: null,
        finishReason: null,
        roundHistory: [],
        lastRoundWinnerId: null,
        lastRoundReason: null,
        players: [this.createPlayer(player, 1)],
      });
      return this.rooms.get(roomCode) ?? null;
    }

    const room = existingRoom;
    const existingPlayer = room.players.find((entry) => entry.userId === player.userId);
    if (existingPlayer) {
      existingPlayer.socketId = player.socketId;
      existingPlayer.connected = true;
      existingPlayer.disconnectDeadline = null;
      if (room.status !== "tamamlandi" && room.currentRound > 0) {
        existingPlayer.ready = true;
      }
      return room;
    }

    if (room.players.length >= 2) {
      return null;
    }

    room.players.push(this.createPlayer(player, room.players.length + 1));
    room.status = "hazirlik";
    return room;
  }

  toggleReady(roomCode: string, userId: string) {
    const room = this.rooms.get(roomCode);
    if (!room) {
      return null;
    }

    const player = room.players.find((entry) => entry.userId === userId);
    if (!player) {
      return null;
    }

    if (room.status === "oyunda" || room.status === "tamamlandi" || room.currentRound > 0) {
      return room;
    }

    player.ready = !player.ready;
    room.status = room.players.length === 2 ? "hazirlik" : "bekleniyor";
    room.winnerId = null;
    room.finishReason = null;

    if (
      room.players.length === 2 &&
      room.players.every((entry) => entry.ready && entry.connected)
    ) {
      this.startRound(room, false);
    }

    return room;
  }

  updatePlayerState(
    roomCode: string,
    userId: string,
    partial: Partial<Pick<ConnectedPlayer, "score" | "lines" | "level" | "attacksSent">>,
  ): PlayerStateUpdateResult | null {
    const room = this.rooms.get(roomCode);
    if (!room || room.status !== "oyunda") {
      return null;
    }

    const player = room.players.find((entry) => entry.userId === userId);
    if (!player) {
      return null;
    }

    const previousLines = player.lines;
    const previousAttacks = player.attacksSent;

    if (typeof partial.score === "number") {
      player.score = Math.max(0, Math.floor(partial.score));
    }
    if (typeof partial.lines === "number") {
      player.lines = Math.max(0, Math.floor(partial.lines));
    }
    if (typeof partial.level === "number") {
      player.level = Math.max(1, Math.floor(partial.level));
    }

    let attackDelta = 0;

    if (typeof partial.attacksSent === "number") {
      const nextAttacks = Math.max(previousAttacks, Math.floor(partial.attacksSent));
      const rawDelta = nextAttacks - previousAttacks;
      const lineDelta = Math.max(0, player.lines - previousLines);
      const allowedDelta = Math.max(0, Math.min(12, lineDelta * 2 + 2));
      attackDelta = lineDelta > 0 ? Math.min(rawDelta, allowedDelta) : 0;
      player.attacksSent = previousAttacks + attackDelta;
    }

    return { room, attackDelta };
  }

  reportPlayerDefeat(
    roomCode: string,
    loserId: string,
    reason: MatchFinishReason,
  ): RoundResolution | null {
    const room = this.rooms.get(roomCode);
    if (!room || room.status !== "oyunda") {
      return null;
    }

    const loser = room.players.find((player) => player.userId === loserId);
    const winner = room.players.find((player) => player.userId !== loserId);

    if (!loser || !winner) {
      return null;
    }

    if (reason === "disconnect-timeout") {
      winner.roundWins = room.roundTarget;
    } else {
      winner.roundWins += 1;
    }

    room.roundHistory.push({
      round: room.currentRound,
      winnerId: winner.userId,
      reason,
      at: Date.now(),
    });
    room.lastRoundWinnerId = winner.userId;
    room.lastRoundReason = reason;
    loser.ready = false;

    const matchWinnerId =
      reason === "disconnect-timeout" || winner.roundWins >= room.roundTarget
        ? winner.userId
        : null;

    if (matchWinnerId) {
      room.status = "tamamlandi";
      room.winnerId = matchWinnerId;
      room.finishReason = reason;
      room.nextRoundAt = null;
    } else {
      room.status = "hazirlik";
      room.winnerId = null;
      room.finishReason = null;
      room.nextRoundAt = Date.now() + this.roundBreakMs;
    }

    return {
      roomCode: room.roomCode,
      roundWinnerId: winner.userId,
      matchWinnerId,
      reason,
      snapshot: this.getSnapshot(room.roomCode),
    };
  }

  disconnect(socketId: string) {
    this.quickQueue = this.quickQueue.filter((entry) => entry.socketId !== socketId);

    for (const room of this.rooms.values()) {
      const player = room.players.find((entry) => entry.socketId === socketId);
      if (!player) {
        continue;
      }

      player.connected = false;
      player.ready = false;
      player.disconnectDeadline = Date.now() + this.disconnectGraceMs;
      return room;
    }

    return null;
  }

  advanceScheduledRounds() {
    const started: Array<{ roomCode: string; snapshot: RoomSnapshot | null }> = [];

    for (const room of this.rooms.values()) {
      if (
        room.status !== "hazirlik" ||
        room.currentRound <= 0 ||
        room.winnerId ||
        !room.nextRoundAt ||
        room.nextRoundAt > Date.now() ||
        room.players.length !== 2 ||
        room.players.some((player) => !player.connected)
      ) {
        continue;
      }

      this.startRound(room, true);
      started.push({
        roomCode: room.roomCode,
        snapshot: this.getSnapshot(room.roomCode),
      });
    }

    return started;
  }

  getSnapshot(roomCode: string): RoomSnapshot | null {
    const room = this.rooms.get(roomCode);
    if (!room) {
      return null;
    }

    return {
      roomCode: room.roomCode,
      status: room.status,
      mode: "duello",
      bestOf: room.bestOf,
      currentRound: room.currentRound,
      roundTarget: room.roundTarget,
      roundHistory: room.roundHistory,
      lastRoundWinnerId: room.lastRoundWinnerId,
      lastRoundReason: room.lastRoundReason,
      nextRoundAt: room.nextRoundAt,
      winnerId: room.winnerId,
      finishReason: room.finishReason,
      players: room.players.map((player) => ({
        userId: player.userId,
        username: player.username,
        ready: player.ready,
        connected: player.connected,
        seat: player.seat,
        score: player.score,
        lines: player.lines,
        level: player.level,
        attacksSent: player.attacksSent,
        roundWins: player.roundWins,
        disconnectDeadline: player.disconnectDeadline,
      })),
    };
  }

  resolveExpiredDisconnects() {
    const expired: Array<{
      roomCode: string;
      winnerId: string | null;
      snapshot: RoomSnapshot | null;
    }> = [];

    for (const room of this.rooms.values()) {
      const disconnected = room.players.find(
        (player) => player.disconnectDeadline !== null && player.disconnectDeadline <= Date.now(),
      );

      if (!disconnected || room.status === "tamamlandi") {
        continue;
      }

      const resolution = this.reportPlayerDefeat(
        room.roomCode,
        disconnected.userId,
        "disconnect-timeout",
      );

      expired.push({
        roomCode: room.roomCode,
        winnerId: resolution?.matchWinnerId ?? resolution?.roundWinnerId ?? null,
        snapshot: this.getSnapshot(room.roomCode),
      });
    }

    return expired;
  }
}

export const roomManager = new RoomManager();
