"use client";

import { create } from "zustand";

import { themePresets, type ThemePresetId } from "@/theme/presets";
import { readJsonStorage, writeJsonStorage } from "@/utils/storage";
import type { ThemeMode } from "@/types";

type ThemeStore = {
  mode: ThemeMode;
  preset: ThemePresetId;
  hydrated: boolean;
  hydrate: () => void;
  setMode: (mode: ThemeMode) => void;
  setPreset: (preset: ThemePresetId) => void;
};

const STORAGE_KEY = "lunara-theme";

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: "gece",
  preset: "gece-cicegi",
  hydrated: false,
  hydrate: () => {
    const saved = readJsonStorage<{ mode: ThemeMode; preset: ThemePresetId }>(
      STORAGE_KEY,
      {
        mode: "gece",
        preset: "gece-cicegi",
      },
    );

    set({
      ...saved,
      hydrated: true,
    });
  },
  setMode: (mode) => {
    writeJsonStorage(STORAGE_KEY, {
      mode,
      preset: useThemeStore.getState().preset,
    });
    set({ mode });
  },
  setPreset: (preset) => {
    if (!(preset in themePresets)) {
      return;
    }

    writeJsonStorage(STORAGE_KEY, {
      mode: useThemeStore.getState().mode,
      preset,
    });
    set({ preset });
  },
}));
