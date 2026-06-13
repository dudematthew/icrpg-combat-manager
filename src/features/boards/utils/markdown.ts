import MarkdownIt from "markdown-it";
import taskLists from "markdown-it-task-lists";
import DOMPurify from "dompurify";
import {
  getTaskLineIndices,
  injectTaskLineAttributes,
  countRenderedTaskItems,
} from "./taskList";
import { stripMarkdownComments } from "./stripMarkdownComments";

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
}).use(taskLists, { enabled: true, label: false });

export function renderMarkdown(src: string): string {
  if (!src.trim()) return "";
  const cleaned = stripMarkdownComments(src);
  if (!cleaned.trim()) return "";
  const taskLines = getTaskLineIndices(cleaned);
  let html = md.render(cleaned);

  if (taskLines.length > 0 && countRenderedTaskItems(html) === taskLines.length) {
    html = injectTaskLineAttributes(html, taskLines);
  }

  html = html.replace(/<img /g, '<img loading="lazy" decoding="async" ');

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["checked", "type", "data-task-line", "loading", "decoding"],
    ADD_URI_SAFE_ATTR: ["src"],
  });
}
