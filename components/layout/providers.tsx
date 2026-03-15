"use client";

import { useEffect } from "react";

import { useSettingsStore } from "@/store/settings-store";
import { useThemeStore } from "@/store/theme-store";
import { themePresets } from "@/theme/presets";

export function Providers({ children }: { children: React.ReactNode }) {
  const hydrateTheme = useThemeStore((state) => state.hydrate);
  const hydrateSettings = useSettingsStore((state) => state.hydrate);
  const preset = useThemeStore((state) => state.preset);

  useEffect(() => {
    hydrateTheme();
    hydrateSettings();
  }, [hydrateSettings, hydrateTheme]);

  useEffect(() => {
    document.body.classList.remove(
      "theme-gece-cicegi",
      "theme-kutup-isiltisi",
      "theme-amber-gecesi",
    );
    document.body.classList.add(themePresets[preset].sinif);
  }, [preset]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js");
    }
  }, []);

  return children;
}
