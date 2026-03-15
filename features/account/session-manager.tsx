"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

type SessionEntry = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  lastSeenAt: string;
  current: boolean;
};

export function SessionManager({
  initialSessions,
}: {
  initialSessions: SessionEntry[];
}) {
  const [sessions, setSessions] = useState(initialSessions);
  const [status, setStatus] = useState("");

  async function revoke(sessionId?: string, digerleri = false) {
    setStatus("Oturumlar güncelleniyor...");
    const response = await fetch("/api/account/sessions", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId,
        digerleri,
      }),
    });
    const data = await response.json();
    setStatus(data.mesaj ?? data.hata ?? "Bir işlem oluştu.");

    if (!response.ok) {
      return;
    }

    setSessions((current) =>
      digerleri
        ? current.filter((entry) => entry.current)
        : current.filter((entry) => entry.id !== sessionId),
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{status}</p>
        <Button variant="ghost" onClick={() => revoke(undefined, true)}>
          Diğer cihazları kapat
        </Button>
      </div>

      <div className="grid gap-3">
        {sessions.map((session) => (
          <Panel key={session.id} compactAmbient className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm text-muted">
                <p>{session.userAgent ?? "Bilinmeyen cihaz"}</p>
                <p className="text-soft">{session.ipAddress ?? "IP gizli"}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-sm text-muted">
                  <p>{session.current ? "Bu cihaz" : "Yakın geçmiş"}</p>
                  <p className="text-soft">
                    {new Intl.DateTimeFormat("tr-TR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(session.lastSeenAt))}
                  </p>
                </div>
                {!session.current ? (
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => revoke(session.id, false)}
                  >
                    Kapat
                  </Button>
                ) : null}
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
