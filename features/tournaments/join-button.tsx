"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function TournamentJoinButton({ slug }: { slug: string }) {
  const [message, setMessage] = useState("");

  async function join() {
    const response = await fetch(`/api/tournaments/${slug}/join`, {
      method: "POST",
    });
    const data = await response.json();
    setMessage(data.mesaj ?? data.hata ?? "Bir işlem oluştu.");
  }

  return (
    <div className="space-y-3">
      <Button onClick={join}>Katılımı tamamla</Button>
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
