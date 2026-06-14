import { describe, it, expect } from "vitest";
import {
  buildImageMarkdown,
  insertTextAtSelection,
  isAllowedImageUrl,
  normalizeImageUrl,
} from "../markdownInsert";

describe("markdownInsert", () => {
  it("builds image markdown", () => {
    expect(buildImageMarkdown("https://example.com/a.png", "map")).toBe(
      "![map](https://example.com/a.png)",
    );
  });

  it("inserts markdown at selection with spacing", () => {
    expect(normalizeImageUrl("example.com/map.png")).toBe("https://example.com/map.png");
    expect(normalizeImageUrl("https://example.com/map.png")).toBe("https://example.com/map.png");
  });

  it("allows http(s) and site-relative paths", () => {
    expect(isAllowedImageUrl("https://example.com/a.png")).toBe(true);
    expect(isAllowedImageUrl("/images/foo.png")).toBe(true);
    expect(isAllowedImageUrl("javascript:alert(1)")).toBe(false);
  });

  it("inserts markdown at selection with spacing", () => {
    const { text } = insertTextAtSelection(
      "Hello",
      5,
      5,
      "![pic](https://example.com/pic.png)",
    );
    expect(text).toBe("Hello\n\n![pic](https://example.com/pic.png)");
  });
});
