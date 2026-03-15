"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { Textarea } from "@/components/ui/textarea";

function StatusLine({ text }: { text: string }) {
  return text ? <p className="text-sm text-muted">{text}</p> : null;
}

export function AccountPanel({
  email,
  emailVerified,
}: {
  email: string;
  emailVerified: boolean;
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [passwordStatus, setPasswordStatus] = useState("");
  const [dataStatus, setDataStatus] = useState("");
  const [resetText, setResetText] = useState("");

  async function changePassword(formData: FormData) {
    setPasswordStatus("Parola güncelleniyor...");
    const response = await fetch("/api/account/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword: String(formData.get("currentPassword") ?? ""),
        newPassword: String(formData.get("newPassword") ?? ""),
      }),
    });
    const data = await response.json();
    setPasswordStatus(data.mesaj ?? data.hata ?? "Bir işlem oluştu.");
  }

  async function exportData() {
    setDataStatus("Kayıt dosyası hazırlanıyor...");
    const response = await fetch("/api/account/export");
    const data = await response.json();
    if (!response.ok) {
      setDataStatus(data.hata ?? "Dışa aktarma başarısız oldu.");
      return;
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `lunara-kayit-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setDataStatus("Kayıt dosyası indirildi.");
  }

  async function importData(file: File) {
    setDataStatus("Kayıt dosyası içe aktarılıyor...");
    const text = await file.text();
    const response = await fetch("/api/account/import", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: text,
    });
    const data = await response.json();
    setDataStatus(data.mesaj ?? data.hata ?? "Bir işlem oluştu.");
    if (response.ok) {
      router.refresh();
    }
  }

  async function resetProgress() {
    setDataStatus("İlerleme sıfırlanıyor...");
    const response = await fetch("/api/account/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        onay: resetText,
      }),
    });
    const data = await response.json();
    setDataStatus(data.mesaj ?? data.hata ?? "Bir işlem oluştu.");
    if (response.ok) {
      setResetText("");
      router.refresh();
    }
  }

  async function signOut() {
    await fetch("/api/auth/cikis", {
      method: "POST",
    });
    router.push("/giris-yap");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel className="p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-soft">Güvenlik</p>
          <h3 className="mt-3 font-display text-3xl">Hesap durumu</h3>
          <div className="mt-5 space-y-3 text-sm text-muted">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              E-posta: {email}
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              Doğrulama: {emailVerified ? "Tamamlandı" : "Bekliyor"}
            </div>
          </div>
          <Button className="mt-5" variant="ghost" onClick={signOut}>
            Güvenli çıkış yap
          </Button>
        </Panel>

        <Panel className="p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-soft">Parola yönetimi</p>
          <h3 className="mt-3 font-display text-3xl">Erişimi yenile</h3>
          <form action={changePassword} className="mt-5 space-y-4">
            <Input
              type="password"
              name="currentPassword"
              placeholder="Mevcut parola"
            />
            <Input type="password" name="newPassword" placeholder="Yeni parola" />
            <Button>Parolayı güncelle</Button>
            <StatusLine text={passwordStatus} />
          </form>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel className="p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-soft">Kayıt yönetimi</p>
          <h3 className="mt-3 font-display text-3xl">Verini dışa aktar</h3>
          <p className="mt-3 text-sm leading-7 text-muted">
            Profil, progression, görevler, başarımlar, kozmetikler ve son seansların tek JSON kaydında saklanır.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={exportData}>Kayıt dosyasını indir</Button>
            <Button variant="ghost" onClick={() => fileRef.current?.click()}>
              Kayıt dosyasını içe aktar
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void importData(file);
                }
              }}
            />
          </div>
          <StatusLine text={dataStatus} />
        </Panel>

        <Panel className="p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-soft">Sıfırlama</p>
          <h3 className="mt-3 font-display text-3xl">İlerlemeyi temizle</h3>
          <p className="mt-3 text-sm leading-7 text-muted">
            Hesabın korunur; ancak seviye, istatistik, görev, başarım ve kayıtlı seanslar temizlenir. Onay metni olarak
            <span className="font-semibold text-[var(--text)]"> LUNARA SIFIRLA</span> yaz.
          </p>
          <Textarea
            className="mt-5"
            value={resetText}
            onChange={(event) => setResetText(event.target.value)}
            placeholder="LUNARA SIFIRLA"
          />
          <Button
            className="mt-4"
            variant="danger"
            onClick={resetProgress}
            disabled={resetText !== "LUNARA SIFIRLA"}
          >
            İlerlemeyi sıfırla
          </Button>
        </Panel>
      </div>
    </div>
  );
}
