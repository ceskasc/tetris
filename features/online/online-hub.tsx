"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";

const ROOM_STORAGE_KEY = "lunara-active-room";

export function OnlineHub({
  token,
}: {
  token: string;
}) {
  const router = useRouter();
  const socket = useMemo<Socket>(
    () =>
      io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001", {
        autoConnect: false,
        auth: {
          token,
        },
      }),
    [token],
  );
  const [status, setStatus] = useState("Bağlantı hazırlanıyor...");
  const [roomCode, setRoomCode] = useState("");
  const [resumeCode] = useState(
    () => (typeof window !== "undefined" && window.localStorage.getItem(ROOM_STORAGE_KEY)) || "",
  );

  useEffect(() => {
    socket.connect();

    socket.on("connect", () => setStatus("Canlı eşleşme sunucusuna bağlı."));
    socket.on("queue:waiting", () => setStatus("Rakip aranıyor..."));
    socket.on("queue:matched", ({ roomCode: matchedCode }) => {
      window.localStorage.setItem(ROOM_STORAGE_KEY, matchedCode);
      router.push(`/online/oda/${matchedCode}`);
    });
    socket.on("disconnect", () => setStatus("Bağlantı koptu, yeniden kuruluyor..."));
    socket.on("connect_error", () =>
      setStatus("Sunucuya erişilemiyor. Birkaç saniye içinde yeniden denenecek."),
    );
    socket.on("room:error", ({ message }) => setStatus(message));

    return () => {
      socket.disconnect();
      socket.removeAllListeners();
    };
  }, [router, socket]);

  async function createRoom() {
    const response = await fetch("/api/online/room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enIyiKac: 3 }),
    });
    const data = await response.json();
    if (response.ok) {
      window.localStorage.setItem(ROOM_STORAGE_KEY, data.odaKodu);
      router.push(`/online/oda/${data.odaKodu}`);
      return;
    }
    setStatus(data.hata ?? "Oda oluşturulamadı.");
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Panel className="p-6">
        <h2 className="font-display text-4xl">Hızlı eşleşme</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Canlı kuyruğa gir, uygun rakip bulunduğunda doğrudan hazır odasına geç.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => socket.emit("queue:quick")}>Hızlı maç bul</Button>
          <Button variant="ghost" onClick={createRoom}>
            Özel oda oluştur
          </Button>
        </div>
        <p className="mt-4 text-sm text-muted">{status}</p>
      </Panel>

      <Panel className="p-6">
        <h2 className="font-display text-4xl">Oda kodu ile katıl</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Arkadaş daveti ya da özel prova seansı için mevcut oda kodunu gir.
        </p>
        <div className="mt-6 flex gap-3">
          <Input
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase())}
            placeholder="Örn. A7K9Q2"
          />
          <Button
            variant="ghost"
            onClick={() => router.push(`/online/oda/${roomCode}`)}
            disabled={roomCode.length < 4}
          >
            Katıl
          </Button>
        </div>
        {resumeCode ? (
          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-muted">
              Son aktif odan: <span className="font-semibold text-[var(--text)]">{resumeCode}</span>
            </p>
            <Button
              className="mt-3"
              variant="subtle"
              onClick={() => router.push(`/online/oda/${resumeCode}`)}
            >
              Odaya geri dön
            </Button>
          </div>
        ) : null}
      </Panel>
    </div>
  );
}
