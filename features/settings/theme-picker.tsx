"use client";

import { useThemeStore } from "@/store/theme-store";
import { themePresets } from "@/theme/presets";
import { Button } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";

export function ThemePicker() {
  const preset = useThemeStore((state) => state.preset);
  const setPreset = useThemeStore((state) => state.setPreset);

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {Object.entries(themePresets).map(([id, theme]) => (
        <Panel key={id} className="p-5">
          <p className="text-xs uppercase tracking-[0.24em] text-soft">Tema</p>
          <h3 className="mt-3 text-2xl font-semibold">{theme.ad}</h3>
          <p className="mt-3 text-sm leading-7 text-muted">{theme.aciklama}</p>
          <Button
            className="mt-5"
            variant={preset === id ? "primary" : "ghost"}
            onClick={() => setPreset(id as keyof typeof themePresets)}
          >
            {preset === id ? "Seçili" : "Bu temayı uygula"}
          </Button>
        </Panel>
      ))}
    </div>
  );
}
