/** Remove HTML comments from markdown before preview render. Write tab keeps them. */
export function stripMarkdownComments(src: string): string {
  return src.replace(/<!--[\s\S]*?-->/g, "");
}
