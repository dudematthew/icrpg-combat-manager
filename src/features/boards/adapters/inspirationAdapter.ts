import type { CardPayload } from "../types";

export function deployInspirationPayload(data: { category: string; text: string }): void {
  navigator.clipboard.writeText(data.text);
}

export function captureInspirationPayload(category: string, text: string): CardPayload {
  return { v: 1, kind: "inspiration", data: { category, text } };
}
