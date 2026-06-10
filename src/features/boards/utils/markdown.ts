import MarkdownIt from "markdown-it";
import taskLists from "markdown-it-task-lists";
import DOMPurify from "dompurify";
import {
  getTaskLineIndices,
  injectTaskLineAttributes,
  countRenderedTaskItems,
} from "./taskList";

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true,
}).use(taskLists, { enabled: true, label: false });

export function renderMarkdown(src: string): string {
  if (!src.trim()) return "";
  const taskLines = getTaskLineIndices(src);
  let html = md.render(src);

  if (taskLines.length > 0 && countRenderedTaskItems(html) === taskLines.length) {
    html = injectTaskLineAttributes(html, taskLines);
  }

  return DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["checked", "type", "data-task-line"],
  });
}
