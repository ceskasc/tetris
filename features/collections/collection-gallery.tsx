"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

type Entry = {
  id: string;
  ad: string;
  aciklama: string;
  rarity: string;
  kategori: string;
  palette: string[];
  sahip: boolean;
  secili: boolean;
  yeni: boolean;
  favori: boolean;
};

export function CollectionGallery({ initialEntries }: { initialEntries: Entry[] }) {
  const [entries, setEntries] = useState(initialEntries);

  async function update(cosmeticId: string, action: "equip" | "favorite" | "mark-seen") {
    const response = await fetch("/api/collections", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cosmeticId, action }),
    });

    if (!response.ok) {
      return;
    }

    setEntries((current) =>
      current.map((entry) => {
        if (entry.id !== cosmeticId && action === "equip" && entry.kategori === current.find((candidate) => candidate.id === cosmeticId)?.kategori) {
          return { ...entry, secili: false };
        }
        if (entry.id !== cosmeticId) {
          return entry;
        }
        if (action === "equip") {
          return { ...entry, secili: true, yeni: false };
        }
        if (action === "favorite") {
          return { ...entry, favori: !entry.favori };
        }
        return { ...entry, yeni: false };
      }),
    );
  }

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {entries.map((entry) => (
        <Panel key={entry.id} className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-soft">
                {entry.kategori}
              </p>
              <h3 className="mt-3 text-2xl font-semibold">{entry.ad}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{entry.aciklama}</p>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted">
              {entry.rarity}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            {entry.palette.map((color) => (
              <span
                key={color}
                className="h-10 w-10 rounded-full border border-white/10"
                style={{ background: color }}
              />
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              variant={entry.secili ? "primary" : "subtle"}
              onClick={() => update(entry.id, "equip")}
              disabled={!entry.sahip}
            >
              {entry.secili ? "Seçili" : "Kuşan"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => update(entry.id, "favorite")}
              disabled={!entry.sahip}
            >
              {entry.favori ? "Favoriden çıkar" : "Favorile"}
            </Button>
            {entry.yeni ? (
              <Button variant="subtle" onClick={() => update(entry.id, "mark-seen")}>
                Yeni işaretini kaldır
              </Button>
            ) : null}
          </div>
        </Panel>
      ))}
    </div>
  );
}
