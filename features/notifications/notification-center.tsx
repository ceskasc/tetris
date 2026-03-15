"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

type NotificationEntry = {
  id: string;
  baslik: string;
  icerik: string;
  tip: string;
  okundu: boolean;
  baglanti?: string | null;
  tarih: string;
};

export function NotificationCenter({
  initialNotifications,
}: {
  initialNotifications: NotificationEntry[];
}) {
  const [notifications, setNotifications] = useState(initialNotifications);

  async function markRead(id?: string, tumu = false) {
    const response = await fetch("/api/notifications", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        tumu,
      }),
    });

    if (!response.ok) {
      return;
    }

    setNotifications((current) =>
      current.map((entry) =>
        tumu || entry.id === id ? { ...entry, okundu: true } : entry,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted">
          Okunmamış: {notifications.filter((entry) => !entry.okundu).length}
        </p>
        <Button variant="ghost" onClick={() => markRead(undefined, true)}>
          Tümünü okundu yap
        </Button>
      </div>

      <div className="grid gap-4">
        {notifications.length ? (
          notifications.map((entry) => (
            <Panel key={entry.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-soft">
                    {entry.tip}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold">{entry.baslik}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted">{entry.icerik}</p>
                  <p className="mt-3 text-xs text-soft">
                    {new Intl.DateTimeFormat("tr-TR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    }).format(new Date(entry.tarih))}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted">
                    {entry.okundu ? "Okundu" : "Yeni"}
                  </span>
                  {!entry.okundu ? (
                    <Button variant="subtle" size="sm" onClick={() => markRead(entry.id)}>
                      Okundu işaretle
                    </Button>
                  ) : null}
                  {entry.baglanti ? (
                    <Link href={entry.baglanti}>
                      <Button variant="ghost" size="sm">
                        İlgili ekrana git
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </div>
            </Panel>
          ))
        ) : (
          <Panel className="p-6">
            <p className="text-sm text-muted">
              Henüz yeni bir bildirim yok. Yeni görevler, açılımlar ve yarışma akışları burada toplanacak.
            </p>
          </Panel>
        )}
      </div>
    </div>
  );
}
