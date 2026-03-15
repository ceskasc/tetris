"use client";

import { create } from "zustand";

import { defaultSettings } from "@/data/showcase";
import { readJsonStorage, writeJsonStorage } from "@/utils/storage";
import type { UserSettingsSnapshot } from "@/types";

type SettingsStore = UserSettingsSnapshot & {
  hydrated: boolean;
  hydrate: () => void;
  patch: (payload: Partial<UserSettingsSnapshot>) => void;
};

const STORAGE_KEY = "lunara-settings";

export const useSettingsStore = create<SettingsStore>((set) => ({
  ...defaultSettings,
  hydrated: false,
  hydrate: () => {
    const saved = readJsonStorage<UserSettingsSnapshot>(STORAGE_KEY, defaultSettings);
    set({
      ...saved,
      hydrated: true,
    });
  },
  patch: (payload) => {
    const next = {
      ...useSettingsStore.getState(),
      ...payload,
    };

    writeJsonStorage(STORAGE_KEY, {
      temaModu: next.temaModu,
      temaPaketi: next.temaPaketi,
      azaltIlkHareket: next.azaltIlkHareket,
      yuksekKontrast: next.yuksekKontrast,
      grafikYogunlugu: next.grafikYogunlugu,
      anaSes: next.anaSes,
      muzikSes: next.muzikSes,
      efektSes: next.efektSes,
      dokunmatikKontroller: next.dokunmatikKontroller,
      bildirimler: next.bildirimler,
      titreSimdilik: next.titreSimdilik,
      tusAtamalari: next.tusAtamalari,
    });

    set(payload);
  },
}));
