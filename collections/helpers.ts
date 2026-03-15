import { cosmeticsCatalog } from "@/data/cosmetics";
import type { OwnedCosmetic } from "@/types";

export function buildCollectionEntries(owned: OwnedCosmetic[]) {
  return cosmeticsCatalog.map((cosmetic) => {
    const userEntry = owned.find((entry) => entry.cosmeticId === cosmetic.id);

    return {
      ...cosmetic,
      sahip: Boolean(userEntry),
      secili: userEntry?.secili ?? false,
      yeni: userEntry?.yeni ?? false,
      favori: userEntry?.favori ?? false,
      acildi: userEntry?.acildi,
    };
  });
}

export function getCollectionCompletion(owned: OwnedCosmetic[]) {
  return Math.round((owned.length / cosmeticsCatalog.length) * 100);
}
