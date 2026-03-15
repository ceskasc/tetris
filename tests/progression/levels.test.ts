import { describe, expect, it } from "vitest";

import { calculateSessionXp, getLevelFromXp } from "@/progression/levels";

describe("progression", () => {
  it("oyun özetinden xp hesaplar", () => {
    const xp = calculateSessionXp({
      mod: "klasik",
      skor: 55000,
      satir: 28,
      sureMs: 480000,
      comboEnYuksek: 6,
      level: 4,
      perfectClear: 1,
      backToBack: 3,
      hatalar: 1,
    });

    expect(xp).toBeGreaterThan(0);
  });

  it("xp değerinden seviye çıkarır", () => {
    expect(getLevelFromXp(0)).toBe(1);
    expect(getLevelFromXp(1200)).toBeGreaterThan(1);
  });
});
