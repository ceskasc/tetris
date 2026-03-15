import { notFound } from "next/navigation";

import { GameExperience } from "@/components/game/game-experience";
import { modeDefinitions } from "@/data/modes";

export default async function GamePage({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode } = await params;
  const modeDefinition = modeDefinitions.find((entry) => entry.id === mode);

  if (!modeDefinition) {
    notFound();
  }

  return (
    <GameExperience
      mode={modeDefinition.id}
      baslik={modeDefinition.ad}
      aciklama={modeDefinition.slogan}
    />
  );
}
