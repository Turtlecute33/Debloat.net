/**
 * Turns a script or category name into plain text for an accessible name, because screen readers
 * read markdown markers such as `**` and backticks aloud. It removes only the inline syntax that
 * names use: bold, inline code and links.
 */
export function removeMarkdownFormatting(markdown: string): string {
  return markdown
    .replaceAll(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Keeps the text of `[text](url)` links
    .replaceAll(/\*\*|`/g, '');
}
