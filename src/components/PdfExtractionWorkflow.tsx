import { useState } from "react";
import type LandingAIADE from "landingai-ade";
import BookExtractor from "./BookExtractor";

interface PdfExtractionWorkflowProps {
  client: LandingAIADE | null;
}

type ParseResponse = {
  chunks?: Array<{ markdown?: string }>;
};

const PdfExtractionWorkflow = ({ client }: PdfExtractionWorkflowProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "parsing">("idle");
  const [markdown, setMarkdown] = useState<string>("");
  const [parseError, setParseError] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setMarkdown("");
    setParseError("");
  };

  const handleParsePdf = async () => {
    if (!client) {
      setParseError(
        "ADE client is not ready yet. Please wait a moment and retry."
      );
      return;
    }

    if (!selectedFile) {
      setParseError("Please choose a document (PDF or PPTX) before parsing.");
      return;
    }

    try {
      setStatus("parsing");
      setParseError("");
      setMarkdown("");

      const parseFormData = new FormData();
      parseFormData.append("document", selectedFile);
      parseFormData.append("model", "dpt-2");

      const parseResponse: ParseResponse = await fetch("/api/ade/parse", {
        method: "POST",
        body: parseFormData,
      }).then(async (response) => {
        if (!response.ok) {
          const message = await response.text();
          throw new Error(`Parse request failed: ${message}`);
        }
        return response.json();
      });

      const parsedMarkdown =
        parseResponse.chunks
          ?.map((chunk) => chunk.markdown || "")
          .filter((chunkMarkdown) => chunkMarkdown.trim().length > 0)
          .join("\n\n") ?? "";

      if (!parsedMarkdown.trim()) {
        throw new Error(
          "Parsing completed but no markdown content was returned."
        );
      }

      setMarkdown(parsedMarkdown);
      setStatus("idle");
    } catch (err) {
      setStatus("idle");

      if (err instanceof Error) {
        setParseError(err.message);
      } else {
        setParseError("An unknown error occurred while parsing the document.");
      }
    }
  };

  return (
    <section className="workflow-panel">
      <header>
        <h2>Document Parsing & Extraction Workflow</h2>
        <p>
          Upload a PDF or PPTX, let ADE convert it to markdown, and then extract
          structured book metadata using the Book schema powered by Zod.
        </p>
      </header>

      <div className="workflow-grid">
        <div className="workflow-step">
          <h3>1. Upload & Parse Document</h3>
          <input
            className="inputbutton"
            type="file"
            accept="application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={handleFileChange}
            disabled={status !== "idle"}
          />
          {selectedFile && (
            <p className="file-hint">
              Selected: <strong>{selectedFile.name}</strong> ({" "}
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </p>
          )}
          <button
            type="button"
            className="primary-btn"
            disabled={status !== "idle"}
            onClick={handleParsePdf}
          >
            {status === "parsing" ? "Parsing Document..." : "Parse to Markdown"}
          </button>
          {parseError && <p className="workflow-error">⚠️ {parseError}</p>}
        </div>

        <div className="workflow-step">
          <h3>2. Markdown Preview</h3>
          {markdown ? (
            <pre className="markdown-preview">{markdown.slice(0, 1200)}</pre>
          ) : (
            <p className="placeholder-text">
              Parse a document to view the generated markdown excerpt.
            </p>
          )}
        </div>

        <div className="workflow-step">
          <h3>3. Extract Book Metadata</h3>
          {markdown ? (
            <BookExtractor
              markdownContent={markdown}
              onExtractionSuccess={(book) =>
                console.log("Extracted book:", book)
              }
              onExtractionError={(err) =>
                console.error("Extraction error:", err)
              }
              buttonText="Extract Book Data"
              showResult={true}
            />
          ) : (
            <p className="placeholder-text">
              Parse a document first to enable book metadata extraction.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default PdfExtractionWorkflow;
