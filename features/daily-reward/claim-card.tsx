"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function DailyRewardClaim() {
  const [message, setMessage] = useState("");

  async function claim() {
    const response = await fetch("/api/progression/gunluk-odul", {
      method: "POST",
    });
    const data = await response.json();
    setMessage(data.mesaj ?? data.hata ?? "Bir işlem oluştu.");
  }

  return (
    <div className="space-y-4">
      <Button onClick={claim}>Bugünün ödülünü al</Button>
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
