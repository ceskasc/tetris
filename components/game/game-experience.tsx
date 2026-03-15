"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { motion } from "framer-motion";
import { Pause, Play, Shield, Sparkles } from "lucide-react";

import { playGameCue } from "@/audio/synth";
import { MobileControls } from "@/components/game/mobile-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { ProgressBar } from "@/components/ui/progress-bar";
import { getBoardWithActivePiece } from "@/game-engine/engine";
import { pieceColors } from "@/game-engine/pieces";
import { useGameStore } from "@/store/game-store";
import { useSettingsStore } from "@/store/settings-store";
import type { GameModeId, GameSessionSummary } from "@/types";
import { formatDuration, formatNumber } from "@/utils/format";

function useGameRuntime() {
  const step = useGameStore((state) => state.step);
  const gameState = useGameStore((state) => state.state);

  useEffect(() => {
    if (!gameState || gameState.status === "over") {
      return;
    }

    let frameId = 0;
    let last = performance.now();

    const loop = (now: number) => {
      const delta = now - last;
      last = now;
      step(delta);
      frameId = window.requestAnimationFrame(loop);
    };

    frameId = window.requestAnimationFrame(loop);
    return () => window.cancelAnimationFrame(frameId);
  }, [gameState, step]);
}

export function GameExperience({
  mode,
  baslik,
  aciklama,
  autoStart = true,
  launchIndex = 0,
  persistSession = true,
  onLiveState,
  onSessionComplete,
}: {
  mode: GameModeId;
  baslik: string;
  aciklama: string;
  autoStart?: boolean;
  launchIndex?: number;
  persistSession?: boolean;
  onLiveState?: (payload: {
    score: number;
    lines: number;
    level: number;
    attacksSent: number;
  }) => void;
  onSessionComplete?: (summary: GameSessionSummary) => void;
}) {
  const start = useGameStore((state) => state.start);
  const state = useGameStore((store) => store.state);
  const sessionSummary = useGameStore((store) => store.sessionSummary);
  const lastEvents = useGameStore((store) => store.lastEvents);
  const left = useGameStore((store) => store.left);
  const right = useGameStore((store) => store.right);
  const softDrop = useGameStore((store) => store.softDrop);
  const hardDrop = useGameStore((store) => store.hardDrop);
  const rotateCw = useGameStore((store) => store.rotateCw);
  const rotateCcw = useGameStore((store) => store.rotateCcw);
  const hold = useGameStore((store) => store.hold);
  const pause = useGameStore((store) => store.pause);
  const bindings = useSettingsStore((store) => store.tusAtamalari);
  const [saved, setSaved] = useState(false);
  const sentSummary = useRef(false);

  useGameRuntime();

  useEffect(() => {
    if (!autoStart && launchIndex === 0) {
      return;
    }

    start(mode);
    sentSummary.current = false;
    setSaved(false);
  }, [autoStart, launchIndex, mode, start]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      switch (event.code) {
        case bindings.sola:
          event.preventDefault();
          left();
          break;
        case bindings.saga:
          event.preventDefault();
          right();
          break;
        case bindings.yumusakBirak:
          event.preventDefault();
          softDrop();
          break;
        case bindings.sertBirak:
          event.preventDefault();
          hardDrop();
          break;
        case bindings.saatYonunde:
          event.preventDefault();
          rotateCw();
          break;
        case bindings.tersYon:
          event.preventDefault();
          rotateCcw();
          break;
        case bindings.beklet:
          event.preventDefault();
          hold();
          break;
        case bindings.duraklat:
          event.preventDefault();
          pause();
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [bindings, hardDrop, hold, left, pause, right, rotateCcw, rotateCw, softDrop]);

  useEffect(() => {
    if (!lastEvents.length) {
      return;
    }

    if (lastEvents.includes("kilitlendi")) {
      playGameCue("drop");
    }
    if (state?.clearedLastTurn) {
      playGameCue(state.clearedLastTurn > 1 ? "combo" : "clear");
    }
  }, [lastEvents, state?.clearedLastTurn]);

  useEffect(() => {
    if (!sessionSummary || sentSummary.current) {
      return;
    }

    sentSummary.current = true;
    onSessionComplete?.(sessionSummary);

    if (!persistSession) {
      return;
    }

    void fetch("/api/progression/oturum", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionSummary),
    })
      .then(() => setSaved(true))
      .catch(() => setSaved(false));
  }, [onSessionComplete, persistSession, sessionSummary]);

  useEffect(() => {
    if (!state) {
      return;
    }

    onLiveState?.({
      score: state.score,
      lines: state.lines,
      level: state.level,
      attacksSent: state.stats.attacksSent,
    });
  }, [onLiveState, state]);

  const board = useMemo(() => (state ? getBoardWithActivePiece(state) : []), [state]);
  const progress = state ? ((state.lines % 10) / 10) * 100 : 0;
  const sessionStateLabel = persistSession
    ? saved
      ? "İşlendi"
      : "Gönderiliyor"
    : "Çevrim içi sonuç bekleniyor";

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_340px]">
      <Panel className="p-5">
        <div className="space-y-6">
          <div>
            <Badge>Seans Notu</Badge>
            <h2 className="mt-4 font-display text-4xl">{baslik}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{aciklama}</p>
          </div>

          <div className="grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-soft">Skor</p>
              <p className="mt-2 font-display text-4xl">{formatNumber(state?.score ?? 0)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-soft">Satır</p>
                <p className="mt-2 text-2xl font-semibold">{state?.lines ?? 0}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-soft">Seviye</p>
                <p className="mt-2 text-2xl font-semibold">{state?.level ?? 1}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.24em] text-soft">
                  Seviye ilerlemesi
                </span>
                <span className="text-xs text-muted">%{Math.round(progress)}</span>
              </div>
              <ProgressBar value={progress} />
            </div>
          </div>

          <div className="grid gap-3 text-sm text-muted">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span>Süre</span>
              <span>{formatDuration(state?.elapsedMs ?? 0)}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span>En iyi combo</span>
              <span>{state?.stats.comboMax ?? 0}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span>Back-to-back</span>
              <span>{state?.stats.backToBackCount ?? 0}</span>
            </div>
          </div>
        </div>
      </Panel>

      <Panel strong className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge tone={state?.status === "paused" ? "warning" : "success"}>
              {state?.status === "paused" ? "Duraklatıldı" : "Canlı seans"}
            </Badge>
            <Badge>{mode}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={pause}>
              {state?.status === "paused" ? (
                <Play className="h-4 w-4" />
              ) : (
                <Pause className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => start(mode)}>
              Yeniden
            </Button>
          </div>
        </div>

        <div className="relative mx-auto flex max-w-[420px] flex-col gap-4">
          <div className="relative mx-auto aspect-[10/20] w-full max-w-[420px] overflow-hidden rounded-[2rem] border border-white/12 bg-[rgba(9,10,20,0.8)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="grid h-full grid-cols-10 gap-[4px]">
              {board.flatMap((row, rowIndex) =>
                row.map((cell, columnIndex) => {
                  const tone =
                    cell === "garbage"
                      ? "rgba(255,255,255,0.16)"
                      : cell
                        ? pieceColors[cell]
                        : "rgba(255,255,255,0.035)";

                  return (
                    <motion.div
                      key={`${rowIndex}-${columnIndex}`}
                      layout
                      className="rounded-[0.55rem] border border-white/6"
                      style={{
                        background: tone,
                        boxShadow: cell && cell !== "garbage" ? `0 0 18px ${tone}` : "none",
                      }}
                    />
                  );
                }),
              )}
            </div>

            {state?.status === "over" && (
              <div className="absolute inset-0 flex items-center justify-center bg-[rgba(8,10,18,0.82)] p-6">
                <div className="w-full max-w-sm rounded-[2rem] border border-white/12 bg-[rgba(16,18,32,0.94)] p-6 text-center shadow-glow">
                  <Sparkles className="mx-auto h-8 w-8 text-[var(--secondary)]" />
                  <h3 className="mt-4 font-display text-4xl">Seans tamamlandı</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">
                    {state.gameOverReason === "sprint-finished"
                      ? "Sprint hedefini tamamladın. Şimdi sonucu hesabına işliyoruz."
                      : "Tahta doldu, ama akış hâlâ sende. İstersen aynı sıcak ritimle hemen yeniden başlayabilirsin."}
                  </p>
                  <div className="mt-5 grid grid-cols-2 gap-3 text-left text-sm">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-soft">Skor</p>
                      <p className="mt-2 text-lg font-semibold">{formatNumber(state.score)}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <p className="text-soft">Sonuç kaydı</p>
                      <p className="mt-2 text-lg font-semibold">{sessionStateLabel}</p>
                    </div>
                  </div>
                  <Button className="mt-5 w-full" onClick={() => start(mode)}>
                    Yeniden başlat
                  </Button>
                </div>
              </div>
            )}
          </div>

          <MobileControls
            onLeft={left}
            onRight={right}
            onDown={softDrop}
            onRotateLeft={rotateCcw}
            onRotateRight={rotateCw}
            onHold={hold}
            onPause={pause}
          />
        </div>
      </Panel>

      <div className="space-y-6">
        <Panel className="p-5">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[var(--tertiary)]" />
            <p className="text-xs uppercase tracking-[0.28em] text-soft">Sıradaki parçalar</p>
          </div>
          <div className="mt-4 grid gap-3">
            {state?.nextQueue.slice(0, 5).map((piece, index) => (
              <div
                key={`${piece}-${index}`}
                className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{piece}</span>
                  <span
                    className="h-3 w-12 rounded-full"
                    style={{ background: pieceColors[piece] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-soft">Bekletilen parça</p>
          <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{state?.holdPiece ?? "Henüz yok"}</span>
              {state?.holdPiece && (
                <span
                  className="h-3 w-12 rounded-full"
                  style={{ background: pieceColors[state.holdPiece] }}
                />
              )}
            </div>
          </div>
        </Panel>

        <Panel className="p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-soft">Kontrol notları</p>
          <div className="mt-4 space-y-3 text-sm text-muted">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span>Döndür</span>
              <span>{bindings.saatYonunde}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span>Hold</span>
              <span>{bindings.beklet}</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              <span>Sert bırak</span>
              <span>{bindings.sertBirak}</span>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
