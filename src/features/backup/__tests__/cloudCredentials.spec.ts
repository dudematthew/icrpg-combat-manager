import { describe, it, expect, beforeEach } from "vitest";
import {
  getCloudBackupState,
  setCloudCredentials,
  setActiveCloudSlug,
  linkCloudWriteToken,
  canUpdateActiveCloudBackup,
  clearCloudCredentials,
} from "../cloudCredentials";

describe("cloudCredentials", () => {
  beforeEach(() => {
    clearCloudCredentials();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("persists slug and writeToken in localStorage", () => {
    setCloudCredentials({ slug: "juggly-apple-terminator-cosmos", writeToken: "a".repeat(32) });
    const state = getCloudBackupState();
    expect(state?.activeSlug).toBe("juggly-apple-terminator-cosmos");
    expect(state?.writeToken).toBe("a".repeat(32));
    expect(canUpdateActiveCloudBackup()).toBe(true);
  });

  it("sets active slug without write token", () => {
    setActiveCloudSlug("super-earthy-monkey-jerky");
    const state = getCloudBackupState();
    expect(state?.activeSlug).toBe("super-earthy-monkey-jerky");
    expect(state?.writeToken).toBeUndefined();
    expect(canUpdateActiveCloudBackup()).toBe(false);
  });

  it("links write token to active slug", () => {
    setActiveCloudSlug("super-earthy-monkey-jerky");
    linkCloudWriteToken("super-earthy-monkey-jerky", "b".repeat(32));
    expect(canUpdateActiveCloudBackup()).toBe(true);
  });
});
