import { describe, it, expect } from "vitest";
import { renderMarkdown } from "../markdown";

describe("renderMarkdown", () => {
  it("returns empty string for blank input", () => {
    expect(renderMarkdown("")).toBe("");
    expect(renderMarkdown("   ")).toBe("");
  });

  it("renders headings and bold", () => {
    const html = renderMarkdown("# Title\n\n**bold** text");
    expect(html).toContain("<h1>");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("strips script tags", () => {
    const html = renderMarkdown('<script>alert("x")</script>hello');
    expect(html).not.toContain("<script");
    expect(html).toContain("hello");
  });

  it("renders lists", () => {
    const html = renderMarkdown("- one\n- two");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>");
  });
});
