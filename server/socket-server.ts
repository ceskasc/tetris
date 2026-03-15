import { createServer } from "node:http";

import { Server } from "socket.io";

import { verifySocketToken } from "@/multiplayer/token";
import type { RoomSnapshot } from "@/multiplayer/protocol";
import { getAllowedOrigins, getServerEnv } from "@/server/env";
import { roomManager } from "@/server/matchmaking/room-manager";
import { ensureOnlineMatchRecord } from "@/server/online-match-store";

const env = getServerEnv();
const port = env.SOCKET_PORT;
const allowedOrigins = getAllowedOrigins();
const pendingRoomSyncs = new Map<
  string,
  {
    snapshot: RoomSnapshot;
    source: string;
    timer: NodeJS.Timeout;
  }
>();

const httpServer = createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        durum: "hazır",
        servis: "socket",
        zaman: new Date().toISOString(),
        originler: allowedOrigins,
      }),
    );
    return;
  }

  response.writeHead(404, { "Content-Type": "application/json" });
  response.end(JSON.stringify({ hata: "Bulunamadı." }));
});

const io = new Server(httpServer, {
  cors: {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Bu origin için socket erişimi kapalı."), false);
    },
    credentials: true,
  },
});

function broadcastRoom(roomCode: string) {
  const snapshot = roomManager.getSnapshot(roomCode);
  if (!snapshot) {
    return null;
  }

  io.to(roomCode).emit("room:update", snapshot);
  return snapshot;
}

async function syncRoomSnapshot(snapshot: RoomSnapshot | null, source: string) {
  if (!snapshot) {
    return;
  }

  try {
    await ensureOnlineMatchRecord(snapshot, source);
  } catch (error) {
    console.error("Canlı maç kaydı senkronize edilemedi:", error);
  }
}

function scheduleRoomSnapshotSync(
  snapshot: RoomSnapshot | null,
  source: string,
  delayMs = 1_500,
) {
  if (!snapshot) {
    return;
  }

  const existing = pendingRoomSyncs.get(snapshot.roomCode);
  if (existing) {
    clearTimeout(existing.timer);
  }

  const timer = setTimeout(() => {
    pendingRoomSyncs.delete(snapshot.roomCode);
    void syncRoomSnapshot(snapshot, source);
  }, delayMs);

  pendingRoomSyncs.set(snapshot.roomCode, {
    snapshot,
    source,
    timer,
  });
}

io.use((socket, next) => {
  const token = socket.handshake.auth.token as string | undefined;
  if (!token) {
    next(new Error("Yetkisiz bağlantı"));
    return;
  }

  const payload = verifySocketToken(token);
  if (!payload) {
    next(new Error("Geçersiz oturum"));
    return;
  }

  socket.data.user = payload;
  next();
});

io.on("connection", (socket) => {
  const user = socket.data.user as { userId: string; username: string };

  socket.on("queue:quick", async () => {
    const result = roomManager.queueForQuickMatch({
      socketId: socket.id,
      userId: user.userId,
      username: user.username,
    });

    if (result.waiting) {
      socket.emit("queue:waiting");
      return;
    }

    if (result.roomCode && result.socketIds) {
      for (const socketId of result.socketIds) {
        const peer = io.sockets.sockets.get(socketId);
        peer?.join(result.roomCode);
        peer?.emit("queue:matched", { roomCode: result.roomCode });
      }

      const snapshot = broadcastRoom(result.roomCode);
      await syncRoomSnapshot(snapshot ?? result.snapshot ?? null, "hizli-eslesme");
    }
  });

  socket.on("room:join", async ({ roomCode }: { roomCode: string }) => {
    const room = roomManager.joinRoom(roomCode, {
      socketId: socket.id,
      userId: user.userId,
      username: user.username,
    });

    if (!room) {
      socket.emit("room:error", { message: "Odaya katılım başarısız oldu." });
      return;
    }

    socket.join(roomCode);
      const snapshot = broadcastRoom(roomCode);
      await syncRoomSnapshot(snapshot, "oda-katilim");
  });

  socket.on("room:ready", async ({ roomCode }: { roomCode: string }) => {
    const room = roomManager.toggleReady(roomCode, user.userId);
    if (!room) {
      return;
    }

      const snapshot = broadcastRoom(roomCode);
      await syncRoomSnapshot(snapshot, "hazirlik");

    if (room.status === "oyunda") {
      io.to(roomCode).emit("match:start", {
        roomCode,
        round: snapshot?.currentRound ?? 1,
        startedAt: new Date().toISOString(),
      });
    }
  });

  socket.on(
    "match:state",
    async ({
      roomCode,
      score,
      lines,
      level,
      attacksSent,
    }: {
      roomCode: string;
      score: number;
      lines: number;
      level: number;
      attacksSent: number;
    }) => {
      const update = roomManager.updatePlayerState(roomCode, user.userId, {
        score,
        lines,
        level,
        attacksSent,
      });
      if (!update) {
        return;
      }

      if (update.attackDelta > 0) {
        socket.to(roomCode).emit("match:incoming-garbage", {
          lines: update.attackDelta,
        });
      }

      const snapshot = broadcastRoom(roomCode);
      scheduleRoomSnapshotSync(
        snapshot,
        update.attackDelta > 0 ? "durum-senkron-garbage" : "durum-senkron",
      );
    },
  );

  socket.on("match:finish", async ({ roomCode }: { roomCode: string }) => {
    const resolution = roomManager.reportPlayerDefeat(roomCode, user.userId, "top-out");
    if (!resolution) {
      return;
    }

    io.to(roomCode).emit("match:round-finished", {
      roomCode,
      round: resolution.snapshot?.currentRound ?? 1,
      roundWinnerId: resolution.roundWinnerId,
      matchWinnerId: resolution.matchWinnerId,
      reason: resolution.reason,
      nextRoundAt: resolution.snapshot?.nextRoundAt ?? null,
    });

    const snapshot = broadcastRoom(roomCode) ?? resolution.snapshot;
    await syncRoomSnapshot(snapshot, "round-sonucu");

    if (resolution.matchWinnerId) {
      io.to(roomCode).emit("match:finished", {
        roomCode,
        winnerId: resolution.matchWinnerId,
        reason: resolution.reason,
        snapshot,
      });
    }
  });

  socket.on("disconnect", () => {
    const room = roomManager.disconnect(socket.id);
    if (!room) {
      return;
    }

    void syncRoomSnapshot(broadcastRoom(room.roomCode), "baglanti-koptu");
  });
});

setInterval(() => {
  const expiredRooms = roomManager.resolveExpiredDisconnects();
  for (const room of expiredRooms) {
    io.to(room.roomCode).emit("match:round-finished", {
      roomCode: room.roomCode,
      round: room.snapshot?.currentRound ?? 1,
      roundWinnerId: room.winnerId,
      matchWinnerId: room.snapshot?.winnerId ?? room.winnerId,
      reason: "disconnect-timeout",
      nextRoundAt: null,
    });
    io.to(room.roomCode).emit("match:finished", {
      roomCode: room.roomCode,
      winnerId: room.winnerId,
      reason: "disconnect-timeout",
      snapshot: room.snapshot,
    });
    void syncRoomSnapshot(broadcastRoom(room.roomCode), "baglanti-timeout");
  }

  const startedRooms = roomManager.advanceScheduledRounds();
  for (const room of startedRooms) {
    const snapshot = broadcastRoom(room.roomCode) ?? room.snapshot;
    void syncRoomSnapshot(snapshot, "round-baslangici");
    io.to(room.roomCode).emit("match:start", {
      roomCode: room.roomCode,
      round: snapshot?.currentRound ?? 1,
      startedAt: new Date().toISOString(),
    });
  }
}, 1_000);

httpServer.listen(port, () => {
  console.info(`Lunara socket sunucusu ${port} portunda hazır.`);
});
