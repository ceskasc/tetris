export type RoomStatus = "bekleniyor" | "hazirlik" | "oyunda" | "tamamlandi";

export type MatchFinishReason = "top-out" | "disconnect-timeout";

export interface RoomPlayerSnapshot {
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
  disconnectDeadline?: number | null;
}

export interface RoomRoundSnapshot {
  round: number;
  winnerId: string;
  reason: MatchFinishReason;
  at: number;
}

export interface RoomSnapshot {
  roomCode: string;
  status: RoomStatus;
  mode: "duello";
  bestOf: number;
  currentRound: number;
  roundTarget: number;
  players: RoomPlayerSnapshot[];
  roundHistory: RoomRoundSnapshot[];
  lastRoundWinnerId?: string | null;
  lastRoundReason?: MatchFinishReason | null;
  nextRoundAt?: number | null;
  winnerId?: string | null;
  finishReason?: MatchFinishReason | null;
}
