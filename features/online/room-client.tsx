"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { io, type Socket } from "socket.io-client";

import { GameExperience } from "@/components/game/game-experience";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import type { MatchFinishReason, RoomSnapshot } from "@/multiplayer/protocol";
import { useGameStore } from "@/store/game-store";

const ROOM_STORAGE_KEY = "lunara-active-room";

type MatchResultState = {
  winnerId: string | null;
  reason?: MatchFinishReason;
} | null;

function createDuelSummary(outcome: "galibiyet" | "maglubiyet") {
  const current = useGameStore.getState().state;

  if (!current) {
    return {
      mod: "duello" as const,
      skor: 0,
      satir: 0,
      sureMs: 0,
      comboEnYuksek: 0,
      level: 1,
      perfectClear: 0,
      backToBack: 0,
      kazanilanXp: 0,
      hatalar: 0,
      sonuc: outcome,
    };
  }

  return {
    mod: "duello" as const,
    skor: current.score,
    satir: current.lines,
    sureMs: current.elapsedMs,
    comboEnYuksek: current.stats.comboMax,
    level: current.level,
    perfectClear: current.stats.perfectClears,
    backToBack: current.stats.backToBackCount,
    kazanilanXp: 0,
    hatalar: current.stats.mistakes,
    sonuc: outcome,
  };
}

export function RoomClient({
  token,
  roomCode,
  userId,
}: {
  token: string;
  roomCode: string;
  userId: string;
}) {
  const socket = useMemo<Socket>(
    () =>
      io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001", {
        autoConnect: false,
        auth: { token },
      }),
    [token],
  );
  const [snapshot, setSnapshot] = useState<RoomSnapshot | null>(null);
  const [message, setMessage] = useState("Odaya bağlanılıyor...");
  const [launchIndex, setLaunchIndex] = useState(0);
  const [result, setResult] = useState<MatchResultState>(null);
  const [disconnectCountdown, setDisconnectCountdown] = useState<number | null>(null);
  const [nextRoundCountdown, setNextRoundCountdown] = useState<number | null>(null);
  const [roundMessage, setRoundMessage] = useState<string | null>(null);
  const reportedRoundFinish = useRef(false);
  const persistedOutcome = useRef(false);
  const snapshotRef = useRef<RoomSnapshot | null>(null);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    async function persistFinalOutcome(
      winnerId: string | null,
      reason?: MatchFinishReason,
      finalSnapshot?: RoomSnapshot | null,
    ) {
      if (!winnerId || persistedOutcome.current) {
        return;
      }

      persistedOutcome.current = true;
      const outcome = winnerId === userId ? "galibiyet" : "maglubiyet";
      const roundWins = Object.fromEntries(
        (finalSnapshot?.players ?? snapshotRef.current?.players ?? []).map((player) => [
          player.userId,
          player.roundWins,
        ]),
      );

      await Promise.allSettled([
        fetch("/api/online/match", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomCode,
            winnerId,
            sonuc: outcome,
            reason,
            roundWins,
          }),
        }),
        fetch("/api/progression/oturum", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(createDuelSummary(outcome)),
        }),
      ]);
    }

    socket.connect();
    window.localStorage.setItem(ROOM_STORAGE_KEY, roomCode);

    socket.on("connect", () => {
      socket.emit("room:join", { roomCode });
      setMessage("Oda bağlantısı kuruldu.");
    });
    socket.on("disconnect", () => {
      setMessage("Bağlantı koptu. 60 saniyelik yeniden bağlanma koruması aktif.");
    });
    socket.on("connect_error", () => {
      setMessage("Odaya yeniden bağlanılıyor...");
    });
    socket.on("room:update", (payload: RoomSnapshot) => {
      setSnapshot(payload);

      const disconnectedRival = payload.players.find(
        (player) =>
          player.userId !== userId &&
          !player.connected &&
          typeof player.disconnectDeadline === "number",
      );

      if (disconnectedRival?.disconnectDeadline) {
        setDisconnectCountdown(
          Math.max(0, Math.ceil((disconnectedRival.disconnectDeadline - Date.now()) / 1000)),
        );
      } else {
        setDisconnectCountdown(null);
      }

      if (payload.nextRoundAt && !payload.winnerId) {
        setNextRoundCountdown(Math.max(0, Math.ceil((payload.nextRoundAt - Date.now()) / 1000)));
      } else {
        setNextRoundCountdown(null);
      }

      if (payload.status === "hazirlik" && payload.currentRound === 0) {
        setMessage("Rakip ile hazırlık tamamlandığında set başlayacak.");
      }
    });
    socket.on("match:start", ({ round }: { round: number }) => {
      setMessage(round === 1 ? "Maç başladı. Akış canlı." : `${round}. raund başlıyor.`);
      setRoundMessage(null);
      setLaunchIndex((current) => current + 1);
      reportedRoundFinish.current = false;
    });
    socket.on("match:incoming-garbage", ({ lines }: { lines: number }) => {
      useGameStore.getState().addGarbage(lines);
    });
    socket.on(
      "match:round-finished",
      ({
        round,
        roundWinnerId,
        matchWinnerId,
        reason,
        nextRoundAt,
      }: {
        round: number;
        roundWinnerId: string | null;
        matchWinnerId: string | null;
        reason: MatchFinishReason;
        nextRoundAt: number | null;
      }) => {
        const currentState = useGameStore.getState().state;
        if (currentState?.status === "running") {
          useGameStore.getState().pause();
        }
        reportedRoundFinish.current = true;
        setRoundMessage(
          matchWinnerId
            ? null
            : roundWinnerId === userId
              ? `${round}. raund senin. Yeni raund birazdan başlıyor.`
              : `${round}. raund rakibe gitti. Nefes al, set devam ediyor.`,
        );
        if (nextRoundAt) {
          setNextRoundCountdown(Math.max(0, Math.ceil((nextRoundAt - Date.now()) / 1000)));
        }
        if (!matchWinnerId) {
          setMessage("Set skoru güncellendi.");
        }
        if (reason === "disconnect-timeout") {
          setMessage("Rakip süre içinde dönmedi. Set sonucu kesinleşti.");
        }
      },
    );
    socket.on(
      "match:finished",
      async ({
        winnerId,
        reason,
        snapshot: finalSnapshot,
      }: {
        winnerId: string | null;
        reason?: MatchFinishReason;
        snapshot?: RoomSnapshot | null;
      }) => {
        setResult({ winnerId, reason });
        setRoundMessage(null);
        setMessage(
          winnerId === userId
            ? "Seti kazandın."
            : reason === "disconnect-timeout"
              ? "Rakip yeniden bağlanamadı. Sonuç hesabına işleniyor."
              : "Set tamamlandı.",
        );
        window.localStorage.removeItem(ROOM_STORAGE_KEY);
        const currentState = useGameStore.getState().state;
        if (currentState?.status === "running") {
          useGameStore.getState().pause();
        }
        await persistFinalOutcome(winnerId, reason, finalSnapshot);
      },
    );
    socket.on("room:error", ({ message: error }) => setMessage(error));

    return () => {
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, [roomCode, socket, userId]);

  useEffect(() => {
    if (disconnectCountdown === null) {
      return;
    }

    const timer = window.setInterval(() => {
      setDisconnectCountdown((current) => {
        if (current === null || current <= 1) {
          return null;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [disconnectCountdown]);

  useEffect(() => {
    if (nextRoundCountdown === null) {
      return;
    }

    const timer = window.setInterval(() => {
      setNextRoundCountdown((current) => {
        if (current === null || current <= 1) {
          return null;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [nextRoundCountdown]);

  return (
    <div className="space-y-6">
      <Panel className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-soft">Canlı oda</p>
            <h2 className="mt-2 font-display text-4xl">{roomCode}</h2>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{snapshot ? `En iyi ${snapshot.bestOf}` : "En iyi 3"}</Badge>
            <Button variant="ghost" onClick={() => socket.emit("room:ready", { roomCode })}>
              Hazır durumunu değiştir
            </Button>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted">{message}</p>
        {roundMessage ? (
          <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-muted">
            {roundMessage}
          </div>
        ) : null}
        {result ? (
          <div className="mt-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm text-muted">
            {result.winnerId === userId
              ? "Sonuç: galibiyet"
              : result.winnerId
                ? "Sonuç: mağlubiyet"
                : "Sonuç doğrulanıyor"}
          </div>
        ) : null}
        {disconnectCountdown !== null ? (
          <div className="mt-4 rounded-[1.5rem] border border-[rgba(255,201,150,0.2)] bg-[rgba(255,201,150,0.08)] p-4 text-sm text-[var(--warning)]">
            Rakip bağlantısı koptu. Yeniden bağlanma için kalan süre: {disconnectCountdown} sn
          </div>
        ) : null}
        {nextRoundCountdown !== null && !result ? (
          <div className="mt-4 rounded-[1.5rem] border border-[rgba(167,139,250,0.25)] bg-[rgba(167,139,250,0.1)] p-4 text-sm text-[var(--secondary)]">
            Sonraki raund {nextRoundCountdown} sn içinde başlayacak.
          </div>
        ) : null}
      </Panel>

      <div className="grid gap-4 xl:grid-cols-2">
        {snapshot?.players.map((player) => (
          <Panel key={player.userId} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-soft">
                  Koltuk {player.seat}
                </p>
                <h3 className="mt-3 text-2xl font-semibold">{player.username}</h3>
              </div>
              <Badge tone={player.userId === userId ? "success" : "default"}>
                {player.roundWins}/{snapshot?.roundTarget ?? 2}
              </Badge>
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted">
              <p>Hazır: {player.ready ? "Evet" : "Hayır"}</p>
              <p>Bağlantı: {player.connected ? "Aktif" : "Koptu"}</p>
              <p>Raund skoru: {player.roundWins}</p>
              <p>Canlı skor: {player.score}</p>
              <p>Satır: {player.lines}</p>
            </div>
          </Panel>
        ))}
      </div>

      <GameExperience
        mode="duello"
        baslik="Canlı Düello"
        aciklama="Set skoru, garbage akışı ve canlı rakip takibi ile gerçek 1v1 sahne."
        autoStart={false}
        launchIndex={launchIndex}
        persistSession={false}
        onLiveState={(payload) =>
          socket.emit("match:state", {
            roomCode,
            ...payload,
          })
        }
        onSessionComplete={() => {
          if (reportedRoundFinish.current || result) {
            return;
          }
          reportedRoundFinish.current = true;
          socket.emit("match:finish", {
            roomCode,
          });
        }}
      />
    </div>
  );
}
