import type { DocumentExtraction } from "../schema/books";

/**
 * Generates a sanitized filename from a title string
 * Converts to lowercase, removes special characters, replaces spaces with hyphens
 */
function sanitizeFilename(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim();
}

/**
 * Formats the current date as YYYY-MM-DD
 */
function formatDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Generates markdown content from extracted book data
 */
export function generateMarkdownContent(
  data: DocumentExtraction,
  fullMarkdown?: string
): string {
  const sections: string[] = [];

  // Title
  if (data.title) {
    sections.push(`# ${data.title}\n`);
  }

  // Metadata section
  sections.push("## Metadata\n");

  if (data.authors && data.authors.length > 0) {
    sections.push(`**Authors:** ${data.authors.join(", ")}\n`);
  }

  if (data.publishedYear) {
    sections.push(`**Published Year:** ${data.publishedYear}\n`);
  }

  if (data.pages) {
    sections.push(`**Pages:** ${data.pages}\n`);
  }

  if (data.language) {
    sections.push(`**Language:** ${data.language}\n`);
  }

  if (data.publisher) {
    const publisherParts: string[] = [];
    if (data.publisher.name) {
      publisherParts.push(data.publisher.name);
    }
    if (data.publisher.location) {
      publisherParts.push(`(${data.publisher.location})`);
    }
    if (publisherParts.length > 0) {
      sections.push(`**Publisher:** ${publisherParts.join(" ")}\n`);
    }
  }

  if (data.genres && data.genres.length > 0) {
    sections.push(`**Genres:** ${data.genres.join(", ")}\n`);
  }

  // Extraction info
  sections.push(`\n---\n`);
  sections.push(`*Extracted on: ${new Date().toLocaleString()}*\n`);
  sections.push(`*Extraction method: ADE PDF Parse & Extract*\n`);

  // Include full markdown content if provided
  if (fullMarkdown && fullMarkdown.trim()) {
    sections.push(`\n---\n`);
    sections.push(`## Document Content\n`);
    sections.push(fullMarkdown);
  }

  return sections.join("\n");
}

/**
 * Generates a filename for the markdown export
 * Format: YYYY-MM-DD-title-of-book.md
 */
export function generateFilename(data: DocumentExtraction): string {
  const date = formatDate();
  const titlePart = data.title
    ? sanitizeFilename(data.title)
    : "untitled-document";
  return `${date}-${titlePart}.md`;
}

/**
 * Triggers a browser download of the markdown file
 */
export function downloadMarkdown(
  data: DocumentExtraction,
  fullMarkdown?: string
): void {
  const content = generateMarkdownContent(data, fullMarkdown);
  const filename = generateFilename(data);

  // Create a blob with the markdown content
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });

  // Create a temporary download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;

  // Trigger the download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
