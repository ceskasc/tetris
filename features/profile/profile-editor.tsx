"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ProfileEditor({
  gorunenAd,
  bio,
  unvan,
}: {
  gorunenAd: string;
  bio: string;
  unvan: string;
}) {
  const [status, setStatus] = useState("");

  async function onSubmit(formData: FormData) {
    setStatus("Kaydediliyor...");
    const response = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gorunenAd: String(formData.get("gorunenAd") ?? ""),
        bio: String(formData.get("bio") ?? ""),
        unvan: String(formData.get("unvan") ?? ""),
      }),
    });

    const data = await response.json();
    setStatus(data.mesaj ?? data.hata ?? "Bir işlem oluştu.");
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <Input name="gorunenAd" defaultValue={gorunenAd} placeholder="Görünen ad" />
      <Input name="unvan" defaultValue={unvan} placeholder="Unvan" />
      <Textarea name="bio" defaultValue={bio} placeholder="Kısa biyografin" />
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{status}</p>
        <Button>Profili kaydet</Button>
      </div>
    </form>
  );
}
