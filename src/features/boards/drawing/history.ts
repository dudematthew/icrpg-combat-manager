import type { DrawingDocument } from "./types";
import { cloneDrawingDocument } from "./types";

export class DrawingHistory {
  private undoStack: DrawingDocument[] = [];
  private redoStack: DrawingDocument[] = [];
  private current: DrawingDocument;

  constructor(initial: DrawingDocument) {
    this.current = cloneDrawingDocument(initial);
    this.undoStack.push(cloneDrawingDocument(initial));
  }

  get document(): DrawingDocument {
    return this.current;
  }

  canUndo(): boolean {
    return this.undoStack.length > 1;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  replace(doc: DrawingDocument, record = true): void {
    this.current = cloneDrawingDocument(doc);
    if (record) {
      this.undoStack.push(cloneDrawingDocument(doc));
      this.redoStack = [];
    }
  }

  push(doc: DrawingDocument): void {
    this.current = cloneDrawingDocument(doc);
    this.undoStack.push(cloneDrawingDocument(doc));
    this.redoStack = [];
  }

  undo(): DrawingDocument | null {
    if (!this.canUndo()) return null;
    this.redoStack.push(this.undoStack.pop()!);
    this.current = cloneDrawingDocument(this.undoStack[this.undoStack.length - 1]);
    return this.current;
  }

  redo(): DrawingDocument | null {
    if (!this.canRedo()) return null;
    const next = this.redoStack.pop()!;
    this.undoStack.push(cloneDrawingDocument(next));
    this.current = cloneDrawingDocument(next);
    return this.current;
  }

  reset(initial: DrawingDocument): void {
    this.current = cloneDrawingDocument(initial);
    this.undoStack = [cloneDrawingDocument(initial)];
    this.redoStack = [];
  }
}
