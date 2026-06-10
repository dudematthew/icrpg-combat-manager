import { describe, it, expect } from "vitest";
import MarkdownIt from "markdown-it";
import taskLists from "markdown-it-task-lists";
import {
  getTaskLineIndices,
  toggleTaskListLine,
  injectTaskLineAttributes,
  countRenderedTaskItems,
} from "../taskList";

const md = new MarkdownIt({ html: false, breaks: true }).use(taskLists, {
  enabled: true,
  label: false,
});

describe("taskList utils", () => {
  it("collects task line indices in source order", () => {
    const body = "- [ ] open\nplain line\n- [x] done\n  - [ ] nested";
    expect(getTaskLineIndices(body)).toEqual([0, 2, 3]);
  });

  it("toggles a task line by index", () => {
    const body = "- [ ] task\n- [x] done";
    expect(toggleTaskListLine(body, 0)).toBe("- [x] task\n- [x] done");
    expect(toggleTaskListLine(body, 1)).toBe("- [ ] task\n- [ ] done");
  });

  it("returns null for non-task lines", () => {
    expect(toggleTaskListLine("- plain\n", 0)).toBeNull();
    expect(toggleTaskListLine("- [ ] ok\n", 5)).toBeNull();
  });

  it("injects data-task-line matching markdown render order", () => {
    const body = "- [ ] a\n- [x] b\n  - [ ] nested";
    const html = md.render(body);
    const enriched = injectTaskLineAttributes(html, getTaskLineIndices(body));
    expect(enriched).toContain('data-task-line="0"');
    expect(enriched).toContain('data-task-line="1"');
    expect(enriched).toContain('data-task-line="2"');
    expect(countRenderedTaskItems(enriched)).toBe(3);
  });

  it("preserves task text including markdown inline formatting", () => {
    const body = "- [ ] **Wyprowadzić jeńców** przed świtem";
    const toggled = toggleTaskListLine(body, 0);
    expect(toggled).toBe("- [x] **Wyprowadzić jeńców** przed świtem");
  });
});
