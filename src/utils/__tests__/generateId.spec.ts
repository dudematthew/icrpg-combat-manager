import { describe, it, expect, vi, afterEach } from "vitest";
import { generateId } from "../generateId";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe("generateId", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns a UUID v4 string", () => {
    expect(generateId()).toMatch(UUID_REGEX);
  });

  it("returns unique values", () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateId()));
    expect(ids.size).toBe(50);
  });

  it("uses fallback when randomUUID throws", () => {
    vi.spyOn(crypto, "randomUUID").mockImplementation(() => {
      throw new Error("Not secure context");
    });
    expect(generateId()).toMatch(UUID_REGEX);
  });
});
