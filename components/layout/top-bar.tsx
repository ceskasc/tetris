"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Bell, Flame, Swords } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { routes } from "@/constants/routes";

type TopBarState = {
  unreadCount: number;
  dailyStreak: number;
};

export function TopBar() {
  const [state, setState] = useState<TopBarState>({
    unreadCount: 0,
    dailyStreak: 0,
  });

  useEffect(() => {
    let cancelled = false;

    void fetch("/api/top-bar")
      .then((response) => response.json())
      .then((data) => {
        if (cancelled) {
          return;
        }

        setState({
          unreadCount: data.okunmamisBildirim ?? 0,
          dailyStreak: data.gunlukSeri ?? 0,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setState({
            unreadCount: 0,
            dailyStreak: 0,
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Panel compactAmbient className="mb-6 flex items-center justify-between gap-4 p-4">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-soft">Premium Oyun Merkezi</p>
        <h1 className="font-display text-3xl">Bu akşamın ritmi seninle şekilleniyor.</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 md:flex">
          <Flame className="h-4 w-4 text-[var(--warning)]" />
          <span className="text-sm text-muted">{state.dailyStreak} günlük seri</span>
        </div>
        <Link href={routes.online}>
          <Button variant="ghost">
            <Swords className="h-4 w-4" />
            Online maç
          </Button>
        </Link>
        <Link
          href={routes.notifications}
          className="relative rounded-full border border-white/10 bg-white/6 p-3 text-[var(--text)]"
        >
          <Bell className="h-4 w-4" />
          {state.unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[var(--secondary)] px-1.5 py-0.5 text-center text-[10px] font-semibold text-white">
              {state.unreadCount > 9 ? "9+" : state.unreadCount}
            </span>
          ) : null}
        </Link>
      </div>
    </Panel>
  );
}
