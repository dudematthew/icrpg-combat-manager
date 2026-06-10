import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
});

export function renderMarkdown(src: string): string {
  if (!src.trim()) return "";
  const html = md.render(src);
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
}
