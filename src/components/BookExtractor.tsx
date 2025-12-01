import { useState } from "react";
import {
  DocumentExtractionSchema,
  type DocumentExtraction,
} from "../schema/books";
import { z } from "zod";
import { downloadMarkdown } from "../utils/exportMarkdown";

/**
 * BookExtractor - A reusable component for extracting structured document metadata
 * from markdown content using the ADE extract endpoint and Zod schema validation.
 *
 * This component extracts book metadata: title, authors, year, genres, pages, language, and publisher.
 */

interface BookExtractorProps {
  /** Markdown content to extract document metadata from */
  markdownContent: string;
  /** Callback fired when extraction succeeds with the extracted data */
  onExtractionSuccess?: (data: DocumentExtraction) => void;
  /** Callback fired when extraction fails with error message */
  onExtractionError?: (error: string) => void;
  /** Optional custom schema - defaults to DocumentExtractionSchema */
  schema?: z.ZodType<DocumentExtraction>;
  /** Optional button text - defaults to "Extract Document Data" */
  buttonText?: string;
  /** Whether to show the extracted result in the component itself */
  showResult?: boolean;
}

type ExtractResponse = {
  extraction?: unknown;
};

const BookExtractor = ({
  markdownContent,
  onExtractionSuccess,
  onExtractionError,
  schema = DocumentExtractionSchema,
  buttonText = "Extract Document Data",
  showResult = true,
}: BookExtractorProps) => {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedBook, setExtractedBook] = useState<DocumentExtraction | null>(
    null
  );
  const [extractedMarkdown, setExtractedMarkdown] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Convert Zod schema to JSON Schema for ADE API
  const schemaJson = JSON.stringify({
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Main title of the document",
      },
      authors: {
        type: "array",
        items: { type: "string" },
        description: "List of author names",
      },
      publishedYear: {
        type: "integer",
        description: "Year of publication",
      },
      genres: {
        type: "array",
        items: { type: "string" },
        description: "Book genres/categories",
      },
      pages: {
        type: "integer",
        description: "Number of pages",
      },
      language: {
        type: "string",
        description: "Language of the document (e.g., English, Spanish)",
      },
      publisher: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Publisher company name",
          },
          location: {
            type: "string",
            description: "Publisher location (city, country)",
          },
        },
        description: "Publisher information",
      },
    },
  });

  const handleExtract = async () => {
    if (!markdownContent || markdownContent.trim().length === 0) {
      const errorMsg = "No markdown content provided for extraction.";
      setError(errorMsg);
      onExtractionError?.(errorMsg);
      return;
    }

    try {
      setIsExtracting(true);
      setError("");
      setExtractedBook(null);

      console.log("Markdown content length:", markdownContent.length);
      console.log(
        "First 500 chars of markdown:",
        markdownContent.substring(0, 500)
      );

      // Prepare FormData for the ADE extract endpoint
      const extractFormData = new FormData();
      extractFormData.append("schema", schemaJson);
      extractFormData.append("markdown", markdownContent); // Send as string, not File
      extractFormData.append("model", "extract-latest"); // Use latest extraction model

      console.log("Sending extraction request with schema");

      // Call ADE extract endpoint
      const extractResponse: ExtractResponse = await fetch("/api/ade/extract", {
        method: "POST",
        body: extractFormData,
      }).then(async (response) => {
        if (!response.ok) {
          const message = await response.text();
          throw new Error(`Extract request failed: ${message}`);
        }
        return response.json();
      });

      console.log("Full API response:", extractResponse);

      // Validate the extraction response
      if (!extractResponse.extraction) {
        console.error("No extraction field in response");
        throw new Error("ADE returned an empty extraction result.");
      }

      console.log("Raw extraction response:", extractResponse.extraction);
      console.log("Extraction type:", typeof extractResponse.extraction);
      console.log(
        "Extraction keys:",
        Object.keys(extractResponse.extraction || {})
      );

      // Parse and validate against Zod schema using safeParse for better error handling
      const parseResult = schema.safeParse(extractResponse.extraction);

      if (!parseResult.success) {
        console.error("Validation errors:", parseResult.error.issues);
        throw new Error(
          `Schema validation failed: ${parseResult.error.issues
            .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
            .join(", ")}`
        );
      }

      const parsedBook = parseResult.data;

      setExtractedBook(parsedBook);
      setExtractedMarkdown(markdownContent);
      onExtractionSuccess?.(parsedBook);
      setIsExtracting(false);
    } catch (err) {
      setIsExtracting(false);

      let errorMessage: string;
      if (err instanceof z.ZodError) {
        errorMessage = `Schema validation failed: ${err.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(", ")}`;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else {
        errorMessage = "An unknown error occurred during extraction.";
      }

      setError(errorMessage);
      onExtractionError?.(errorMessage);
    }
  };

  return (
    <div className="book-extractor">
      <button
        type="button"
        className="primary-btn"
        onClick={handleExtract}
        disabled={isExtracting || !markdownContent.trim()}
      >
        {isExtracting ? "Extracting..." : buttonText}
      </button>

      {error && (
        <div className="extraction-error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {showResult && extractedBook && (
        <div className="extraction-result">
          <h4>✅ Extraction Successful</h4>
          <div className="extracted-fields">
            {extractedBook.title && (
              <p>
                <strong>Title:</strong> {extractedBook.title}
              </p>
            )}
            {extractedBook.authors && extractedBook.authors.length > 0 && (
              <p>
                <strong>Authors:</strong> {extractedBook.authors.join(", ")}
              </p>
            )}
            {extractedBook.publishedYear && (
              <p>
                <strong>Published Year:</strong> {extractedBook.publishedYear}
              </p>
            )}
            {extractedBook.pages && (
              <p>
                <strong>Pages:</strong> {extractedBook.pages}
              </p>
            )}
            {extractedBook.language && (
              <p>
                <strong>Language:</strong> {extractedBook.language}
              </p>
            )}
            {extractedBook.publisher && (
              <p>
                <strong>Publisher:</strong> {extractedBook.publisher.name}
                {extractedBook.publisher.location &&
                  ` (${extractedBook.publisher.location})`}
              </p>
            )}
            {extractedBook.genres && extractedBook.genres.length > 0 && (
              <p>
                <strong>Genres:</strong> {extractedBook.genres.join(", ")}
              </p>
            )}
          </div>
          <button
            type="button"
            className="export-btn"
            onClick={() => downloadMarkdown(extractedBook, extractedMarkdown)}
          >
            📥 Export as Markdown
          </button>
        </div>
      )}
    </div>
  );
};

export default BookExtractor;
