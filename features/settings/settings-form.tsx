"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { defaultSettings } from "@/data/showcase";
import { useSettingsStore } from "@/store/settings-store";
import { useThemeStore } from "@/store/theme-store";
import type { ThemePresetId } from "@/theme/presets";
import type { UserSettingsSnapshot } from "@/types";

const keyBindingFields = [
  { id: "sola", etiket: "Sola kaydır", aciklama: "Parçayı bir sütun sola taşır." },
  { id: "saga", etiket: "Sağa kaydır", aciklama: "Parçayı bir sütun sağa taşır." },
  { id: "yumusakBirak", etiket: "Yumuşak bırak", aciklama: "Parçayı kontrollü biçimde aşağı iter." },
  { id: "sertBirak", etiket: "Sert bırak", aciklama: "Parçayı anında zemine indirir." },
  { id: "saatYonunde", etiket: "Saat yönünde döndür", aciklama: "Parçayı sağa doğru döndürür." },
  { id: "tersYon", etiket: "Ters yönde döndür", aciklama: "Parçayı sola doğru döndürür." },
  { id: "beklet", etiket: "Beklet", aciklama: "Hold alanına parça taşır." },
  { id: "duraklat", etiket: "Duraklat", aciklama: "Seansı duraklatır ya da sürdürür." },
] as const;

function formatKeyCode(code: string) {
  const mapping: Record<string, string> = {
    ArrowLeft: "Sol Ok",
    ArrowRight: "Sağ Ok",
    ArrowDown: "Aşağı Ok",
    ArrowUp: "Yukarı Ok",
    Space: "Boşluk",
    Escape: "Esc",
    ShiftLeft: "Sol Shift",
    ShiftRight: "Sağ Shift",
    ControlLeft: "Sol Ctrl",
    ControlRight: "Sağ Ctrl",
    Enter: "Enter",
  };

  if (mapping[code]) {
    return mapping[code];
  }

  if (code.startsWith("Key")) {
    return code.slice(3);
  }

  if (code.startsWith("Digit")) {
    return code.slice(5);
  }

  return code;
}

export function SettingsForm({ initialSettings }: { initialSettings: UserSettingsSnapshot }) {
  const [status, setStatus] = useState("");
  const [local, setLocal] = useState(initialSettings);
  const [capturingKey, setCapturingKey] = useState<string | null>(null);
  const patch = useSettingsStore((state) => state.patch);
  const setMode = useThemeStore((state) => state.setMode);
  const setPreset = useThemeStore((state) => state.setPreset);

  function update<K extends keyof UserSettingsSnapshot>(
    key: K,
    value: UserSettingsSnapshot[K],
  ) {
    setLocal((current) => ({ ...current, [key]: value }));
  }

  useEffect(() => {
    if (!capturingKey) {
      return;
    }

    const bindingField = keyBindingFields.find((entry) => entry.id === capturingKey);
    if (!bindingField) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      const conflict = Object.entries(local.tusAtamalari).find(
        ([action, code]) => action !== capturingKey && code === event.code,
      );

      if (conflict) {
        const conflictLabel =
          keyBindingFields.find((entry) => entry.id === conflict[0])?.etiket ?? conflict[0];
        setStatus(`${formatKeyCode(event.code)} zaten "${conflictLabel}" için kullanılıyor.`);
        setCapturingKey(null);
        return;
      }

      update("tusAtamalari", {
        ...local.tusAtamalari,
        [capturingKey]: event.code,
      });
      setStatus(`${bindingField.etiket} için ${formatKeyCode(event.code)} atandı.`);
      setCapturingKey(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [capturingKey, local.tusAtamalari]);

  async function save() {
    setStatus("Kaydediliyor...");
    const response = await fetch("/api/settings", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(local),
    });

    const data = await response.json();
    if (response.ok) {
      patch(local);
      setMode(local.temaModu);
      setPreset(local.temaPaketi as ThemePresetId);
    }
    setStatus(data.mesaj ?? data.hata ?? "Bir işlem oluştu.");
  }

  function resetBindings() {
    update("tusAtamalari", defaultSettings.tusAtamalari);
    setStatus("Tuş atamaları varsayılan düzene döndürüldü.");
    setCapturingKey(null);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold">Ana ses</p>
          <Input
            type="range"
            min={0}
            max={100}
            value={local.anaSes}
            onChange={(event) => update("anaSes", Number(event.target.value))}
            className="mt-4"
          />
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold">Müzik sesi</p>
          <Input
            type="range"
            min={0}
            max={100}
            value={local.muzikSes}
            onChange={(event) => update("muzikSes", Number(event.target.value))}
            className="mt-4"
          />
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold">Efekt sesi</p>
          <Input
            type="range"
            min={0}
            max={100}
            value={local.efektSes}
            onChange={(event) => update("efektSes", Number(event.target.value))}
            className="mt-4"
          />
        </div>
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4">
          <p className="text-sm font-semibold">Tema paketi</p>
          <select
            value={local.temaPaketi}
            onChange={(event) => update("temaPaketi", event.target.value)}
            className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
          >
            <option value="gece-cicegi">Gece Çiçeği</option>
            <option value="kutup-isiltisi">Kutup Işıltısı</option>
            <option value="amber-gecesi">Amber Gecesi</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["azaltIlkHareket", "Azaltılmış hareket"],
          ["yuksekKontrast", "Yüksek kontrast"],
          ["dokunmatikKontroller", "Dokunmatik kontroller"],
          ["bildirimler", "Bildirimler"],
        ].map(([key, label]) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-[1.75rem] border border-white/10 bg-white/5 p-4"
          >
            <p className="text-sm font-semibold">{label}</p>
            <Switch
              checked={Boolean(local[key as keyof UserSettingsSnapshot])}
              onToggle={() =>
                update(
                  key as keyof UserSettingsSnapshot,
                  !Boolean(local[key as keyof UserSettingsSnapshot]) as never,
                )
              }
            />
          </div>
        ))}
      </div>

      <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Tuş atamaları</p>
            <p className="mt-1 text-sm text-muted">
              Bir aksiyonu seç ve yeni tuşa bas. Aynı tuş iki farklı eylemde kullanılamaz.
            </p>
          </div>
          <Button variant="ghost" onClick={resetBindings}>
            Varsayılan düzene dön
          </Button>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {keyBindingFields.map((field) => {
            const isCapturing = capturingKey === field.id;

            return (
              <div
                key={field.id}
                className="rounded-[1.5rem] border border-white/10 bg-[rgba(255,255,255,0.04)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{field.etiket}</p>
                    <p className="mt-1 text-xs leading-6 text-muted">{field.aciklama}</p>
                  </div>
                  <Button
                    type="button"
                    variant={isCapturing ? "primary" : "subtle"}
                    onClick={() => setCapturingKey(isCapturing ? null : field.id)}
                  >
                    {isCapturing
                      ? "Tuş bekleniyor..."
                      : formatKeyCode(local.tusAtamalari[field.id] ?? "")}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted">{status}</p>
        <Button onClick={save}>Ayarları kaydet</Button>
      </div>
    </div>
  );
}
