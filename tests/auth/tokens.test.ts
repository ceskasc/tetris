import { describe, expect, it } from "vitest";

import { createOpaqueToken, hashOpaqueToken } from "@/auth/tokens";

describe("auth tokenları", () => {
  it("kararlı bir hash üretir", () => {
    const token = createOpaqueToken();
    expect(hashOpaqueToken(token)).toBe(hashOpaqueToken(token));
  });
});
